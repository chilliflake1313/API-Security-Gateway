export interface RateLimitStatus {
  ip: string;
  current: number;
  limit: number;
  remaining: number;
  resetAt: number;
  isBlocked: boolean;
}

export interface LogEntry {
  timestamp: string;
  ip: string;
  method: string;
  endpoint: string;
  status: number;
  action: 'allowed' | 'blocked' | 'warning';
  reason?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface BlockedIp {
  ip: string;
  reason: string;
  blockedAt: number;
  unblockAt: number;
}

export interface RequestMetadata {
  ip: string;
  userAgent?: string;
  method: string;
  path: string;
  timestamp: number;
}
