import { pool } from '../config/db.js';
import { sendEmail } from './mailer.js';

export async function enqueueEmail({ toEmail, subject, bodyText, bodyHtml, scheduledAt = null }) {
  await pool.query(
    'INSERT INTO email_outbox (to_email, subject, body_text, body_html, scheduled_at, status) VALUES (?, ?, ?, ?, ?, ?)',
    [toEmail, subject, bodyText ?? null, bodyHtml ?? null, scheduledAt, 'pending'],
  );
}

export async function enqueueBulkEmail({ toEmails, subject, bodyText, bodyHtml, scheduledAt = null }) {
  if (!toEmails?.length) return;
  const values = toEmails.map((email) => [email, subject, bodyText ?? null, bodyHtml ?? null, scheduledAt, 'pending']);
  await pool.query(
    'INSERT INTO email_outbox (to_email, subject, body_text, body_html, scheduled_at, status) VALUES ?',
    [values],
  );
}

export async function processOutboxBatch({ limit = 25 } = {}) {
  const [rows] = await pool.query(
    `SELECT id, to_email, subject, body_text, body_html
       FROM email_outbox
      WHERE status IN ('pending','failed')
        AND attempts < 5
        AND (scheduled_at IS NULL OR scheduled_at <= NOW())
        AND (
          status = 'pending'
          OR (status = 'failed' AND updated_at <= (NOW() - INTERVAL 5 MINUTE))
        )
      ORDER BY id ASC
      LIMIT ?`,
    [limit],
  );

  for (const msg of rows) {
    try {
      await sendEmail({
        to: msg.to_email,
        subject: msg.subject,
        text: msg.body_text,
        html: msg.body_html,
      });
      await pool.query(
        "UPDATE email_outbox SET status = 'sent', attempts = attempts + 1, sent_at = NOW() WHERE id = ?",
        [msg.id],
      );
    } catch (err) {
      const errText = String(err?.message ?? err);
      await pool.query(
        "UPDATE email_outbox SET status = 'failed', attempts = attempts + 1, last_error = ? WHERE id = ?",
        [errText, msg.id],
      );
      // Best-effort reliability breadcrumb (optional table).
      pool
        .query(
          `INSERT INTO failed_jobs (job_type, payload_json, status, attempts, last_error)
           VALUES (?, ?, 'failed', ?, ?)` ,
          ['email_outbox', JSON.stringify({ outbox_id: msg.id, to_email: msg.to_email }), 1, errText.slice(0, 500)],
        )
        .catch(() => null);
    }
  }
}
