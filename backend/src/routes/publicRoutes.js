import { Router } from 'express';
import {
  getPublicCourseBySlug,
  getPublicRecipeBySlug,
  listPublicCategories,
  listPublicCourses,
  listPublicRecipes,
} from '../controllers/publicContentController.js';

const router = Router();

router.get('/courses', listPublicCourses);
router.get('/courses/:slug', getPublicCourseBySlug);
router.get('/recipes', listPublicRecipes);
router.get('/recipes/:slug', getPublicRecipeBySlug);
router.get('/categories', listPublicCategories);

export default router;