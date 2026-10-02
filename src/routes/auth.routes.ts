import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/authenticate.js";

export function createAuthRouter(controller = new AuthController()) {
  const router = Router();
  router.post("/register", controller.register);
  router.post("/login", loginRateLimiter, controller.login);
  router.post("/logout", controller.logout);
  router.get("/me", authenticate, controller.me);
  return router;
}

export default createAuthRouter();