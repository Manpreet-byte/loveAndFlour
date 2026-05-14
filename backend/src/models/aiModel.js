import { pool } from '../config/db.js';

function pickConn(conn) {
  return conn ?? pool;
}

export async function createConversation({ userId, scopeType = 'general', scopeId = null, title = null }, { conn } = {}) {
  const db = pickConn(conn);
  const [result] = await db.query(
    `INSERT INTO ai_conversations (user_id, scope_type, scope_id, title)
     VALUES (?, ?, ?, ?)`,
    [userId, scopeType, scopeId, title],
  );
  return result.insertId;
}

export async function getConversation({ userId, conversationId }, { conn } = {}) {
  const db = pickConn(conn);
  const [[row]] = await db.query(
    `SELECT id, user_id, scope_type, scope_id, title, created_at, updated_at
       FROM ai_conversations
      WHERE id = ? AND user_id = ?
      LIMIT 1`,
    [conversationId, userId],
  );
  return row ?? null;
}

export async function upsertConversationUpdatedAt({ conversationId }, { conn } = {}) {
  const db = pickConn(conn);
  await db.query(`UPDATE ai_conversations SET updated_at = NOW() WHERE id = ?`, [conversationId]);
}

export async function addMessage({ conversationId, userId, role, contentText }, { conn } = {}) {
  const db = pickConn(conn);
  const [result] = await db.query(
    `INSERT INTO ai_messages (conversation_id, user_id, role, content_text)
     VALUES (?, ?, ?, ?)`,
    [conversationId, userId, role, contentText],
  );
  return result.insertId;
}

export async function listMessages({ userId, conversationId, limit = 50 }, { conn } = {}) {
  const db = pickConn(conn);
  const safeLimit = Math.max(1, Math.min(200, Number(limit) || 50));
  const [rows] = await db.query(
    `SELECT m.id, m.role, m.content_text, m.created_at
       FROM ai_messages m
       JOIN ai_conversations c ON c.id = m.conversation_id
      WHERE m.conversation_id = ? AND c.user_id = ?
   ORDER BY m.id DESC
      LIMIT ?`,
    [conversationId, userId, safeLimit],
  );
  return rows.reverse();
}

export async function listConversations({ userId, limit = 30 }, { conn } = {}) {
  const db = pickConn(conn);
  const safeLimit = Math.max(1, Math.min(100, Number(limit) || 30));
  const [rows] = await db.query(
    `SELECT id, scope_type, scope_id, title, created_at, updated_at
       FROM ai_conversations
      WHERE user_id = ?
   ORDER BY updated_at DESC, id DESC
      LIMIT ?`,
    [userId, safeLimit],
  );
  return rows;
}

export async function logAiUsage(
  { userId, conversationId = null, endpoint, model = null, promptChars = 0, completionChars = 0, ok = true, errorCode = null },
  { conn } = {},
) {
  const db = pickConn(conn);
  await db.query(
    `INSERT INTO ai_usage_logs (user_id, conversation_id, endpoint, model, prompt_chars, completion_chars, ok, error_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, conversationId, endpoint, model, Number(promptChars) || 0, Number(completionChars) || 0, ok ? 1 : 0, errorCode],
  );
}

