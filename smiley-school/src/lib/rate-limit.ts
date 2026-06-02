/**
 * Simple in-memory rate limiter using sliding window.
 * Suitable for single-instance deployments (Docker/Vercel).
 * For multi-instance, switch to @upstash/ratelimit with Redis.
 */
import { headers } from "next/headers";

class RateLimiter {
  private store = new Map<string, number[]>();

  constructor(
    private maxRequests: number,
    private windowMs: number,
    private cleanupIntervalMs: number = 60_000
  ) {
    const timer = setInterval(() => this.cleanup(), cleanupIntervalMs);
    if (typeof timer.unref === "function") timer.unref();
  }

  test(key: string): { success: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const timestamps = this.store.get(key) ?? [];
    // Remove expired entries
    const valid = timestamps.filter((t) => now - t < this.windowMs);

    if (valid.length >= this.maxRequests) {
      const resetAt = valid[0] + this.windowMs;
      return { success: false, remaining: 0, resetAt };
    }

    valid.push(now);
    this.store.set(key, valid);

    return {
      success: true,
      remaining: this.maxRequests - valid.length,
      resetAt: valid[0] + this.windowMs,
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, timestamps] of this.store.entries()) {
      const valid = timestamps.filter((t) => now - t < this.windowMs);
      if (valid.length === 0) {
        this.store.delete(key);
      } else {
        this.store.set(key, valid);
      }
    }
  }
}

// 5 login attempts per 15 minutes per IP
export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000);

// 10 contact form submissions per hour per IP
export const contactRateLimiter = new RateLimiter(10, 60 * 60 * 1000);

/**
 * Extracts client IP from request headers (works in server actions via headers()).
 */
export async function getIpFromRequest(): Promise<string> {
  try {
    const h = await headers(); // Next.js headers() API
    return (
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip")?.trim() ??
      "unknown"
    );
  } catch {
    return "unknown";
  }
}
