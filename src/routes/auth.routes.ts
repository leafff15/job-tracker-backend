import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { loginRateLimiter } from "../middleware/rateLimiter.js";
import { resendVerificationCodeRateLimiter } from "../middleware/rateLimiter.js";

export function createAuthRouter(controller = new AuthController()) {
  const router = Router();
  router.get("/registration-status", controller.registrationStatus);
  router.post("/register", controller.register);
  router.post("/verify-email", controller.verifyEmail);
  router.post("/email-registration-status",controller.checkEmailRegistrationStatus,);
  router.post("/resend-verification-code", resendVerificationCodeRateLimiter, controller.resendVerificationCode,);
    router.post("/password-reset/request", controller.requestPasswordReset);
  router.post("/password-reset/verify", controller.verifyPasswordResetCode);
  router.post("/password-reset/reset", controller.resetPassword);
  router.post("/login", loginRateLimiter, controller.login);
  router.post("/logout", controller.logout);
  router.get("/me", authenticate, controller.me);
  return router;
}

export default createAuthRouter();
