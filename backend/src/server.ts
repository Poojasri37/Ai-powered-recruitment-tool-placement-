import express, { Request, Response, NextFunction } from 'express';
import dns from 'dns';
try {
  // Attempt to use Google DNS to bypass local ISP restriction on SRV records
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.log('Could not set custom DNS servers');
}
import cors from 'cors';
import 'dotenv/config';
import 'express-async-errors';
import { connectDB } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { authenticateToken } from './middleware/auth';

// Routes
import authRoutes from './routes/auth';
import jobRoutes from './routes/jobs';
import candidateRoutes from './routes/candidates';
import candidateJobRoutes from './routes/candidateJobs';
import applicationRoutes from './routes/applications';
import interviewRoutes from './routes/interviews';
import reportsRoutes from './routes/reports';
import mockInterviewRoutes from './routes/mockInterview';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    process.env.FRONTEND_URL || '*', // Allow configured frontend or all
    'https://ai-powered-recruitment-tool-kohl.vercel.app',
    'https://ai-powered-recruitment-tool-placeme.vercel.app' // New Vercel deployment
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/jobs', authenticateToken, jobRoutes);
app.use('/api/candidates', authenticateToken, candidateRoutes);
app.use('/api/candidate-jobs', authenticateToken, candidateJobRoutes);
app.use('/api/applications', authenticateToken, applicationRoutes);
app.use('/api/interviews', authenticateToken, interviewRoutes);
app.use('/api/reports', authenticateToken, reportsRoutes);
app.use('/api/mock-interview', authenticateToken, mockInterviewRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'Server is running' });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
});

export default app;
