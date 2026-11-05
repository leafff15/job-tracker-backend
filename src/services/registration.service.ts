
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";

const REGISTRATION_TIME_ZONE = "Asia/Manila";

function getManilaWindowStart(date: Date): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: REGISTRATION_TIME_ZONE,
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
    ) - 8 * 60 * 60 * 1000,
  );
}

export class RegistrationService {
  async getStatus() {
    const windowStart = getManilaWindowStart(new Date());
    const nextResetAt = new Date(
      windowStart.getTime() + 24 * 60 * 60 * 1000,
    );

    const window = await prisma.registration_window.findUnique({
      where: { window_start: windowStart },
      select: { registrations_count: true },
    });

    const registrationsToday = window?.registrations_count ?? 0;
    const remaining = Math.max(
      env.registrationBatchSize - registrationsToday,
      0,
    );

    return {
      open: remaining > 0,
      registrationsToday,
      remaining,
      dailyLimit: env.registrationBatchSize,
      nextResetAt: nextResetAt.toISOString(),
    };
  }
}
