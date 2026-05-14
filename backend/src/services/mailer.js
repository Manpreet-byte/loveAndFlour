import { env } from '../utils/env.js';

let transporter;
let nodemailerModule;

async function loadNodemailer() {
  if (nodemailerModule) return nodemailerModule;
  try {
    nodemailerModule = await import('nodemailer');
    return nodemailerModule;
  } catch (err) {
    return null;
  }
}

async function getTransporter() {
  if (transporter) return transporter;

  if (!env.SMTP_HOST) {
    transporter = null;
    return transporter;
  }

  const nodemailer = await loadNodemailer();
  if (!nodemailer) {
    // eslint-disable-next-line no-console
    console.warn('[email] SMTP configured but nodemailer is not installed. Run `npm install` in backend.');
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.default.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined,
  });

  return transporter;
}

export async function sendEmail({ to, subject, text, html }) {
  const tx = await getTransporter();
  if (!tx) {
    // eslint-disable-next-line no-console
    console.log('[email:dev]', { to, subject });
    return { skipped: true };
  }

  await tx.sendMail({
    from: env.SMTP_FROM_EMAIL,
    to,
    subject,
    text: text ?? undefined,
    html: html ?? undefined,
  });

  return { sent: true };
}
