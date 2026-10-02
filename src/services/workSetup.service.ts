import { WorkSetupRepository } from "../repositories/workSetup.repository.js";

export class WorkSetupService {
  constructor(private readonly repository = new WorkSetupRepository()) {}

  list() { return this.repository.findAll(); }
}