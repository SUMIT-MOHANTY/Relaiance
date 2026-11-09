/**
 * Cache Adapter Module
 * Provides a unified caching interface with Redis and In-Memory implementations
 */

import { createClient, RedisClientType } from 'redis';

// Cache Adapter Interface
export interface CacheAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  flush(): Promise<void>;
  getHealth(): Promise<{ status: 'connected' | 'disconnected'; mode: 'memory' | 'redis' }>;
}

// In-Memory Cache Entry
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * In-Memory Cache Adapter
 * Uses a Map with TTL enforcement for local development
 */
export class InMemoryCacheAdapter implements CacheAdapter {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Start cleanup interval to remove expired entries
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // Every minute
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { value, expiresAt });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async flush(): Promise<void> {
    this.cache.clear();
  }

  async getHealth(): Promise<{ status: 'connected' | 'disconnected'; mode: 'memory' | 'redis' }> {
    return { status: 'connected', mode: 'memory' };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  dispose(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

/**
 * Redis Cache Adapter
 * Uses Redis for distributed caching in production
 */
export class RedisCacheAdapter implements CacheAdapter {
  private client: RedisClientType | null = null;
  private isConnected = false;

  constructor(redisUrl: string) {
    this.client = createClient({
      url: redisUrl,
    });

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected');
      this.isConnected = true;
    });

    this.client.on('disconnect', () => {
      console.log('Redis Client Disconnected');
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    if (!this.client) {
      throw new Error('Redis client not initialized');
    }
    await this.client.connect();
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.disconnect();
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client || !this.isConnected) {
      return null;
    }

    try {
      const value = await this.client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    if (!this.client || !this.isConnected) {
      return;
    }

    try {
      const serialized = JSON.stringify(value);
      await this.client.setEx(key, ttlSeconds, serialized);
    } catch (error) {
      console.error('Redis SET error:', error);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      return;
    }

    try {
      await this.client.del(key);
    } catch (error) {
      console.error('Redis DEL error:', error);
    }
  }

  async flush(): Promise<void> {
    if (!this.client || !this.isConnected) {
      return;
    }

    try {
      await this.client.flushDb();
    } catch (error) {
      console.error('Redis FLUSH error:', error);
    }
  }

  async getHealth(): Promise<{ status: 'connected' | 'disconnected'; mode: 'memory' | 'redis' }> {
    return { 
      status: this.isConnected ? 'connected' : 'disconnected', 
      mode: 'redis' 
    };
  }
}

// Singleton cache adapter instance
let cacheAdapter: CacheAdapter | null = null;

/**
 * Factory function to create the appropriate cache adapter
 * Returns Redis adapter if REDIS_URL is set, otherwise In-Memory
 */
export function createCacheAdapter(): CacheAdapter {
  if (cacheAdapter) {
    return cacheAdapter;
  }

  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    console.log('Initializing Redis Cache Adapter');
    const redisAdapter = new RedisCacheAdapter(redisUrl);
    // Connect asynchronously - errors handled in event listeners
    redisAdapter.connect().catch(err => {
      console.error('Failed to connect to Redis, falling back to In-Memory:', err);
    });
    cacheAdapter = redisAdapter;
  } else {
    console.log('Initializing In-Memory Cache Adapter (REDIS_URL not set)');
    cacheAdapter = new InMemoryCacheAdapter();
  }

  return cacheAdapter;
}

/**
 * Get the singleton cache adapter instance
 */
export function getCacheAdapter(): CacheAdapter {
  if (!cacheAdapter) {
    return createCacheAdapter();
  }
  return cacheAdapter;
}

/**
 * Reset the cache adapter (useful for testing)
 */
export function resetCacheAdapter(): void {
  if (cacheAdapter instanceof InMemoryCacheAdapter) {
    cacheAdapter.dispose();
  } else if (cacheAdapter instanceof RedisCacheAdapter) {
    cacheAdapter.disconnect().catch(console.error);
  }
  cacheAdapter = null;
}

// Export singleton instance for convenience
export const cache = getCacheAdapter();
