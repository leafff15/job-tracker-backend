import { JobApplicationRepository, type JobApplicationInput } from "../repositories/jobApplication.repository.js";

export class NotFoundError extends Error {}
export class ValidationError extends Error {}

const requiredStrings = ["company_name", "position", "location"] as const;
const requiredNumbers = ["user_id", "status_id", "work_setup_id"] as const;
const allowedFields = new Set([
  ...requiredStrings, ...requiredNumbers, "date_applied", "salary", "notes",
]);

export class JobApplicationService {
  constructor(private readonly repository = new JobApplicationRepository()) {}

  list() { return this.repository.findAll(); }

  async get(applicationId: number) {
    const application = await this.repository.findById(applicationId);
    if (!application) throw new NotFoundError("Job application not found");
    return application;
  }

  async create(input: unknown) {
    const data = this.validate(input, true) as JobApplicationInput;
    return this.repository.create(data);
  }

  async update(applicationId: number, input: unknown) {
    await this.get(applicationId);
    const data = this.validate(input, false);
    return this.repository.update(applicationId, data as Partial<JobApplicationInput>);
  }

  async remove(applicationId: number) {
    await this.get(applicationId);
    await this.repository.delete(applicationId);
  }

  private validate(input: unknown, creating: boolean): Record<string, unknown> {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      throw new ValidationError("Request body must be a JSON object");
    }
    const body = input as Record<string, unknown>;
    for (const key of Object.keys(body)) {
      if (!allowedFields.has(key)) throw new ValidationError(`Unknown field: ${key}`);
    }
    if (creating) {
      for (const key of [...requiredStrings, ...requiredNumbers, "date_applied"]) {
        if (body[key] === undefined || body[key] === null || body[key] === "") {
          throw new ValidationError(`${key} is required`);
        }
      }
    } else if (Object.keys(body).length === 0) {
      throw new ValidationError("At least one field is required");
    }
    for (const key of requiredStrings) {
      if (body[key] !== undefined && (typeof body[key] !== "string" || body[key].trim() === "")) {
        throw new ValidationError(`${key} must be a non-empty string`);
      }
    }
    for (const key of requiredNumbers) {
      if (body[key] !== undefined && (!Number.isInteger(body[key]) || Number(body[key]) <= 0)) {
        throw new ValidationError(`${key} must be a positive integer`);
      }
    }
    if (body.salary !== undefined && body.salary !== null && (!Number.isInteger(body.salary) || Number(body.salary) < 0)) {
      throw new ValidationError("salary must be a non-negative integer or null");
    }
    if (body.notes !== undefined && body.notes !== null && typeof body.notes !== "string") {
      throw new ValidationError("notes must be a string or null");
    }
    if (body.date_applied !== undefined) {
      if (typeof body.date_applied !== "string" || Number.isNaN(Date.parse(body.date_applied))) {
        throw new ValidationError("date_applied must be a valid date string");
      }
      body.date_applied = new Date(body.date_applied);
    }
    return body;
  }
}