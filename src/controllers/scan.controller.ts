import { Response } from 'express';
import multer from 'multer';
import { AuthRequest } from '../middlewares/auth.middleware';
import { scanTextForWatermark } from '../services/textScanner.service';
import { scanImageForC2PA } from '../services/imageScanner.service';
import { uploadImageToS3 } from '../services/s3.service';
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

    if (text.length < 20) {
      return res.status(400).json({ error: 'Text is too short for deep statistical analysis. Minimum 20 characters required.' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const scanResult = await scanTextForWatermark(text);

    const historyRecord = new ScanHistory({
      userId,
      scanType: 'text',
      contentReference: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      originalText: text,
      resultData: scanResult,
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

    let thumbnailUrl = undefined;
    try {
      thumbnailUrl = await uploadImageToS3(file.buffer, file.mimetype);
    } catch (uploadError: any) {
      console.error('S3 Upload failed, proceeding without thumbnail:', uploadError.message);
    }

    const historyRecord = new ScanHistory({
      userId,
      scanType: 'image',
      contentReference: file.originalname || 'image_upload',
      thumbnailUrl,
      resultData: c2paResult,
    });

    await historyRecord.save();

    res.status(200).json({
      message: 'Scan completed',
      result: {
        ...c2paResult,
        thumbnailUrl
      },
      historyId: historyRecord._id
    });
  } catch (error: any) {
    console.error('Image scanning error:', error.message);
    res.status(500).json({ error: 'Failed to scan image' });
  }
};

export const getHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const history = await ScanHistory.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error: any) {
    console.error('Fetch history error:', error.message);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

export const deleteHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    await ScanHistory.findOneAndDelete({ _id: req.params.id, userId });
    res.status(200).json({ message: 'History record deleted' });
  } catch (error: any) {
    console.error('Delete history error:', error.message);
    res.status(500).json({ error: 'Failed to delete history' });
  }
};
