import { Router, Request, Response } from 'express';
import { redisService } from '../services/redis.service';
import { ApiResponse, RateLimitStatus } from '../types';
import { REDIS_KEYS } from '../utils/constants';

const router = Router();

// GET /api/test - simple test endpoint
router.get('/test', (req: Request, res: Response) => {
  const response: ApiResponse<{ message: string; ip: string }> = {
    success: true,
    data: {
      message: 'API is working',
      ip: req.ip || 'unknown',
    },
    timestamp: new Date().toISOString(),
  };
  res.json(response);
});

// GET /api/status - get rate limit status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const ip = req.ip || 'unknown';
    const rateLimitKey = `${REDIS_KEYS.rateLimitPrefix}${ip}`;
    const blockedKey = `${REDIS_KEYS.blockedIpPrefix}${ip}`;

    const current = await redisService.get(rateLimitKey);
    const blocked = await redisService.get(blockedKey);
    const ttl = await redisService.ttl(rateLimitKey);

    const currentCount = current ? parseInt(current) : 0;
    const limit = 100;
    const remaining = Math.max(0, limit - currentCount);

    const status: RateLimitStatus = {
      ip,
      current: currentCount,
      limit,
      remaining,
      resetAt: ttl > 0 ? Date.now() + ttl * 1000 : 0,
      isBlocked: !!blocked,
    };

    const response: ApiResponse<RateLimitStatus> = {
      success: true,
      data: status,
      timestamp: new Date().toISOString(),
    };

    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Failed to get status',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
  }
});

export default router;
