import { JobApplicationRepository, type JobApplicationInput } from "../repositories/jobApplication.repository.js";
import { NotFoundError } from "./errors.js";
import { StatusRepository } from "../repositories/status.repository.js";

export class JobApplicationService {
  constructor(
    private readonly repository = new JobApplicationRepository(),
    private readonly statusRepository = new StatusRepository(),
  ) {}

  list(userId: number) {
    return this.repository.findAll(userId);
  }

  async get(applicationId: number, userId: number) {
    const application = await this.repository.findById(applicationId, userId);

    if (!application) {
      throw new NotFoundError("Job application not found");
    }

    return application;
  }

  async create(userId: number, input: unknown) {
    const data = input as JobApplicationInput;

    const status = await this.statusRepository.findByIdAndUser(
      data.status_id,
      userId,
    );

    if (!status) {
      throw new NotFoundError("Status not found");
    }

    return this.repository.create({
      ...data,
      user_id: userId,
    });
  }

  async update(applicationId: number, userId: number, input: unknown) {
    await this.get(applicationId, userId);

    const data = input as Partial<JobApplicationInput>;

    if (data.status_id !== undefined) {
      const status = await this.statusRepository.findByIdAndUser(
        data.status_id,
        userId,
      );

      if (!status) {
        throw new NotFoundError("Status not found");
      }
    }

    return this.repository.update(applicationId, {
      ...data,
      user_id: userId,
    });
  }

  async remove(applicationId: number, userId: number) {
    await this.get(applicationId, userId);

    await this.repository.delete(applicationId);
  }
}