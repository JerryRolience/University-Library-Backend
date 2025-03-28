"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = void 0;
const redis_1 = require("@upstash/redis");
const ratelimit_1 = require("@upstash/ratelimit");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Initialize Upstash Redis client
const redis = new redis_1.Redis({
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
});
// Configure rate limiting (e.g., 5 requests per minute per IP)
const ratelimit = new ratelimit_1.Ratelimit({
    redis,
    limiter: ratelimit_1.Ratelimit.fixedWindow(5, "60s"), // 5 requests per 60 seconds
    analytics: true, // Optional: Enable Upstash analytics
});
const rateLimiter = async (req, res, next) => {
    const ip = req.ip ||
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
exports.rateLimiter = rateLimiter;
