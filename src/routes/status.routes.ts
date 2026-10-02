import { Router } from "express";
import { StatusController } from "../controllers/status.controller.js";

export function createStatusRouter(controller = new StatusController()) {
  const router = Router();
  router.get("/", controller.list);
  return router;
}