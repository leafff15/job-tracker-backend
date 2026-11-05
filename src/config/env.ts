
import "dotenv/config";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  throw new Error("JWT_SECRET is not configured");
}

if (jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters long");
}

const registrationBatchSize = Number(
  process.env.REGISTRATION_BATCH_SIZE ?? 50,
);

if (!Number.isInteger(registrationBatchSize) || registrationBatchSize <= 0) {
  throw new Error("REGISTRATION_BATCH_SIZE must be a positive integer");
}

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
  throw new Error("RESEND_API_KEY is not configured");
}

const emailFrom =
  process.env.EMAIL_FROM ?? "Job Tracker <onboarding@resend.dev>";

export const env = {
  jwtSecret,
  registrationBatchSize,
  resendApiKey,
  emailFrom,
};
