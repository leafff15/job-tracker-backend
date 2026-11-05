import type { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import { successResponse } from "../utils/api-response.js";
import { RegistrationService } from "../services/registration.service.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};
const cookieMaxAge = 7 * 24 * 60 * 60 * 1000;

export class AuthController {
  private readonly registration = new RegistrationService();

  constructor(private readonly auth = new AuthService()) {}

  registrationStatus = async (
    _req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const status = await this.registration.getStatus();
      res.json(successResponse(status));
    } catch (error) {
      next(error);
    }
  };

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = await this.auth.register(req.body);

      res.status(201).json(
        successResponse({
          user: {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
          },
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.auth.verifyEmail(req.body);

      res.json(successResponse({ user }));
    } catch (error) {
      next(error);
    }
  };

  checkEmailRegistrationStatus = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await this.auth.getEmailRegistrationStatus(req.body);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user, token } = await this.auth.login(req.body);

      res.cookie("token", token, {
        ...cookieOptions,
        maxAge: cookieMaxAge,
      });

      res.json(
        successResponse({
          user: {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
          },
        }),
      );
    } catch (error) {
      next(error);
    }
  };

  me = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.auth.findById(req.user.user_id);
      if (!user) {
        res.clearCookie("token", cookieOptions);
        return res.status(401).json({ error: "Authentication required" });
      }
      res.json(successResponse({ user }));
    } catch (error) {
      next(error);
    }
  };

  resendVerificationCode = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await this.auth.resendVerificationCode(req.body);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

  requestPasswordReset = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await this.auth.requestPasswordReset(req.body);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

  verifyPasswordResetCode = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const result = await this.auth.verifyPasswordResetCode(req.body);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

  resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.auth.resetPassword(req.body);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  };

  logout = (_req: Request, res: Response) => {
    res.clearCookie("token", cookieOptions);
    res.status(200).json(successResponse({ message: "Logged out" }));
  };
}
