import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { scanText, scanImage, uploadMiddleware, getHistory, deleteHistory } from '../controllers/scan.controller';

const router = Router();

router.post('/text', authenticate, scanText);
router.post('/image', authenticate, uploadMiddleware, scanImage);
router.get('/history', authenticate, getHistory);
router.delete('/history/:id', authenticate, deleteHistory);

export default router;
