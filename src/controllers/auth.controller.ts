import type { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import { ValidationError } from "../validators/jobApplication.validator.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};
const cookieMaxAge = 7 * 24 * 60 * 60 * 1000;

export class AuthController {
  constructor(private readonly auth = new AuthService()) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user, token } = await this.auth.register(req.body);
      res.cookie("token", token, { ...cookieOptions, maxAge: cookieMaxAge });
      res.status(201).json({ user: { user_id: user.user_id, username: user.username, email: user.email } });
    } catch (error) { next(error); }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user, token } = await this.auth.login(req.body);
      res.cookie("token", token, { ...cookieOptions, maxAge: cookieMaxAge });
      res.json({ user: { user_id: user.user_id, username: user.username, email: user.email } });
    } catch (error) {
      if (error instanceof ValidationError && error.message === "Invalid email or password") {
        return res.status(401).json({ error: error.message });
      }
      next(error);
    }
  };

  logout = (_req: Request, res: Response) => {
    res.clearCookie("token", cookieOptions);
    res.status(200).json({ message: "Logged out" });
  };
}
