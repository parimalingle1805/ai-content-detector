import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { scanText } from '../controllers/scan.controller';

const router = Router();

router.post('/text', authenticate, scanText);

export default router;
