import { Request, Response, NextFunction } from 'express';
import { redisService } from '../services/redis.service';
import { config } from '../config/env';
import { HTTP_STATUS, REDIS_KEYS, RATE_LIMIT_MESSAGES, LOG_ACTIONS } from '../utils/constants';
import { logRequest, logError } from '../utils/logger';

export async function rateLimiterMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const ip = req.ip || 'unknown';
  const method = req.method;
  const endpoint = req.path;
  const timestamp = Date.now();

  try {
    // Check if IP is blocked
    const blockedKey = `${REDIS_KEYS.blockedIpPrefix}${ip}`;
    const isBlocked = await redisService.get(blockedKey);

    if (isBlocked) {
      logRequest({
        timestamp: new Date().toISOString(),
        ip,
        method,
        endpoint,
        status: HTTP_STATUS.TOO_MANY_REQUESTS,
        action: LOG_ACTIONS.BLOCKED,
        reason: RATE_LIMIT_MESSAGES.BLOCKED_IP,
      });

      return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        error: RATE_LIMIT_MESSAGES.BLOCKED_IP,
        timestamp: new Date().toISOString(),
      });
    }

    // Get rate limit key
    const rateLimitKey = `${REDIS_KEYS.rateLimitPrefix}${ip}`;
    
    // Increment counter
    const count = await redisService.increment(rateLimitKey);

    // Set expiry on first request
    if (count === 1) {
      await redisService.setExpiry(rateLimitKey, config.rateLimit.window);
    }

    // Check if limit exceeded
    if (count > config.rateLimit.max) {
      // Block this IP
      const violations = Math.floor((count - config.rateLimit.max) / 10) + 1;
      const banDuration = Math.min(violations * 60, 3600); // Max 1 hour

      await redisService.set(blockedKey, 'blocked', banDuration);

      logRequest({
        timestamp: new Date().toISOString(),
        ip,
        method,
        endpoint,
        status: HTTP_STATUS.TOO_MANY_REQUESTS,
        action: LOG_ACTIONS.BLOCKED,
        reason: RATE_LIMIT_MESSAGES.BLOCKED_LIMIT,
      });

      return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        error: RATE_LIMIT_MESSAGES.BLOCKED_LIMIT,
        timestamp: new Date().toISOString(),
      });
    }

    // Request allowed - add rate limit info to response header
    const remaining = config.rateLimit.max - count;
    res.setHeader('X-RateLimit-Limit', config.rateLimit.max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(timestamp / 1000) + config.rateLimit.window);

    logRequest({
      timestamp: new Date().toISOString(),
      ip,
      method,
      endpoint,
      status: HTTP_STATUS.OK,
      action: LOG_ACTIONS.ALLOWED,
    });

    next();
  } catch (error) {
    logError(error as Error, 'rateLimiterMiddleware');

    // Fail open: allow request if Redis is down
    res.setHeader('X-RateLimit-Error', 'Service degraded');
    next();
  }
}
