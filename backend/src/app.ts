import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config/env';
import { rateLimiterMiddleware } from './middleware/rateLimiter';
import apiRoutes from './routes/api.routes';
import logger from './utils/logger';
import { ApiResponse } from './types';

const app = express();

// Middleware - order matters!
// 1. Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 2. CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// 3. Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// 4. Rate limiter (before routes!)
app.use(rateLimiterMiddleware);

// 5. Routes
app.use('/api', apiRoutes);

// Health check endpoint (no rate limit)
app.get('/health', (req: Request, res: Response) => {
  const response: ApiResponse<{ status: string }> = {
    success: true,
    data: { status: 'healthy' },
    timestamp: new Date().toISOString(),
  };
  res.json(response);
});

// 404 handler
app.use((req: Request, res: Response) => {
  const response: ApiResponse<null> = {
    success: false,
    error: 'Endpoint not found',
    timestamp: new Date().toISOString(),
  };
  res.status(404).json(response);
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Unhandled error: ${err.message}`);
  const response: ApiResponse<null> = {
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
  };
  res.status(500).json(response);
});

export default app;
