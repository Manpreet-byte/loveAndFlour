import { env } from '../utils/env.js';
import { withTransaction } from '../utils/dbTx.js';
import { sha256 } from '../utils/crypto.js';
import { verifyRazorpayWebhookSignature } from '../services/payments/razorpayWebhook.js';
import { insertWebhookEvent, markWebhookProcessed } from '../models/webhookEventModel.js';
import { findPaymentByProviderOrder, markPaymentCaptured, markPaymentFailed } from '../models/paymentModel.js';
import { findOrderById, markOrderFailed, markOrderPaid } from '../models/orderModel.js';
import { fulfillPaidOrder } from '../services/payments/orderFulfillment.js';
import { recordCouponUsage } from '../models/couponModel.js';
import { getRequestAuditContext, logAuditEvent } from '../services/auditLogService.js';
import { notifyUser } from '../services/notificationService.js';

function parseJsonBody(rawBody) {
  try {
    return JSON.parse(rawBody.toString('utf8'));
  } catch {
    return null;
  }
}

function getRazorpayPaymentEntity(body) {
  return body?.payload?.payment?.entity ?? null;
}

export async function razorpayWebhook(req, res, next) {
  try {
    const rawBody = req.body; // Buffer via express.raw
    if (!Buffer.isBuffer(rawBody)) {
      return res.status(400).json({ error: { message: 'Invalid webhook body' } });
    }

    const signature = req.headers['x-razorpay-signature'];
    const ok = verifyRazorpayWebhookSignature({ rawBody, signatureHeader: signature });
    if (!ok) return res.status(401).json({ error: { message: 'Invalid signature' } });

    const body = parseJsonBody(rawBody);
    if (!body) return res.status(400).json({ error: { message: 'Invalid JSON' } });

    const eventType = String(body.event ?? '').trim();
    const eventId = body.id ? String(body.id) : null;
    const eventHash = sha256(rawBody);
    const payloadJson = rawBody.toString('utf8');

    const inserted = await insertWebhookEvent({
      provider: 'razorpay',
      eventId,
      eventHash,
      eventType,
      payloadJson,
    });

    // Idempotency: already received this exact event payload.
    if (!inserted) return res.json({ ok: true });

    // Process inside a DB tx to ensure order+payment+enrollment consistency.
    await withTransaction(async (conn) => {
      const entity = getRazorpayPaymentEntity(body);
      const providerOrderId = entity?.order_id ? String(entity.order_id) : null;
      const providerPaymentId = entity?.id ? String(entity.id) : null;
      const providerStatus = entity?.status ? String(entity.status) : null;
      const amountPaise = Number(entity?.amount ?? 0);
      const currency = entity?.currency ? String(entity.currency) : null;

      if (!providerOrderId) {
        await markWebhookProcessed(
          { provider: 'razorpay', eventHash, status: 'failed', errorMessage: 'Missing provider order_id' },
          { conn },
        );
        return;
      }

      const payment = await findPaymentByProviderOrder(
        { provider: 'razorpay', providerOrderId },
        { conn, forUpdate: true },
      );
      if (!payment) {
        await markWebhookProcessed(
          { provider: 'razorpay', eventHash, status: 'failed', errorMessage: 'Payment not found for provider order' },
          { conn },
        );
        return;
      }

      const order = await findOrderById({ orderId: payment.order_id }, { conn, forUpdate: true });
      if (!order) {
        await markWebhookProcessed(
          { provider: 'razorpay', eventHash, status: 'failed', errorMessage: 'Order not found for payment' },
          { conn },
        );
        return;
      }

      const rawPayloadJson = payloadJson;

      // Amount validation (Razorpay amounts are in smallest unit).
      if (currency && String(currency).toUpperCase() !== String(payment.currency).toUpperCase()) {
        await markWebhookProcessed(
          { provider: 'razorpay', eventHash, status: 'failed', errorMessage: 'Currency mismatch' },
          { conn },
        );
        return;
      }
      if (Number(amountPaise) !== Number(payment.amount_cents)) {
        await markWebhookProcessed(
          { provider: 'razorpay', eventHash, status: 'failed', errorMessage: 'Amount mismatch' },
          { conn },
        );
        return;
      }

      if (eventType === 'payment.captured' || providerStatus === 'captured') {
        await markPaymentCaptured(
          { paymentId: payment.id, providerPaymentId, providerSignature: null, rawPayloadJson },
          { conn },
        );
        await markOrderPaid({ orderId: order.id }, { conn });

        const [itemRows] = await conn.query(
          'SELECT item_type, course_id FROM order_items WHERE order_id = ? ORDER BY id ASC',
          [order.id],
        );
        await fulfillPaidOrder({ conn, order, orderItems: itemRows });

        if (order.coupon_id) {
          await recordCouponUsage({ couponId: order.coupon_id, userId: order.user_id, orderId: order.id }, { conn });
        }

        // In-app notification: payment success.
        notifyUser(
          {
            userId: order.user_id,
            notificationType: 'payment_confirmed',
            title: 'Payment confirmed',
            message: `Your order #${order.id} was confirmed. Your access is now unlocked.`,
            linkUrl: `/orders/${order.id}`,
            metadata: { order_id: order.id, provider: 'razorpay' },
          },
          { conn },
        ).catch(() => null);

        await markWebhookProcessed({ provider: 'razorpay', eventHash, status: 'processed' }, { conn });
        logAuditEvent({
          actorType: 'system',
          actorId: null,
          actionType: 'PAYMENT_CAPTURED',
          entityType: 'order',
          entityId: order.id,
          ...getRequestAuditContext(req),
          statusCode: 200,
          metadata: { provider: 'razorpay', provider_order_id: providerOrderId, provider_payment_id: providerPaymentId },
        });
        return;
      }

      if (eventType === 'payment.failed' || providerStatus === 'failed') {
        await markPaymentFailed({ paymentId: payment.id, rawPayloadJson }, { conn });
        await markOrderFailed({ orderId: order.id }, { conn });
        await markWebhookProcessed({ provider: 'razorpay', eventHash, status: 'processed' }, { conn });
        notifyUser(
          {
            userId: order.user_id,
            notificationType: 'payment_failed',
            title: 'Payment failed',
            message: `Your order #${order.id} payment failed. You can retry from your orders page.`,
            linkUrl: `/orders/${order.id}`,
            metadata: { order_id: order.id, provider: 'razorpay' },
          },
          { conn },
        ).catch(() => null);
        logAuditEvent({
          actorType: 'system',
          actorId: null,
          actionType: 'PAYMENT_FAILED',
          entityType: 'order',
          entityId: order.id,
          ...getRequestAuditContext(req),
          statusCode: 200,
          metadata: { provider: 'razorpay', provider_order_id: providerOrderId, provider_payment_id: providerPaymentId },
        });
        return;
      }

      // Unhandled event types: keep audit trail, but skip processing.
      await markWebhookProcessed({ provider: 'razorpay', eventHash, status: 'skipped' }, { conn });
    });

    // Unreachable (we always return above), but keep for clarity.
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}
