import express from "express";
import { jobApplicationErrorHandler } from "./controllers/jobApplication.controller.js";
import { createJobApplicationRouter } from "./routes/jobApplication.routes.js";

export function createApp(router = createJobApplicationRouter()) {
const app = express();

app.use(express.json());
app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));
app.use("/api/job-applications", router);
app.use(jobApplicationErrorHandler);

return app;
}

export default createApp();