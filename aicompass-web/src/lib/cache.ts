import { Redis } from '@upstash/redis';

// Initialize Redis client (optional - will skip if not configured)
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

/**
 * Get value from cache
 * Returns null if cache is not configured or key not found
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const client = getRedis();
  if (!client) {
    console.log('[Cache] Redis not configured, skipping cache get:', key);
    return null;
  }
  
  try {
    const data = await client.get(key);
    if (!data) return null;
    return JSON.parse(data as string) as T;
  } catch (error) {
    console.error('[Cache] Get error:', error);
    return null;
  }
}

/**
 * Set value in cache with TTL
 * @param key - Cache key
 * @param value - Value to cache
 * @param ttlSeconds - Time to live in seconds
 */
export async function setCache<T>(key: string, value: T, ttlSeconds: number): Promise<boolean> {
  const client = getRedis();
  if (!client) {
    console.log('[Cache] Redis not configured, skipping cache set:', key);
    return false;
  }
  
  try {
    await client.set(key, JSON.stringify(value), { ex: ttlSeconds });
    return true;
  } catch (error) {
    console.error('[Cache] Set error:', error);
    return false;
  }
}

/**
 * Delete a specific key from cache
 */
export async function deleteCache(key: string): Promise<boolean> {
  const client = getRedis();
  if (!client) return false;
  
  try {
    await client.del(key);
    return true;
  } catch (error) {
    console.error('[Cache] Delete error:', error);
    return false;
  }
}

/**
 * Check if cache is available
 */
export function isCacheAvailable(): boolean {
  return getRedis() !== null;
}
