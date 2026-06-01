import { describe, it, expect, vi, afterEach } from "vitest";

let RateLimiter: any;

beforeEach(async () => {
  vi.useFakeTimers();
  vi.resetModules();
  const mod = await import("../rate-limit");
  RateLimiter = mod.loginRateLimiter.constructor;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("RateLimiter", () => {
  it("allows requests under the limit", () => {
    const limiter = new RateLimiter(3, 60_000);
    expect(limiter.test("a").success).toBe(true);
    expect(limiter.test("a").success).toBe(true);
    expect(limiter.test("a").success).toBe(true);
  });

  it("blocks requests over the limit", () => {
    const limiter = new RateLimiter(3, 60_000);
    limiter.test("a");
    limiter.test("a");
    limiter.test("a");
    expect(limiter.test("a").success).toBe(false);
  });

  it("respects independent keys", () => {
    const limiter = new RateLimiter(2, 60_000);
    limiter.test("a");
    limiter.test("a");
    expect(limiter.test("a").success).toBe(false);
    expect(limiter.test("b").success).toBe(true);
  });

  it("resets after window expires", () => {
    const limiter = new RateLimiter(1, 1000);
    limiter.test("a");
    expect(limiter.test("a").success).toBe(false);

    vi.advanceTimersByTime(1001);
    expect(limiter.test("a").success).toBe(true);
  });

  it("returns correct remaining count", () => {
    const limiter = new RateLimiter(5, 60_000);
    const r1 = limiter.test("a");
    expect(r1.remaining).toBe(4);
    const r2 = limiter.test("a");
    expect(r2.remaining).toBe(3);
  });

  it("returns resetAt timestamp", () => {
    const limiter = new RateLimiter(1, 60_000);
    const result = limiter.test("a");
    expect(result.resetAt).toBeGreaterThan(Date.now());
  });
});
