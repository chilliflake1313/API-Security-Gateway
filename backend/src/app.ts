import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { rateLimiter } from './middleware/rateLimiter';
import apiRoutes from './routes/api.routes';
import { logRequest } from './utils/logger';
import { config } from './config/env';

const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
  origin: config.nodeEnv === 'production'
    ? ['http://localhost', 'http://localhost:80']
    : '*',
  credentials: true,
}));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logRequest({
      timestamp: new Date().toISOString(),
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      method: req.method,
      endpoint: req.path,
      status: res.statusCode,
      action: res.statusCode === 429 ? 'blocked' : 'allowed',
      reason: `${duration}ms`,
    });
  });

  next();
});

// Apply rate limiter to all /api routes
app.use('/api', rateLimiter);

// Routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'API Security Gateway',
    version: '1.0.0',
    status: 'running',
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
  });
});

export default app;
