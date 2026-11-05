import { rateLimit } from "express-rate-limit";
import type { Request } from "express";

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many login attempts. Please try again later.",
    },
  },
});

export const resendVerificationCodeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  handler: (req, res, _next, options) => {
    const resetTime = (
      req as Request & {
        rateLimit?: {
          resetTime?: Date;
        };
      }
    ).rateLimit?.resetTime;

    const retryAfterSeconds = resetTime
      ? Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
      : Math.ceil(options.windowMs / 1000);

    res.setHeader("Retry-After", String(retryAfterSeconds));

    res.status(options.statusCode).json({
      success: false,
      error: {
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many verification code requests. Please try again later.",
        retryAfterSeconds,
      },
    });
  },
});