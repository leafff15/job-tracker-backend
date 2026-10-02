import type { NextFunction, Request, Response } from "express";
import { StatusService } from "../services/status.service.js";

export class StatusController {
  constructor(private readonly service = new StatusService()) {}

  list = async (req: Request, res: Response, next: NextFunction) => {
    try { res.json(await this.service.listForUser(req.user.user_id)); } catch (error) { next(error); }
  };
}