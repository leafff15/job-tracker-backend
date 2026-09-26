import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";

export function createAuthRouter(controller = new AuthController()) {
  const router = Router();
  router.post("/register", controller.register);
  router.post("/login", controller.login);
  router.post("/logout", controller.logout);
  return router;
}

export default createAuthRouter();
