import { z } from 'zod';
import { pool } from '../config/db.js';
import { slugify } from '../utils/slug.js';
import { toMysqlDatetime } from '../utils/datetime.js';
import { invalidateCategories, invalidatePublicCourses } from '../services/cacheInvalidationService.js';
import { enqueuePushForUsers } from '../services/push/pushOutboxService.js';
import { sanitizeBasicHtml } from '../utils/sanitizeHtml.js';

const createCourseSchema = z.object({
  title: z.string().min(1).max(255),
  summary: z.string().max(5000).optional().nullable(),
  content: z.string().optional().nullable(),
  featured_image_url: z.string().url().max(1024).optional().nullable(),
  category_ids: z.array(z.coerce.number().int().positive()).default([]),
  price: z
    .object({
      currency: z.string().length(3).default('INR'),
      amount_cents: z.coerce.number().int().nonnegative(),
    })
    .optional()
    .nullable(),
  scheduled_at: z.string().datetime().optional().nullable(),
  zoom_meeting_id: z.string().max(64).optional().nullable(),
  zoom_join_url: z.string().url().max(2048).optional().nullable(),
});

const updateCourseSchema = createCourseSchema.partial().extend({
  is_published: z.coerce.boolean().optional(),
});

export async function createCourse(req, res, next) {
  try {
    const payload = createCourseSchema.parse(req.body);
    const cleanedSummary = payload.summary != null ? sanitizeBasicHtml(payload.summary) : null;
    const cleanedContent = payload.content != null ? sanitizeBasicHtml(payload.content) : null;
    const slug = slugify(payload.title);
    const publishedAt = new Date();

    const [result] = await pool.query(
      'INSERT INTO courses (title, slug, summary, content, featured_image_url, is_published, published_at) VALUES (?, ?, ?, ?, ?, 1, ?)',
      [payload.title, slug, cleanedSummary ?? null, cleanedContent ?? null, payload.featured_image_url ?? null, publishedAt],
    );

    const courseId = result.insertId;

    if (payload.price && payload.price.amount_cents !== undefined) {
      await pool.query(
        'INSERT INTO course_prices (course_id, currency, amount_cents, is_active) VALUES (?, ?, ?, 1)',
        [courseId, payload.price.currency ?? 'INR', payload.price.amount_cents],
      );
    }

    if (payload.category_ids?.length) {
      const values = payload.category_ids.map((cid) => [courseId, cid]);
      await pool.query('INSERT IGNORE INTO course_categories (course_id, category_id) VALUES ?', [values]);
    }

    if (payload.scheduled_at) {
      const scheduledAt = toMysqlDatetime(payload.scheduled_at);
      if (!scheduledAt) return res.status(400).json({ error: { message: 'Invalid scheduled_at' } });
      await pool.query(
        'INSERT INTO live_sessions (course_id, title, scheduled_at, status, zoom_meeting_id, zoom_join_url) VALUES (?, ?, ?, ?, ?, ?)',
        [
          courseId,
          `${payload.title} - Live Session`,
          scheduledAt,
          'upcoming',
          payload.zoom_meeting_id ?? null,
          payload.zoom_join_url ?? null,
        ],
      );
    }

    await invalidatePublicCourses();
    await invalidateCategories();
    return res.status(201).json({ course_id: courseId, slug });
  } catch (err) {
    return next(err);
  }
}

export async function listCourses(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.title, c.slug, c.summary, c.content, c.featured_image_url, c.is_published, c.published_at, c.created_at, c.updated_at,
              cp.currency, cp.amount_cents
         FROM courses c
    LEFT JOIN course_prices cp ON cp.course_id = c.id AND cp.is_active = 1
     ORDER BY c.created_at DESC
        LIMIT 200`,
    );
    return res.json({ courses: rows });
  } catch (err) {
    return next(err);
  }
}

export async function updateCourse(req, res, next) {
  try {
    const courseId = Number(req.params.id);
    if (!Number.isFinite(courseId) || courseId <= 0) {
      return res.status(400).json({ error: { message: 'Invalid course id' } });
    }

    const payload = updateCourseSchema.parse(req.body);
    const [[before]] = await pool.query('SELECT is_published, title, slug FROM courses WHERE id = ? LIMIT 1', [courseId]);
    const fields = [];
    const values = [];

    if (payload.title !== undefined) {
      fields.push('title = ?');
      values.push(payload.title);
      fields.push('slug = ?');
      values.push(slugify(payload.title));
    }
    if (payload.summary !== undefined) {
      fields.push('summary = ?');
      values.push(payload.summary == null ? null : sanitizeBasicHtml(payload.summary));
    }
    if (payload.content !== undefined) {
      fields.push('content = ?');
      values.push(payload.content == null ? null : sanitizeBasicHtml(payload.content));
    }
    if (payload.featured_image_url !== undefined) {
      fields.push('featured_image_url = ?');
      values.push(payload.featured_image_url ?? null);
    }
    if (payload.is_published !== undefined) {
      fields.push('is_published = ?');
      values.push(payload.is_published ? 1 : 0);
      fields.push('published_at = ?');
      values.push(payload.is_published ? new Date() : null);
    }

    if (fields.length) {
      values.push(courseId);
      await pool.query(`UPDATE courses SET ${fields.join(', ')} WHERE id = ?`, values);
    }

    if (payload.price) {
      await pool.query('UPDATE course_prices SET is_active = 0 WHERE course_id = ?', [courseId]);
      await pool.query(
        'INSERT INTO course_prices (course_id, currency, amount_cents, is_active) VALUES (?, ?, ?, 1)',
        [courseId, payload.price.currency ?? 'INR', payload.price.amount_cents],
      );
    }

    if (payload.category_ids) {
      await pool.query('DELETE FROM course_categories WHERE course_id = ?', [courseId]);
      if (payload.category_ids.length) {
        const values2 = payload.category_ids.map((cid) => [courseId, cid]);
        await pool.query('INSERT INTO course_categories (course_id, category_id) VALUES ?', [values2]);
      }
    }

    await invalidatePublicCourses();
    await invalidateCategories();

    // Push when a course is newly published.
    if (payload.is_published === true && before && Number(before.is_published) !== 1) {
      const [[course]] = await pool.query('SELECT id, title, slug FROM courses WHERE id = ? LIMIT 1', [courseId]);
      const [users] = await pool.query(`SELECT id FROM users LIMIT 50000`).catch(() => [[]]);
      const userIds = (users ?? []).map((u) => Number(u.id)).filter((n) => Number.isFinite(n) && n > 0);
      enqueuePushForUsers({
        userIds,
        title: 'New course available',
        body: course?.title ?? 'A new course is now available.',
        url: course?.slug ? `/courses/${encodeURIComponent(course.slug)}` : '/courses',
        tag: `course:${courseId}:published`,
        data: { course_id: courseId },
      }).catch(() => null);
    }

    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}

export async function deleteCourse(req, res, next) {
  try {
    const courseId = Number(req.params.id);
    if (!Number.isFinite(courseId) || courseId <= 0) {
      return res.status(400).json({ error: { message: 'Invalid course id' } });
    }
    await pool.query('DELETE FROM courses WHERE id = ?', [courseId]);
    await invalidatePublicCourses();
    await invalidateCategories();
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}
