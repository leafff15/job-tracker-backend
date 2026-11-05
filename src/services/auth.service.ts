import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { EmailService } from "./email.service.js";
import { UserRepository } from "../repositories/user.repository.js";
import { ValidationError } from "../validators/jobApplication.validator.js";
import { defaultStatuses } from "../config/defaults.js";
import { env } from "../config/env.js";
import { UnauthorizedError } from "./errors.js";
import { prisma } from "../config/database.js";
import { RegistrationClosedError } from "./errors.js";

const passwordMinimumLength = 8;

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "")
    throw new ValidationError(`${field} is required`);
  return value.trim();
}

function validateEmail(value: unknown): string {
  const email = requiredString(value, "email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new ValidationError("email must be valid");
  return email;
}

function validatePassword(value: unknown): string {
  if (typeof value !== "string" || value.length < passwordMinimumLength) {
    throw new ValidationError("password must be at least 8 characters");
  }
  return value;
}

function getManilaWindowStart(date: Date): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return new Date(
    Date.UTC(
      Number(values.year),
      Number(values.month) - 1,
      Number(values.day),
    ) -
      8 * 60 * 60 * 1000,
  );
}

export class AuthService {
  constructor(
    private readonly users = new UserRepository(),
    private readonly emailService = new EmailService(),
  ) {}

