import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { scanTextForWatermark } from '../services/textScanner.service';
import { ScanHistory } from '../models/scanHistory.model';

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

    // Call the SynthID detector via child_process
    const scanResult = await scanTextForWatermark(text);

    // Save the result to MongoDB
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
