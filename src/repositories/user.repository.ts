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

  create(
    data: { username: string; email: string; password_hash: string },
    statuses: readonly string[],
  ) {
    return this.db.user.create({
      data: {
        ...data,
        statuses: { create: statuses.map((status_name) => ({ status_name })) },
      },
    });
  }

  async setVerificationCode(
    userId: number,
    verificationCodeHash: string,
    verificationCodeExpiresAt: Date,
  ) {
    return this.db.user.update({
      where: {
        user_id: userId,
      },
      data: {
        verification_code_hash: verificationCodeHash,
        verification_code_expires_at: verificationCodeExpiresAt,
      },
    });
  }

  async markEmailVerified(userId: number) {
    return this.db.user.update({
      where: {
        user_id: userId,
      },
      data: {
        email_verified: true,
        verification_code_hash: null,
        verification_code_expires_at: null,
      },
    });
  }

  async updateVerificationCode(
    userId: number,
    verificationCodeHash: string,
    verificationCodeExpiresAt: Date,
  ) {
    return this.db.user.update({
      where: { user_id: userId },
      data: {
        verification_code_hash: verificationCodeHash,
        verification_code_expires_at: verificationCodeExpiresAt,
      },
    });
  }

  async setPasswordResetCode(
    userId: number,
    codeHash: string,
    expiresAt: Date,
    lastSentAt: Date,
  ) {
    return this.db.user.update({
      where: { user_id: userId },
      data: {
        password_reset_code_hash: codeHash,
        password_reset_code_expires_at: expiresAt,
        password_reset_code_last_sent_at: lastSentAt,
      },
    });
  }

  async clearPasswordResetCode(userId: number) {
    return this.db.user.update({
      where: { user_id: userId },
      data: {
        password_reset_code_hash: null,
        password_reset_code_expires_at: null,
        password_reset_code_last_sent_at: null,
      },
    });
  }

  async updatePasswordAndClearResetCode(userId: number, passwordHash: string) {
    return this.db.user.update({
      where: { user_id: userId },
      data: {
        password_hash: passwordHash,
        password_reset_code_hash: null,
        password_reset_code_expires_at: null,
        password_reset_code_last_sent_at: null,
      },
    });
  }
}
