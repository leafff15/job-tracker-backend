import { prisma } from "../config/database.js";
import type { PrismaClient } from "../generated/prisma/client.js";

export class StatusRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  findByUserId(userId: number) {
    return this.db.status.findMany({
      where: { user_id: userId },
      orderBy: { status_id: "asc" },
      select: { status_id: true, status_name: true },
    });
  }
}