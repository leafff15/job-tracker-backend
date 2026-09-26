import { Router } from "express";
import { JobApplicationController } from "../controllers/jobApplication.controller.js";
import { validateApplicationId, validateCreateJobApplication, validateUpdateJobApplication } from "../validators/jobApplication.validator.js";

export function createJobApplicationRouter(controller = new JobApplicationController()) {
        const router = Router();

        router.get("/", controller.list);
        router.get("/:applicationId", validateApplicationId, controller.get);
        router.post("/", validateCreateJobApplication, controller.create);
        router.put("/:applicationId", validateApplicationId, validateUpdateJobApplication, controller.update);
        router.delete("/:applicationId", validateApplicationId, controller.remove);

        return router;
    }

export default createJobApplicationRouter();