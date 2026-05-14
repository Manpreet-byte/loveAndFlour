import { env } from '../../utils/env.js';
import { hmacSha256Hex, safeEqual } from '../../utils/crypto.js';

export function verifyRazorpayWebhookSignature({ rawBody, signatureHeader }) {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return false;
  const computed = hmacSha256Hex(env.RAZORPAY_WEBHOOK_SECRET, rawBody);
  return safeEqual(computed, signatureHeader ?? '');
}

