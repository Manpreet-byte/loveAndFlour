import { pool } from '../config/db.js';

function pickConn(conn) {
  return conn ?? pool;
}

export async function createPayment(
  { orderId, userId, provider, currency, amountCents, providerOrderId = null, status = 'initiated' },
  { conn } = {},
) {
  const db = pickConn(conn);
  const [result] = await db.query(
    `INSERT INTO payments
      (order_id, user_id, provider, status, currency, amount_cents, provider_order_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [orderId, userId, provider, status, currency, amountCents, providerOrderId],
  );
  return result.insertId;
}

export async function updatePaymentProviderOrder({ paymentId, providerOrderId }, { conn } = {}) {
  const db = pickConn(conn);
  await db.query('UPDATE payments SET provider_order_id = ?, status = ? WHERE id = ?', [providerOrderId, 'pending', paymentId]);
}

export async function findPaymentByProviderOrder({ provider, providerOrderId }, { conn, forUpdate = false } = {}) {
  const db = pickConn(conn);
  const [rows] = await db.query(
    `SELECT id, order_id, user_id, provider, status, currency, amount_cents, provider_order_id, provider_payment_id
       FROM payments
      WHERE provider = ? AND provider_order_id = ?
      ${forUpdate ? 'FOR UPDATE' : ''}
      LIMIT 1`,
    [provider, providerOrderId],
  );
  return rows?.[0] ?? null;
}

export async function markPaymentCaptured(
  { paymentId, providerPaymentId, providerSignature = null, rawPayloadJson = null },
  { conn } = {},
) {
  const db = pickConn(conn);
  await db.query(
    `UPDATE payments
        SET status = 'captured',
            provider_payment_id = COALESCE(?, provider_payment_id),
            provider_signature = COALESCE(?, provider_signature),
            captured_at = NOW(),
            raw_payload_json = COALESCE(?, raw_payload_json)
      WHERE id = ? AND status <> 'captured'`,
    [providerPaymentId, providerSignature, rawPayloadJson, paymentId],
  );
}

export async function markPaymentFailed(
  { paymentId, failureCode = null, failureMessage = null, rawPayloadJson = null },
  { conn } = {},
) {
  const db = pickConn(conn);
  await db.query(
    `UPDATE payments
        SET status = 'failed',
            failure_code = COALESCE(?, failure_code),
            failure_message = COALESCE(?, failure_message),
            raw_payload_json = COALESCE(?, raw_payload_json)
      WHERE id = ? AND status NOT IN ('captured','failed')`,
    [failureCode, failureMessage, rawPayloadJson, paymentId],
  );
}

export async function listPaymentsForOrder({ orderId }, { conn } = {}) {
  const db = pickConn(conn);
  const [rows] = await db.query(
    `SELECT id, provider, status, currency, amount_cents, provider_order_id, provider_payment_id, created_at, updated_at
       FROM payments
      WHERE order_id = ?
   ORDER BY id DESC`,
    [orderId],
  );
  return rows;
}

