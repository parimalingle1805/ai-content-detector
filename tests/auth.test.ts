import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';
import bcrypt from 'bcryptjs';

jest.mock('../src/config/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('Auth API', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    passwordHash: 'placeholder',
    createdAt: new Date(),
  };

  it('should register a new user', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'test@example.com');
  });

  it('should login an existing user', async () => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);
    
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      ...mockUser,
      passwordHash: hash,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'test@example.com');
  });

  it('should reject login with wrong password', async () => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('password123', salt);
    
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      ...mockUser,
      passwordHash: hash,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Invalid email or password');
  });
});