  async register(input: unknown) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      throw new ValidationError("Request body must be a JSON object");
    }

    const data = input as Record<string, unknown>;

    const username = requiredString(data.username, "username");
    const email = validateEmail(data.email);
    const password = validatePassword(data.password);

    if (await this.users.findByEmail(email)) {
      throw new ValidationError("email is already registered");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const verificationCodeHash = await bcrypt.hash(verificationCode, 12);

    const verificationCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const windowStart = getManilaWindowStart(new Date());

    const user = await prisma.$transaction(async (tx) => {
      await tx.registration_window.upsert({
        where: { window_start: windowStart },
        update: {},
        create: { window_start: windowStart },
      });

      const reservation = await tx.registration_window.updateMany({
        where: {
          window_start: windowStart,
          registrations_count: {
            lt: env.registrationBatchSize,
          },
        },
        data: {
          registrations_count: {
            increment: 1,
          },
        },
      });

      if (reservation.count !== 1) {
        throw new RegistrationClosedError();
      }

      return tx.user.create({
        data: {
          username,
          email,
          password_hash: passwordHash,
          verification_code_hash: verificationCodeHash,
          verification_code_expires_at: verificationCodeExpiresAt,
          verification_code_last_sent_at: new Date(),
          statuses: {
            create: defaultStatuses.map((status_name) => ({
              status_name,
            })),
          },
        },
        select: {
          user_id: true,
          username: true,
          email: true,
          email_verified: true,
        },
      });
    });

    await this.emailService.sendVerificationEmail(email, verificationCode);

    return { user };
  }

  async verifyEmail(input: unknown) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      throw new ValidationError("Request body must be a JSON object");
    }

    const data = input as Record<string, unknown>;
    const email = validateEmail(data.email);

    if (typeof data.code !== "string" || !/^\d{6}$/.test(data.code)) {
      throw new ValidationError("code must be a six-digit verification code");
    }

    const user = await this.users.findByEmail(email);

    if (!user) {
      throw new ValidationError("Invalid or expired verification code");
    }

    if (user.email_verified) {
      throw new ValidationError("Email is already verified");
    }

    if (
      !user.verification_code_hash ||
      !user.verification_code_expires_at ||
      user.verification_code_expires_at.getTime() <= Date.now()
    ) {
      throw new ValidationError("Verification code has expired");
    }

    const isCodeValid = await bcrypt.compare(
      data.code,
      user.verification_code_hash,
    );

    if (!isCodeValid) {
      throw new ValidationError("Invalid verification code");
    }

    await this.users.markEmailVerified(user.user_id);

    return {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      email_verified: true,
    };
  }

  async getEmailRegistrationStatus(input: unknown) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      throw new ValidationError("Request body must be a JSON object");
    }

    const data = input as Record<string, unknown>;
    const email = validateEmail(data.email);

    const user = await this.users.findByEmail(email);

    if (!user) {
      return { registered: false };
    }

    return {
      registered: true,
      emailVerified: user.email_verified,
    };
  }

  findById(userId: number) {
    return this.users.findById(userId);
  }

  async resendVerificationCode(input: unknown) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      throw new ValidationError("Request body must be a JSON object");
    }

    const data = input as Record<string, unknown>;
    const email = validateEmail(data.email);

    const genericResponse = {
      message:
        "If an unverified account exists for this email, a verification code will be sent.",
    };

    const user = await this.users.findByEmail(email);

    if (!user || user.email_verified) {
      return genericResponse;
    }

    const now = new Date();
    const cooldownMs = 60 * 1000;
    const cutoff = new Date(now.getTime() - cooldownMs);

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const verificationCodeHash = await bcrypt.hash(verificationCode, 12);
    const verificationCodeExpiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    const updated = await prisma.user.updateMany({
      where: {
        user_id: user.user_id,
        email_verified: false,
        OR: [
          { verification_code_last_sent_at: null },
          { verification_code_last_sent_at: { lte: cutoff } },
        ],
      },
      data: {
        verification_code_hash: verificationCodeHash,
        verification_code_expires_at: verificationCodeExpiresAt,
        verification_code_last_sent_at: now,
      },
    });

    if (updated.count === 0) {
      return genericResponse;
    }

    try {
      await this.emailService.sendVerificationEmail(email, verificationCode);
    } catch (error) {
      await prisma.user.updateMany({
        where: {
          user_id: user.user_id,
          email_verified: false,
          verification_code_hash: verificationCodeHash,
        },
        data: {
          verification_code_hash: user.verification_code_hash,
          verification_code_expires_at: user.verification_code_expires_at,
          verification_code_last_sent_at: user.verification_code_last_sent_at,
        },
      });

      throw error;
    }

    return genericResponse;
  }

  async requestPasswordReset(input: unknown) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      throw new ValidationError("Request body must be a JSON object");
    }

    const data = input as Record<string, unknown>;
    const email = validateEmail(data.email);

    const genericResponse = {
      message:
        "If an account exists for this email, a reset code will be sent.",
    };

    const user = await this.users.findByEmail(email);

    if (!user) {
      return genericResponse;
    }

    const now = new Date();
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeHash = await bcrypt.hash(resetCode, 12);
    const resetCodeExpiresAt = new Date(now.getTime() + 10 * 60 * 1000);

    await this.users.setPasswordResetCode(
      user.user_id,
      resetCodeHash,
      resetCodeExpiresAt,
      now,
    );

    await this.emailService.sendPasswordResetEmail(email, resetCode);

    return genericResponse;
  }

  async verifyPasswordResetCode(input: unknown) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      throw new ValidationError("Request body must be a JSON object");
    }

    const data = input as Record<string, unknown>;
    const email = validateEmail(data.email);

    if (typeof data.code !== "string" || !/^\d{6}$/.test(data.code)) {
      throw new ValidationError("code must be a six-digit verification code");
    }

    const user = await this.users.findByEmail(email);

    if (
      !user ||
      !user.password_reset_code_hash ||
      !user.password_reset_code_expires_at ||
      user.password_reset_code_expires_at.getTime() <= Date.now()
    ) {
      throw new ValidationError("Invalid or expired password reset code");
    }

    const isCodeValid = await bcrypt.compare(
      data.code,
      user.password_reset_code_hash,
    );

    if (!isCodeValid) {
      throw new ValidationError("Invalid or expired password reset code");
    }

    // This confirms the code is valid. The next endpoint will reset the password.
    return { valid: true };
  }

  async resetPassword(input: unknown) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      throw new ValidationError("Request body must be a JSON object");
    }

    const data = input as Record<string, unknown>;
    const email = validateEmail(data.email);

    const password = validatePassword(data.password);

    if (typeof data.code !== "string" || !/^\d{6}$/.test(data.code)) {
      throw new ValidationError("code must be a six-digit verification code");
    }

    const user = await this.users.findByEmail(email);

    if (
      !user ||
      !user.password_reset_code_hash ||
      !user.password_reset_code_expires_at ||
      user.password_reset_code_expires_at.getTime() <= Date.now()
    ) {
      throw new ValidationError("Invalid or expired password reset code");
    }

    const isCodeValid = await bcrypt.compare(
      data.code,
      user.password_reset_code_hash,
    );

    if (!isCodeValid) {
      throw new ValidationError("Invalid or expired password reset code");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await this.users.updatePasswordAndClearResetCode(
      user.user_id,
      passwordHash,
    );

    return { message: "Password reset successfully" };
  }
  

  async login(input: unknown) {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      throw new ValidationError("Request body must be a JSON object");
    }

    const data = input as Record<string, unknown>;
    const email = validateEmail(data.email);

    if (typeof data.password !== "string" || data.password.length === 0) {
      throw new ValidationError("password is required");
    }

    const user = await this.users.findByEmail(email);

    if (!user || !(await bcrypt.compare(data.password, user.password_hash))) {
      throw new UnauthorizedError(
        "Invalid email or password",
        "INVALID_CREDENTIALS",
      );
    }

    if (!user.email_verified) {
      throw new UnauthorizedError(
        "Please verify your email before signing in.",
        "EMAIL_NOT_VERIFIED",
      );
    }

    return {
      user,
      token: this.createToken(user.user_id),
    };
  }

  private createToken(userId: number) {
    return jwt.sign({ user_id: userId }, env.jwtSecret, { expiresIn: "7d" });
  }
}
