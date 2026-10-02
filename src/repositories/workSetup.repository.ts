import { prisma } from "../config/database.js";
import type { PrismaClient } from "../generated/prisma/client.js";

export class WorkSetupRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  findAll() {
    return this.db.work_setup.findMany({
      orderBy: { work_setup_id: "asc" },
      select: { work_setup_id: true, work_setup_name: true },
    });
  }
}