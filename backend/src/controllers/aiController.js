import { z } from 'zod';
import { pool } from '../config/db.js';
import { getAiProvider } from '../services/ai/aiProvider.js';
import { assertActiveEnrollment } from '../services/accessControlService.js';
import { createConversation, addMessage, listMessages, listConversations, logAiUsage, upsertConversationUpdatedAt, getConversation } from '../models/aiModel.js';

function stripScripts(html) {
  const str = String(html ?? '');
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

const chatSchema = z.object({
  conversation_id: z.coerce.number().int().positive().optional().nullable(),
  scope: z
    .object({
      type: z.enum(['lesson', 'course', 'general']).default('general'),
      course_id: z.coerce.number().int().positive().optional().nullable(),
      lesson_id: z.coerce.number().int().positive().optional().nullable(),
    })
    .optional()
    .nullable(),
  message: z.string().trim().min(1).max(4000),
});

export async function chat(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const userId = req.user.id;
    const payload = chatSchema.parse(req.body ?? {});
    const scope = payload.scope ?? { type: 'general' };

    // Access control: if lesson/course scoped, ensure enrollment.
    if (scope.type === 'lesson' && scope.lesson_id) {
      const [rows] = await conn.query(`SELECT course_id, content_html, title, summary FROM lessons WHERE id = ? LIMIT 1`, [scope.lesson_id]);
      const lesson = rows?.[0];
      if (!lesson) return res.status(404).json({ error: { message: 'Lesson not found' } });
      await assertActiveEnrollment({ userId, courseId: Number(lesson.course_id) }, { conn });
    } else if (scope.type === 'course' && scope.course_id) {
      await assertActiveEnrollment({ userId, courseId: Number(scope.course_id) }, { conn });
    }

    await conn.beginTransaction();

    let conversationId = payload.conversation_id ?? null;
    if (!conversationId) {
      const title = scope.type === 'lesson' ? 'Lesson assistant' : scope.type === 'course' ? 'Course assistant' : 'Study assistant';
      conversationId = await createConversation(
        { userId, scopeType: scope.type, scopeId: scope.lesson_id ?? scope.course_id ?? null, title },
        { conn },
      );
    } else {
      const conv = await getConversation({ userId, conversationId }, { conn });
      if (!conv) return res.status(404).json({ error: { message: 'Conversation not found' } });
    }

    await addMessage({ conversationId, userId, role: 'user', contentText: payload.message }, { conn });

    const provider = getAiProvider();
    const providerInfo = provider.getProviderInfo ? provider.getProviderInfo() : { provider: 'unknown', model: null };

    // Build a minimal context prompt (safe, no private info beyond the user’s enrollment scope).
    let systemPrompt = '';
    if (scope.type === 'lesson' && scope.lesson_id) {
      const [rows] = await conn.query(
        `SELECT l.title, l.lesson_type, l.content_html, c.title AS course_title
           FROM lessons l
           JOIN courses c ON c.id = l.course_id
          WHERE l.id = ?
          LIMIT 1`,
        [scope.lesson_id],
      );
      const lesson = rows?.[0];
      if (lesson) {
        const safeHtml = stripScripts(lesson.content_html ?? '');
        const snippet = safeHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 1200);
        systemPrompt = `You are a helpful baking study assistant. Respond concisely.\nCourse: ${lesson.course_title}\nLesson: ${lesson.title}\nLesson text excerpt: ${snippet}`;
      }
    }

    const history = await listMessages({ userId, conversationId, limit: 40 }, { conn });
    const messages = history.map((m) => ({ role: m.role, content: m.content_text }));

    const result = await provider.chat({ systemPrompt, messages });
    const assistantText = String(result?.content ?? '').trim() || 'Sorry, I could not generate a response.';
    await addMessage({ conversationId, userId, role: 'assistant', contentText: assistantText }, { conn });
    await upsertConversationUpdatedAt({ conversationId }, { conn });

    await logAiUsage(
      {
        userId,
        conversationId,
        endpoint: 'chat',
        model: providerInfo.model,
        promptChars: payload.message.length,
        completionChars: assistantText.length,
        ok: true,
      },
      { conn },
    );

    await conn.commit();
    return res.json({ conversation_id: conversationId, message: { role: 'assistant', content: assistantText }, confidence: result?.confidence ?? null });
  } catch (err) {
    try { await conn.rollback(); } catch {}
    return next(err);
  } finally {
    conn.release();
  }
}

const lessonActionSchema = z.object({
  course_id: z.coerce.number().int().positive(),
  lesson_id: z.coerce.number().int().positive(),
});

async function getLessonContext(conn, { userId, courseId, lessonId }) {
  await assertActiveEnrollment({ userId, courseId }, { conn });
  const [rows] = await conn.query(
    `SELECT l.title, l.lesson_type, l.content_html, c.title AS course_title
       FROM lessons l
       JOIN courses c ON c.id = l.course_id
      WHERE l.id = ? AND l.course_id = ?
      LIMIT 1`,
    [lessonId, courseId],
  );
  const lesson = rows?.[0];
  if (!lesson) return null;
  const safeHtml = stripScripts(lesson.content_html ?? '');
  const text = safeHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return { lesson, text: text.slice(0, 4000) };
}

export async function lessonSummary(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const userId = req.user.id;
    const payload = lessonActionSchema.parse(req.body ?? {});
    const ctx = await getLessonContext(conn, { userId, courseId: payload.course_id, lessonId: payload.lesson_id });
    if (!ctx) return res.status(404).json({ error: { message: 'Lesson not found' } });

    const provider = getAiProvider();
    const providerInfo = provider.getProviderInfo ? provider.getProviderInfo() : { provider: 'unknown', model: null };
    const result = await provider.summarize({ inputText: ctx.text });
    const content = String(result?.content ?? '').trim();

    await logAiUsage({ userId, endpoint: 'lesson_summary', model: providerInfo.model, promptChars: ctx.text.length, completionChars: content.length, ok: true });
    return res.json({ ok: true, summary: content, confidence: result?.confidence ?? null });
  } catch (err) {
    return next(err);
  } finally {
    conn.release();
  }
}

export async function lessonNotes(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const userId = req.user.id;
    const payload = lessonActionSchema.parse(req.body ?? {});
    const ctx = await getLessonContext(conn, { userId, courseId: payload.course_id, lessonId: payload.lesson_id });
    if (!ctx) return res.status(404).json({ error: { message: 'Lesson not found' } });

    const provider = getAiProvider();
    const providerInfo = provider.getProviderInfo ? provider.getProviderInfo() : { provider: 'unknown', model: null };
    const result = await provider.notes({ inputText: ctx.text });
    const content = String(result?.content ?? '').trim();

    // Save notes as study_notes (ai source).
    await conn.query(
      `INSERT INTO study_notes (user_id, course_id, lesson_id, note_text, source)
       VALUES (?, ?, ?, ?, 'ai')`,
      [userId, payload.course_id, payload.lesson_id, content],
    );

    await logAiUsage({ userId, endpoint: 'lesson_notes', model: providerInfo.model, promptChars: ctx.text.length, completionChars: content.length, ok: true });
    return res.json({ ok: true, notes: content, confidence: result?.confidence ?? null });
  } catch (err) {
    return next(err);
  } finally {
    conn.release();
  }
}

const historySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export async function history(req, res, next) {
  try {
    const userId = req.user.id;
    const { limit } = historySchema.parse(req.query);
    const conversations = await listConversations({ userId, limit: limit ?? 30 });
    return res.json({ conversations });
  } catch (err) {
    return next(err);
  }
}

