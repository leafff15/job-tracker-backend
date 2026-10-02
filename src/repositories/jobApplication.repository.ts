import { prisma } from "../config/database.js";
import type { PrismaClient } from "../generated/prisma/client.js";

export type JobApplicationInput = {
  user_id: number;
  status_id: number;
  work_setup_id: number;
  company_name: string;
  position: string;
  date_applied: Date;
  salary?: number | null;
  location: string;
  notes?: string | null;
};

export class JobApplicationRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  findAll(userId: number) {
    return this.db.job_application.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: "desc",
      },
    });
  }
  findById(applicationId: number, userId: number) {
    return this.db.job_application.findFirst({
      where: {
        application_id: applicationId,
        user_id: userId,
      },
    });
  }
  create(data: JobApplicationInput) { return this.db.job_application.create({ data }); }
  update(applicationId: number, data: Partial<JobApplicationInput>) {
    return this.db.job_application.update({ where: { application_id: applicationId }, data });
  }
  async delete(applicationId: number) {
    await this.db.job_application.delete({ where: { application_id: applicationId } });
  }
}