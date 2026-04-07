import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  ApiResponse,
  TestResponse,
  RateLimitStatus,
  MonitorResponse,
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Response interceptor for rate limit headers
    this.client.interceptors.response.use(
      (response) => {
        const rateLimit = {
          limit: response.headers['x-ratelimit-limit'],
          remaining: response.headers['x-ratelimit-remaining'],
          reset: response.headers['x-ratelimit-reset'],
        };
        response.data.rateLimit = rateLimit;
        return response;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  async test(): Promise<ApiResponse<TestResponse>> {
    try {
      const response = await this.client.get<ApiResponse<TestResponse>>('/test');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getStatus(): Promise<ApiResponse<RateLimitStatus>> {
    try {
      const response = await this.client.get<ApiResponse<RateLimitStatus>>('/status');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getMonitor(): Promise<ApiResponse<MonitorResponse>> {
    try {
      const response = await this.client.get<ApiResponse<MonitorResponse>>('/monitor');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: unknown): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 429) {
        return new Error('Rate limit exceeded. Please wait before trying again.');
      }
      if (axiosError.code === 'ECONNABORTED') {
        return new Error('Request timeout. Server might be slow.');
      }
      return new Error(axiosError.message || 'API request failed');
    }
    return new Error('Unknown error occurred');
  }
}

export const apiService = new ApiService();
