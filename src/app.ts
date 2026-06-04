import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import scanRoutes from './routes/scan.routes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/scan', scanRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Triggering backend CI/CD pipeline test1

export default app;
