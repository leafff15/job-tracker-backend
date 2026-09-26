import { JobApplicationRepository, type JobApplicationInput } from "../repositories/jobApplication.repository.js";
import { NotFoundError } from "./errors.js";

export class JobApplicationService {
  constructor(private readonly repository = new JobApplicationRepository()) {}

  list() { return this.repository.findAll(); }

  async get(applicationId: number) {
    const application = await this.repository.findById(applicationId);
    if (!application) throw new NotFoundError("Job application not found");
    return application;
  }

  async create(input: unknown) {
    return this.repository.create(input as JobApplicationInput);
  }

  async update(applicationId: number, input: unknown) {
    await this.get(applicationId);
    return this.repository.update(applicationId, input as Partial<JobApplicationInput>);
  }

  async remove(applicationId: number) {
    await this.get(applicationId);
    await this.repository.delete(applicationId);
  }
}