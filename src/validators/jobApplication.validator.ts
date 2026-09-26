import type { NextFunction, Request, Response } from "express";

export class ValidationError extends Error {}

const requiredStrings = ["company_name", "position", "location"] as const;
const requiredNumbers = ["status_id", "work_setup_id"] as const;
const allowedFields = new Set([
  ...requiredStrings, ...requiredNumbers, "user_id", "date_applied", "salary", "notes",
]);

type JobApplicationBody = Record<string, unknown>;

function validateBody(input: unknown, creating: boolean): JobApplicationBody {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ValidationError("Request body must be a JSON object");
  }

  const body = input as JobApplicationBody;
  for (const key of Object.keys(body)) {
    if (!allowedFields.has(key)) throw new ValidationError(`Unknown field: ${key}`);
  }
  delete body.user_id;
  if (creating) {
    for (const key of [...requiredStrings, ...requiredNumbers, "date_applied"]) {
      if (body[key] === undefined || body[key] === null || body[key] === "") {
        throw new ValidationError(`${key} is required`);
      }
    }
  } else if (Object.keys(body).length === 0) {
    throw new ValidationError("At least one field is required");
  }
  for (const key of requiredStrings) {
    if (body[key] !== undefined && (typeof body[key] !== "string" || body[key].trim() === "")) {
      throw new ValidationError(`${key} must be a non-empty string`);
    }
  }
  for (const key of requiredNumbers) {
    if (body[key] !== undefined && (!Number.isInteger(body[key]) || Number(body[key]) <= 0)) {
      throw new ValidationError(`${key} must be a positive integer`);
    }
  }
  if (body.salary !== undefined && body.salary !== null && (!Number.isInteger(body.salary) || Number(body.salary) < 0)) {
    throw new ValidationError("salary must be a non-negative integer or null");
  }
  if (body.notes !== undefined && body.notes !== null && typeof body.notes !== "string") {
    throw new ValidationError("notes must be a string or null");
  }
  if (body.date_applied !== undefined) {
    if (typeof body.date_applied !== "string" || Number.isNaN(Date.parse(body.date_applied))) {
      throw new ValidationError("date_applied must be a valid date string");
    }
    body.date_applied = new Date(body.date_applied);
  }
  return body;
}

function validateBodyMiddleware(creating: boolean) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      req.body = validateBody(req.body, creating);
      next();
    } catch (error) {
      next(error);
    }
  };
}

export const validateCreateJobApplication = validateBodyMiddleware(true);
export const validateUpdateJobApplication = validateBodyMiddleware(false);

export function validateApplicationId(req: Request, res: Response, next: NextFunction) {
  const id = Number(req.params.applicationId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return next(new ValidationError("applicationId must be a positive integer"));
  }
  res.locals.applicationId = id;
  next();
}
