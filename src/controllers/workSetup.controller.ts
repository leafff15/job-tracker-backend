import type { NextFunction, Request, Response } from "express";
import { WorkSetupService } from "../services/workSetup.service.js";

export class WorkSetupController {
  constructor(private readonly service = new WorkSetupService()) {}

  list = async (_req: Request, res: Response, next: NextFunction) => {
    try { res.json(await this.service.list()); } catch (error) { next(error); }
  };
}