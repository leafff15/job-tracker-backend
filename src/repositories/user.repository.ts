import { prisma } from "../config/database.js";
import type { PrismaClient } from "../generated/prisma/client.js";

export class UserRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  findByEmail(email: string) {
    return this.db.user.findUnique({ where: { email } });
  }

  create(data: { username: string; email: string; password_hash: string }) {
    return this.db.user.create({ data });
  }
}
