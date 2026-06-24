import express from 'express';
import cors from 'cors';
import authRoutes from './routes/v1/auth.routes';
import problemRoutes from './routes/v1/problem.routes';
import attemptRoutes from './routes/v1/attempt.routes';

const app = express();

app.use(express.json());
app.use(cors());
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/problems', problemRoutes);
app.use('/api/v1/attempts', attemptRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'LeetCoach AI Server is running!' });
});

export default app;