import express from "express";
import cookieParser from "cookie-parser";
import { jobApplicationErrorHandler } from "./controllers/jobApplication.controller.js";
import { createJobApplicationRouter } from "./routes/jobApplication.routes.js";
import { createAuthRouter } from "./routes/auth.routes.js";
import { authenticate } from "./middleware/authenticate.js";

export function createApp(router = createJobApplicationRouter()) {
const app = express();

app.use(express.json());
app.use(cookieParser());
app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));
app.use("/api/auth", createAuthRouter());
app.use("/api/job-applications", authenticate, router);
app.use(jobApplicationErrorHandler);

return app;
}

export default createApp();
