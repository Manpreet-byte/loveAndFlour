import { Router } from 'express';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { aiLimiter } from '../middleware/rateLimiters.js';
import { chat, history, lessonNotes, lessonSummary } from '../controllers/aiController.js';

const router = Router();

router.use(aiLimiter, authenticateUser);

router.post('/chat', chat);
router.post('/lesson-summary', lessonSummary);
router.post('/lesson-notes', lessonNotes);
router.get('/history', history);

export default router;

