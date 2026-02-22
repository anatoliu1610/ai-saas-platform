import Redis from 'ioredis';

// Initialize Redis client
const getRedisClient = () => {
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    console.warn('⚠️ REDIS_URL not set - rate limiting disabled');
    return null;
  }
  
  return new Redis(redisUrl);
};

const redis = getRedisClient();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

/**
 * Rate limiting using sliding window algorithm
 * @param identifier - Unique identifier (user ID, IP, etc.)
 * @param limit - Max requests allowed in window
 * @param windowSeconds - Time window in seconds
 */
export async function rateLimit(
  identifier: string,
  limit: number = 100,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  if (!redis) {
    // If Redis is not configured, allow all requests
    return { success: true, remaining: limit, reset: Date.now() + windowSeconds * 1000 };
  }

  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  try {
    // Use Redis transaction for atomic operations
    const pipeline = redis.pipeline();
    
    // Remove old entries outside the window
    pipeline.zremrangebyscore(key, 0, windowStart);
    
    // Count current requests in window
    pipeline.zcard(key);
    
    // Add current request
    pipeline.zadd(key, now, `${now}-${Math.random()}`);
    
    // Set expiry on the key
    pipeline.expire(key, windowSeconds);
    
    const results = await pipeline.exec();
    const currentCount = results?.[1]?.[1] as number || 0;

    const remaining = Math.max(0, limit - currentCount - 1);
    const success = remaining >= 0;
    const reset = now + windowSeconds * 1000;

    return {
      success,
      remaining,
      reset,
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open - allow request if Redis fails
    return { success: true, remaining: limit, reset: now + windowSeconds * 1000 };
  }
}

/**
 * Simple rate limiting using INCR (more performant for fixed windows)
 */
export async function simpleRateLimit(
  identifier: string,
  limit: number = 100,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  if (!redis) {
    return { success: true, remaining: limit, reset: Date.now() + windowSeconds * 1000 };
  }

  const key = `ratelimit:simple:${identifier}`;
  const now = Date.now();

  try {
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }

    const ttl = await redis.ttl(key);
    const remaining = Math.max(0, limit - current);
    const success = current <= limit;
    const reset = now + (ttl > 0 ? ttl * 1000 : windowSeconds * 1000);

    return {
      success,
      remaining,
      reset,
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    return { success: true, remaining: limit, reset: now + windowSeconds * 1000 };
  }
}

/**
 * Clean up old rate limit keys (can be run periodically)
 */
export async function cleanupRateLimits(): Promise<number> {
  if (!redis) return 0;
  
  try {
    const keys = await redis.keys('ratelimit:*');
    if (keys.length === 0) return 0;
    
    let deleted = 0;
    for (const key of keys) {
      const ttl = await redis.ttl(key);
      if (ttl <= 0) {
        await redis.del(key);
        deleted++;
      }
    }
    return deleted;
  } catch (error) {
    console.error('Cleanup error:', error);
    return 0;
  }
}
