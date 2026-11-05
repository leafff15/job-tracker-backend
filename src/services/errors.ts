export class NotFoundError extends Error {}

export class UnauthorizedError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "AUTHENTICATION_REQUIRED"
      | "INVALID_AUTHENTICATION_TOKEN"
      | "INVALID_CREDENTIALS"
      | "EMAIL_NOT_VERIFIED",
  ) {
    super(message);
    this.name = "UnauthorizedError";
  }
}


export class RegistrationClosedError extends Error {
  constructor(
    message = "Registration is currently closed. Please try again after the next reset.",
  ) {
    super(message);
    this.name = "RegistrationClosedError";
  }
}