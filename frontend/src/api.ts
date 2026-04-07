// API Configuration
const API_BASE = '/api';

// Type Definitions
export interface RateLimitStatus {
  ip: string;
  current: number;
  limit: number;
  remaining: number;
  resetAt: number;
  isBlocked: boolean;
}

export interface TestResponse {
  message: string;
  ip: string;
  timestamp: string;
}

export interface ApiError {
  error: string;
  timestamp: string;
}

// API Functions (Pure - No UI Logic)
export async function fetchRateLimitStatus(): Promise<RateLimitStatus> {
  const response = await fetch(`${API_BASE}/ratelimit/status`);
  if (!response.ok) throw new Error('Failed to fetch status');
  const data = await response.json();
  return data.data;
}

export async function sendTestRequest(): Promise<TestResponse> {
  const response = await fetch(`${API_BASE}/test`);
  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Rate limit exceeded');
    }
    throw new Error('Request failed');
  }
  const data = await response.json();
  return data.data;
}

export async function resetRateLimit(): Promise<void> {
  const response = await fetch(`${API_BASE}/ratelimit/reset`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to reset rate limit');
}
