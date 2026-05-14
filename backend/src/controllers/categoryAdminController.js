import { z } from 'zod';
import { pool } from '../config/db.js';
import { slugify } from '../utils/slug.js';
import { invalidateCategories, invalidatePublicCourses, invalidatePublicRecipes } from '../services/cacheInvalidationService.js';

const categorySchema = z.object({
  type: z.enum(['course', 'recipe']),
  name: z.string().min(1).max(120),
  slug: z.string().max(160).optional().nullable(),
  description: z.string().max(10000).optional().nullable(),
});

export async function createCategory(req, res, next) {
  try {
    const payload = categorySchema.parse(req.body);
    const slug = payload.slug ? slugify(payload.slug) : slugify(payload.name);
    const [result] = await pool.query(
      'INSERT INTO categories (type, name, slug, description) VALUES (?, ?, ?, ?)',
      [payload.type, payload.name, slug, payload.description ?? null],
    );
    await invalidateCategories();
    await invalidatePublicCourses();
    await invalidatePublicRecipes();
    return res.status(201).json({ category: { id: result.insertId, type: payload.type, name: payload.name, slug } });
  } catch (err) {
    return next(err);
  }
}

export async function listCategories(req, res, next) {
  try {
    const type = req.query.type;
    if (type && type !== 'course' && type !== 'recipe') {
      return res.status(400).json({ error: { message: 'Invalid type' } });
    }

    const [rows] = await pool.query(
      type ? 'SELECT id, type, name, slug, description FROM categories WHERE type = ? ORDER BY name ASC' : 'SELECT id, type, name, slug, description FROM categories ORDER BY type, name ASC',
      type ? [type] : [],
    );
    return res.json({ categories: rows });
  } catch (err) {
    return next(err);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const categoryId = Number(req.params.id);
    if (!Number.isFinite(categoryId) || categoryId <= 0) {
      return res.status(400).json({ error: { message: 'Invalid category id' } });
    }
    await pool.query('DELETE FROM categories WHERE id = ?', [categoryId]);
    await invalidateCategories();
    await invalidatePublicCourses();
    await invalidatePublicRecipes();
    return res.json({ ok: true });
  } catch (err) {
    return next(err);
  }
}
