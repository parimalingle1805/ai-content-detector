import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { scanText, scanImage, uploadMiddleware } from '../controllers/scan.controller';

const router = Router();

router.post('/text', authenticate, scanText);
router.post('/image', authenticate, uploadMiddleware, scanImage);

export default router;
