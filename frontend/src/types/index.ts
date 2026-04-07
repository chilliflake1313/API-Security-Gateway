export interface RateLimitStatus {
  ip: string;
  current: number;
  limit: number;
  remaining: number;
  resetAt: number;
  isBlocked: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface TestResponse {
  message: string;
  ip: string;
}

export interface MonitorResponse {
  redis: boolean;
  uptime: number;
  timestamp: string;
}

export interface RequestLog {
  id: string;
  timestamp: string;
  ip: string;
  method: string;
  endpoint: string;
  status: number;
  action: 'allowed' | 'blocked' | 'warning';
  reason?: string;
}
