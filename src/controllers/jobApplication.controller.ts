import type { Request, Response, NextFunction } from "express";
import { JobApplicationService } from "../services/jobApplication.service.js";
import { NotFoundError } from "../services/errors.js";
import { ValidationError } from "../validators/jobApplication.validator.js";

export class JobApplicationController {
  constructor(private readonly service = new JobApplicationService()) {}

  list = async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await this.service.list()); } catch (error) { next(error); }
  };
  get = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await this.service.get(res.locals.applicationId as number)); } catch (error) { next(error); }
  };
  create = async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await this.service.create(req.body)); } catch (error) { next(error); }
  };
  update = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await this.service.update(res.locals.applicationId as number, req.body)); } catch (error) { next(error); }
  };
  remove = async (req: Request, res: Response, next: NextFunction) => {
    try { await this.service.remove(res.locals.applicationId as number); res.status(204).end(); } catch (error) { next(error); }
  };
}

export function jobApplicationErrorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ValidationError) return res.status(400).json({ error: error.message });
  if (error instanceof NotFoundError) return res.status(404).json({ error: error.message });
  const parserError = error as { type?: string; status?: number } | null;
  if (parserError?.type === "entity.parse.failed" || (error instanceof SyntaxError && parserError?.status === 400)) {
    return res.status(400).json({ error: "Invalid JSON request body" });
  }
  const code = (error as { code?: string } | null)?.code;
  if (code === "P2025") return res.status(404).json({ error: "Job application not found" });
  if (code === "P2003" || code === "P2002") return res.status(400).json({ error: "Related record is invalid or already exists" });
  return res.status(500).json({ error: "Internal server error" });
}