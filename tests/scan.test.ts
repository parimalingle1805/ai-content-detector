import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';
import { ScanHistory } from '../src/models/scanHistory.model';
import * as imageScanner from '../src/services/imageScanner.service';

jest.mock('../src/models/scanHistory.model');
jest.mock('../src/services/imageScanner.service');

global.fetch = jest.fn();

describe('Scan API', () => {
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  let token: string;

  beforeAll(() => {
    token = jwt.sign({ userId: mockUserId }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '1h' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/scan/text', () => {
    it('should return 401 if no token is provided', async () => {
      const res = await request(app)
        .post('/api/scan/text')
        .send({ text: 'Some text to scan' });
      expect(res.status).toBe(401);
    });

    it('should return 400 if text is not provided', async () => {
      const res = await request(app)
        .post('/api/scan/text')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(res.status).toBe(400);
    });

    it('should scan text, save history, and return results via HTTP microservice', async () => {
      const mockScanResult = { score: 0.85, isWatermarked: true };
      
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockScanResult)
      });

      const mockSave = jest.fn().mockResolvedValue(true);
      (ScanHistory as unknown as jest.Mock).mockImplementation(() => ({
        _id: 'mockHistoryId',
        save: mockSave
      }));

      const res = await request(app)
        .post('/api/scan/text')
        .set('Authorization', `Bearer ${token}`)
        .send({ text: 'Some AI generated text here' });

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:8000/scan', expect.any(Object));
      expect(mockSave).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.body.result).toEqual(mockScanResult);
      expect(res.body.historyId).toBe('mockHistoryId');
    });

    it('should handle microservice HTTP errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const res = await request(app)
        .post('/api/scan/text')
        .set('Authorization', `Bearer ${token}`)
        .send({ text: 'Some AI generated text here' });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Failed to scan text');
    });
  });

  describe('POST /api/scan/image', () => {
    it('should return 400 if no image is uploaded', async () => {
      const res = await request(app)
        .post('/api/scan/image')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Image file is required');
    });

    it('should scan image with valid C2PA data, save history, and return results', async () => {
      const mockC2paResult = { hasC2pa: true, producer: 'Adobe', edits: [{ action: 'c2pa.cropped' }] };
      (imageScanner.scanImageForC2PA as jest.Mock).mockResolvedValue(mockC2paResult);

      const mockSave = jest.fn().mockResolvedValue(true);
      (ScanHistory as unknown as jest.Mock).mockImplementation(() => ({
        _id: 'mockImgHistoryId',
        save: mockSave
      }));

      const res = await request(app)
        .post('/api/scan/image')
        .set('Authorization', `Bearer ${token}`)
        .attach('image', Buffer.from('fake image data'), 'test.png');

      expect(imageScanner.scanImageForC2PA).toHaveBeenCalled();
      expect(mockSave).toHaveBeenCalled();
      expect(res.status).toBe(200);
      expect(res.body.result).toEqual(mockC2paResult);
      expect(res.body.historyId).toBe('mockImgHistoryId');
    });

    it('should return proper fallback when image lacks C2PA data', async () => {
      const mockC2paResult = { hasC2pa: false };
      (imageScanner.scanImageForC2PA as jest.Mock).mockResolvedValue(mockC2paResult);

      const mockSave = jest.fn().mockResolvedValue(true);
      (ScanHistory as unknown as jest.Mock).mockImplementation(() => ({
        _id: 'mockImgHistoryId2',
        save: mockSave
      }));

      const res = await request(app)
        .post('/api/scan/image')
        .set('Authorization', `Bearer ${token}`)
        .attach('image', Buffer.from('fake image data'), 'test.jpg');

      expect(res.status).toBe(200);
      expect(res.body.result).toEqual(mockC2paResult);
    });
  });
});
