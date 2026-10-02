export class NotFoundError extends Error {}

export class UnauthorizedError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "AUTHENTICATION_REQUIRED"
      | "INVALID_AUTHENTICATION_TOKEN"
      | "INVALID_CREDENTIALS",
  ) {
    super(message);
    this.name = "UnauthorizedError";
  }
}