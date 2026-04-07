import { createClient, RedisClientType } from 'redis';
import { config } from '../config/env';
import logger from '../utils/logger';

class RedisService {
  private client: RedisClientType | null = null;

  async connect(): Promise<void> {
    try {
      this.client = createClient({
        socket: {
          host: config.redis.host,
          port: config.redis.port,
        },
        database: config.redis.db,
      }) as RedisClientType;

      this.client.on('error', (err) => {
        logger.error('Redis Client Error', err);
      });

      this.client.on('connect', () => {
        logger.info('Redis client connected');
      });

      await this.client.connect();
      logger.info('Redis connected successfully');
    } catch (error) {
      logger.error('Failed to connect to Redis', { error });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      logger.info('Redis disconnected');
    }
  }

  async increment(key: string): Promise<number> {
    if (!this.client) throw new Error('Redis not connected');
    return await this.client.incr(key);
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) throw new Error('Redis not connected');
    return await this.client.get(key);
  }

  async set(key: string, value: string | number, ttl?: number): Promise<void> {
    if (!this.client) throw new Error('Redis not connected');
    
    if (ttl) {
      await this.client.setEx(key, ttl, String(value));
    } else {
      await this.client.set(key, String(value));
    }
  }

  async setExpiry(key: string, seconds: number): Promise<boolean> {
    if (!this.client) throw new Error('Redis not connected');
    return await this.client.expire(key, seconds);
  }

  async delete(key: string): Promise<number> {
    if (!this.client) throw new Error('Redis not connected');
    return await this.client.del(key);
  }

  async ttl(key: string): Promise<number> {
    if (!this.client) throw new Error('Redis not connected');
    return await this.client.ttl(key);
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.client) return false;
      await this.client.ping();
      return true;
    } catch {
      return false;
    }
  }
}

const redisService = new RedisService();
export default redisService;
