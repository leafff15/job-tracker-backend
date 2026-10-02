import { Router } from "express";
import { WorkSetupController } from "../controllers/workSetup.controller.js";

export function createWorkSetupRouter(controller = new WorkSetupController()) {
  const router = Router();
  router.get("/", controller.list);
  return router;
}