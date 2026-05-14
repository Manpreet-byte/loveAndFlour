import { Router } from 'express';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { checkout, verify } from '../controllers/paymentController.js';
import { paymentsLimiter } from '../middleware/rateLimiters.js';

const router = Router();

router.post('/checkout', paymentsLimiter, authenticateUser, checkout);
router.post('/create', paymentsLimiter, authenticateUser, checkout);
router.post('/verify', paymentsLimiter, authenticateUser, verify);

export default router;
