import { StatusRepository } from "../repositories/status.repository.js";

export class StatusService {
  constructor(private readonly repository = new StatusRepository()) {}

  listForUser(userId: number) { return this.repository.findByUserId(userId); }
}