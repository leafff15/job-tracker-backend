import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository.js";
import { ValidationError } from "../validators/jobApplication.validator.js";

const passwordMinimumLength = 8;

function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || value.trim() === "") throw new ValidationError(`${field} is required`);
  return value.trim();
}

function validateEmail(value: unknown): string {
  const email = requiredString(value, "email").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ValidationError("email must be valid");
  return email;
}

function validatePassword(value: unknown): string {
  if (typeof value !== "string" || value.length < passwordMinimumLength) {
    throw new ValidationError("password must be at least 8 characters");
  }
  return value;
}

export class AuthService {
  constructor(private readonly users = new UserRepository()) {}

  async register(input: unknown) {
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new ValidationError("Request body must be a JSON object");
    const data = input as Record<string, unknown>;
    const username = requiredString(data.username, "username");
    const email = validateEmail(data.email);
    const password = validatePassword(data.password);
    if (await this.users.findByEmail(email)) throw new ValidationError("email is already registered");
    const user = await this.users.create({ username, email, password_hash: await bcrypt.hash(password, 12) });
    return { user, token: this.createToken(user.user_id) };
  }

  async login(input: unknown) {
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new ValidationError("Request body must be a JSON object");
    const data = input as Record<string, unknown>;
    const email = validateEmail(data.email);
    if (typeof data.password !== "string" || data.password.length === 0) throw new ValidationError("password is required");
    const user = await this.users.findByEmail(email);
    if (!user || !(await bcrypt.compare(data.password, user.password_hash))) throw new ValidationError("Invalid email or password");
    return { user, token: this.createToken(user.user_id) };
  }

  private createToken(userId: number) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET is not configured");
    return jwt.sign({ user_id: userId }, secret, { expiresIn: "7d" });
  }
}
