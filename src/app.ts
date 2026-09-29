import express from "express";
import cookieParser from "cookie-parser";
import { createJobApplicationRouter } from "./routes/jobApplication.routes.js";
import { createAuthRouter } from "./routes/auth.routes.js";
import { authenticate } from "./middleware/authenticate.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import cors from "cors";
import helmet from "helmet";

export function createApp(router = createJobApplicationRouter()) {
  const app = express();

  app.use(helmet());
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    }),
  );

  app.use(requestLogger);

  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

  app.use("/api/auth", createAuthRouter());
  app.use("/api/job-applications", authenticate, router);

  app.use(errorHandler);

  return app;
}

export default createApp();
