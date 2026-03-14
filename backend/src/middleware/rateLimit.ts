import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis';
import { AppError } from '../utils/errors';
import { AuthenticatedRequest } from '../types';

const DEFAULT_WINDOW_SECONDS = 60;
const DEFAULT_MAX_REQUESTS = 60;

interface RateLimitOptions {
  windowSeconds?: number;
  maxRequests?: number;
  keyPrefix?: string;
}

/**
 * Redis-based rate limiter middleware.
 * Uses a sliding window counter per user.
 *
 * Default: 60 requests per 60-second window.
 */
export function rateLimit(options: RateLimitOptions = {}) {
  const {
    windowSeconds = DEFAULT_WINDOW_SECONDS,
    maxRequests = DEFAULT_MAX_REQUESTS,
    keyPrefix = 'rl',
  } = options;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      // If no user is attached (unauthenticated route), use IP-based limiting
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const key = `${keyPrefix}:ip:${ip}`;
      await checkLimit(key, windowSeconds, maxRequests, res, next);
      return;
    }

    const key = `${keyPrefix}:${user.id}`;
    await checkLimit(key, windowSeconds, maxRequests, res, next);
  };
}

async function checkLimit(
  key: string,
  windowSeconds: number,
  maxRequests: number,
  res: Response,
  next: NextFunction
): Promise<void> {
  const current = await redis.incr(key);

  if (current === 1) {
    // First request in this window - set expiry
    await redis.expire(key, windowSeconds);
  }

  // Set rate limit headers
  const ttl = await redis.ttl(key);
  res.setHeader('X-RateLimit-Limit', maxRequests);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current));
  res.setHeader('X-RateLimit-Reset', Math.floor(Date.now() / 1000) + Math.max(0, ttl));

  if (current > maxRequests) {
    throw new AppError(
      429,
      `Rate limit exceeded. Try again in ${Math.max(0, ttl)} seconds.`,
      'RATE_LIMIT_EXCEEDED'
    );
  }

  next();
}

/**
 * Stricter rate limiter for sensitive endpoints (e.g. auth, reports).
 * 10 requests per 60 seconds.
 */
export const strictRateLimit = rateLimit({
  windowSeconds: 60,
  maxRequests: 10,
  keyPrefix: 'rl_strict',
});

export default rateLimit;
