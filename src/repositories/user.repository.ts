import { prisma } from "../config/database.js";
import type { PrismaClient } from "../generated/prisma/client.js";

export class UserRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  findByEmail(email: string) {
    return this.db.user.findUnique({ where: { email } });
  }

  findById(userId: number) {
    return this.db.user.findUnique({
      where: { user_id: userId },
      select: { user_id: true, username: true, email: true },
    });
  }

  create(data: { username: string; email: string; password_hash: string }, statuses: readonly string[]) {
    return this.db.user.create({
      data: { ...data, statuses: { create: statuses.map((status_name) => ({ status_name })) } },
    });
  }
}