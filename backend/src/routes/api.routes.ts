import { Router, Request, Response } from 'express';
import redisService from '../services/redis.service';
import { config } from '../config/env';

const router = Router();

// GET /api/test - Test endpoint
router.get('/test', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      message: 'Request successful',
      ip: req.ip || 'unknown',
      timestamp: new Date().toISOString(),
    },
  });
});

// GET /api/ratelimit/status - Get current rate limit status
router.get('/ratelimit/status', async (req: Request, res: Response) => {
  try {
    const ip = req.ip || 'unknown';
    const key = `ratelimit:${ip}`;

    const current = parseInt(await redisService.get(key) || '0', 10);
    const ttl = await redisService.ttl(key);
    const limit = config.rateLimit.max;
    const remaining = Math.max(0, limit - current);
    const resetAt = Date.now() / 1000 + ttl;

    res.json({
      success: true,
      data: {
        ip,
        current,
        limit,
        remaining,
        resetAt,
        isBlocked: current >= limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get status',
    });
  }
});

// POST /api/ratelimit/reset - Reset rate limit for current IP
router.post('/ratelimit/reset', async (req: Request, res: Response) => {
  try {
    const ip = req.ip || 'unknown';
    const key = `ratelimit:${ip}`;

    await redisService.delete(key);

    res.json({
      success: true,
      message: 'Rate limit reset successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to reset rate limit',
    });
  }
});

// GET /api/monitor - Health check
router.get('/monitor', async (req: Request, res: Response) => {
  const redisHealthy = await redisService.isHealthy();

  res.json({
    success: true,
    data: {
      redis: redisHealthy,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
