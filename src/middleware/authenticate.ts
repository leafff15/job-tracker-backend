import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../services/errors.js";
import { env } from "../config/env.js";

declare global {
  namespace Express {
    interface Request {
      user: {
        user_id: number;
      };
    }
  }
}

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  const token = req.cookies?.token;

  if (typeof token !== "string") {
    return next(new UnauthorizedError("Authentication required","AUTHENTICATION_REQUIRED"));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret, {
      algorithms: ["HS256"],
    });

    if (
      typeof payload === "string" ||
      typeof payload.user_id !== "number" ||
      !Number.isSafeInteger(payload.user_id)
    ) {
      return next(
        new UnauthorizedError("Invalid authentication token", "INVALID_AUTHENTICATION_TOKEN")
      );
    }

    req.user = {
      user_id: payload.user_id,
    };

    next();
  } catch {
    next(new UnauthorizedError("Invalid authentication token", "INVALID_AUTHENTICATION_TOKEN"));
  }
}