import request from 'supertest';
import app from '../src/app';

describe('Health Check API', () => {
  it('should return status ok on GET /api/health', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});
