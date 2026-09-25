import { Router } from "express";
import { JobApplicationController } from "../controllers/jobApplication.controller.js";

export function createJobApplicationRouter(controller = new JobApplicationController()) {
const router = Router();

router.get("/", controller.list);
router.get("/:applicationId", controller.get);
router.post("/", controller.create);
router.put("/:applicationId", controller.update);
router.delete("/:applicationId", controller.remove);

return router;
}

export default createJobApplicationRouter();