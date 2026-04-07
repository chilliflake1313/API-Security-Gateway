export const REDIS_KEYS = {
  rateLimitPrefix: 'ratelimit:',
  blockedIpPrefix: 'blocked:',
  requestCountPrefix: 'requests:',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const RATE_LIMIT_MESSAGES = {
  ALLOWED: 'Request allowed',
  BLOCKED_LIMIT: 'Rate limit exceeded',
  BLOCKED_IP: 'IP is temporarily blocked',
  REDIS_ERROR: 'Rate limit service unavailable',
} as const;

export const BAN_DURATIONS = {
  FIRST_VIOLATION: 60, // 1 minute
  SECOND_VIOLATION: 300, // 5 minutes
  THIRD_VIOLATION: 1800, // 30 minutes
} as const;

export const LOG_ACTIONS = {
  ALLOWED: 'allowed',
  BLOCKED: 'blocked',
  WARNING: 'warning',
  UNBANNED: 'unbanned',
} as const;
