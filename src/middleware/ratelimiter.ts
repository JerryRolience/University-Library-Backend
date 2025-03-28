import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

// Configure rate limiting (e.g., 5 requests per minute per IP)
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(5, "60s"), // 5 requests per 60 seconds
  analytics: true, // Optional: Enable Upstash analytics
});

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const ip =
    req.ip ||
    (Array.isArray(req.headers["x-forwarded-for"])
      ? req.headers["x-forwarded-for"][0]
      : req.headers["x-forwarded-for"]) ||
    "127.0.0.1";

  const { success, reset } = await ratelimit.limit(ip);

  if (!success) {
    res.status(429).json({
      message: "Too many requests. Please try again later.",
      retryAfter: Math.ceil(reset - Date.now() / 1000), // Retry time in seconds
    });
    return;
  }

  next();
};
