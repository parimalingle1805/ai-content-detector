import mongoose from 'mongoose';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

export const prisma = new PrismaClient();

export const connectPostgres = async () => {
  try {
    await prisma.$connect();
    console.log('PostgreSQL connected successfully via Prisma');
  } catch (error) {
    console.error('PostgreSQL connection failed:', error);
    process.exit(1);
  }
};

export const connectMongo = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://root:password@localhost:27017/ai_content_detect?authSource=admin';
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully via Mongoose');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};
