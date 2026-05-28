import { Response } from 'express';
import multer from 'multer';
import { AuthRequest } from '../middlewares/auth.middleware';
import { scanTextForWatermark } from '../services/textScanner.service';
import { scanImageForC2PA } from '../services/imageScanner.service';
import { ScanHistory } from '../models/scanHistory.model';

const upload = multer({ storage: multer.memoryStorage() });

export const uploadMiddleware = upload.single('image');

export const scanText = async (req: AuthRequest, res: Response) => {
  try {
    const { text } = req.body;
    const userId = req.userId;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text payload is required and must be a string' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const scanResult = await scanTextForWatermark(text);

    const historyRecord = new ScanHistory({
      userId,
      contentType: 'text',
      result: scanResult,
    });

    await historyRecord.save();

    res.status(200).json({
      message: 'Scan completed',
      result: scanResult,
      historyId: historyRecord._id
    });
  } catch (error: any) {
    console.error('Scanning error:', error.message);
    res.status(500).json({ error: 'Failed to scan text' });
  }
};

export const scanImage = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const file = req.file;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const c2paResult = await scanImageForC2PA(file.buffer, file.mimetype);

    const historyRecord = new ScanHistory({
      userId,
      contentType: 'image',
      result: c2paResult,
    });

    await historyRecord.save();

    res.status(200).json({
      message: 'Scan completed',
      result: c2paResult,
      historyId: historyRecord._id
    });
  } catch (error: any) {
    console.error('Image scanning error:', error.message);
    res.status(500).json({ error: 'Failed to scan image' });
  }
};
