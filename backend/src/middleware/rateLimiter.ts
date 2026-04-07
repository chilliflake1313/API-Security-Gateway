import { Request, Response, NextFunction } from 'express';
import redisService from '../services/redis.service';
import { config } from '../config/env';

// Exempt these endpoints from rate limiting
const EXEMPT_PATHS = ['/monitor', '/ratelimit/status', '/ratelimit/reset'];

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Skip rate limiting for exempt paths
    if (EXEMPT_PATHS.includes(req.path)) {
      return next();
    }

    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `ratelimit:${ip}`;

    const limit = config.rateLimit.max;
    const window = config.rateLimit.window;

    // Increment counter
    const current = await redisService.increment(key);

    // Set expiry on first request
    if (current === 1) {
      await redisService.setExpiry(key, window);
    }

    // Get TTL
    const ttl = await redisService.ttl(key);
    const resetAt = Math.floor(Date.now() / 1000) + ttl;

    // Always set headers
    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', Math.max(0, limit - current).toString());
    res.setHeader('X-RateLimit-Reset', resetAt);

    // Check if exceeded
    if (current > limit) {
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        current,
        limit,
        resetAt,
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Rate limiter error:', error);
    next(); // Allow through on error
  }
};
