import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request { user: { user_id: number }; }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.JWT_SECRET;
  const token = req.cookies?.token;
  if (!secret || typeof token !== "string") return res.status(401).json({ error: "Authentication required" });
  try {
    const payload = jwt.verify(token, secret);
    if (typeof payload === "string" || typeof payload.user_id !== "number" || !Number.isSafeInteger(payload.user_id)) {
      return res.status(401).json({ error: "Invalid authentication token" });
    }
    req.user = { user_id: payload.user_id };
    next();
  } catch {
    res.status(401).json({ error: "Invalid authentication token" });
  }
}
