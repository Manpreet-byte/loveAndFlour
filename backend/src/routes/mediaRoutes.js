import { Router } from 'express';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { uploadMedia, getMedia, getMediaFile, deleteMediaById, listMediaForUser } from '../controllers/mediaController.js';

const router = Router();

router.post('/upload', authenticateUser, uploadMedia);
router.get('/user/:userId', authenticateUser, listMediaForUser);
router.get('/:id', authenticateUser, getMedia);
router.get('/:id/file', authenticateUser, getMediaFile);
router.delete('/:id', authenticateUser, deleteMediaById);

export default router;

