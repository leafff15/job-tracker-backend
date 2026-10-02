import type { NextFunction, Request, Response } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { ValidationError } from "../validators/jobApplication.validator.js";
import { NotFoundError, UnauthorizedError } from "../services/errors.js";
import { errorResponse } from "../utils/api-response.js";
import { logger } from "../utils/logger.js";

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof ValidationError) {
    return res
      .status(400)
      .json(errorResponse("VALIDATION_ERROR", error.message));
  }

  if (error instanceof UnauthorizedError) {
    return res.status(401).json(errorResponse(error.code, error.message));
  }

  if (error instanceof NotFoundError) {
    return res.status(404).json(errorResponse("NOT_FOUND", error.message));
  }

  const parserError = error as {
    type?: string;
    status?: number;
  } | null;


  if (
    parserError?.type === "entity.too.large" ||
    parserError?.status === 413
  ) {
    return res
      .status(413)
      .json(errorResponse("PAYLOAD_TOO_LARGE", "Request body is too large"));
  }

  if (
    parserError?.type === "entity.parse.failed" ||
    (error instanceof SyntaxError && parserError?.status === 400)
  ) {
    return res
      .status(400)
      .json(errorResponse("INVALID_JSON", "Invalid JSON request body"));
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const prismaError = error as Prisma.PrismaClientKnownRequestError;
    if (prismaError.code === "P2025") {
      return res
        .status(404)
        .json(
          errorResponse(
            "RESOURCE_NOT_FOUND",
            "Requested resource was not found",
          ),
        );
    }

    if (prismaError.code === "P2003") {
      return res
        .status(400)
        .json(
          errorResponse(
            "DATABASE_CONSTRAINT_ERROR",
            "Related record is invalid",
          ),
        );
    }

    if (prismaError.code === "P2002") {
      return res
        .status(409)
        .json(
          errorResponse(
            "DUPLICATE_RESOURCE",
            "A record with the same value already exists",
          ),
        );
    }
  }

  logger.error("Unhandled error", {
    error,
  });

  return res
    .status(500)
    .json(errorResponse("INTERNAL_SERVER_ERROR", "Internal server error"));
}
