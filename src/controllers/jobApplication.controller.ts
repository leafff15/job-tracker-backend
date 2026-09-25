import type { Request, Response, NextFunction } from "express";
import { NotFoundError, ValidationError, JobApplicationService } from "../services/jobApplication.service.js";

export class JobApplicationController {
  constructor(private readonly service = new JobApplicationService()) {}

  list = async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await this.service.list()); } catch (error) { next(error); }
  };
  get = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await this.service.get(this.id(req))); } catch (error) { next(error); }
  };
  create = async (req: Request, res: Response, next: NextFunction) => {
    try { res.status(201).json(await this.service.create(req.body)); } catch (error) { next(error); }
  };
  update = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await this.service.update(this.id(req), req.body)); } catch (error) { next(error); }
  };
  remove = async (req: Request, res: Response, next: NextFunction) => {
    try { await this.service.remove(this.id(req)); res.status(204).end(); } catch (error) { next(error); }
  };

  private id(req: Request): number {
    const id = Number(req.params.applicationId);
    if (!Number.isSafeInteger(id) || id <= 0) throw new ValidationError("applicationId must be a positive integer");
    return id;
  }
}

export function jobApplicationErrorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ValidationError) return res.status(400).json({ error: error.message });
  if (error instanceof NotFoundError) return res.status(404).json({ error: error.message });
  const code = (error as { code?: string } | null)?.code;
  if (code === "P2025") return res.status(404).json({ error: "Job application not found" });
  if (code === "P2003" || code === "P2002") return res.status(400).json({ error: "Related record is invalid or already exists" });
  return res.status(500).json({ error: "Internal server error" });
}
