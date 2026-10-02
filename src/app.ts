import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { jobApplicationErrorHandler } from "./controllers/jobApplication.controller.js";
import { createJobApplicationRouter } from "./routes/jobApplication.routes.js";
import { createAuthRouter } from "./routes/auth.routes.js";
import { createStatusRouter } from "./routes/status.routes.js";
import { createWorkSetupRouter } from "./routes/workSetup.routes.js";
import { authenticate } from "./middleware/authenticate.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";

export function createApp(router = createJobApplicationRouter()) {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(requestLogger);

  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

  app.use("/api/auth", createAuthRouter());
  app.use("/api/statuses", authenticate, createStatusRouter());
  app.use("/api/work-setups", authenticate, createWorkSetupRouter());
  app.use("/api/job-applications", authenticate, router);

  app.use(jobApplicationErrorHandler);
  app.use(errorHandler);

  return app;
}

export default createApp();