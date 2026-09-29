type LogLevel = "INFO" | "WARN" | "ERROR";

type LogContext = Record<string, unknown>;

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return error;
}

function log(
  level: LogLevel,
  message: string,
  context?: LogContext,
) {
  const sanitizedContext = context
    ? Object.fromEntries(
        Object.entries(context).map(([key, value]) => [
          key,
          key === "error" ? serializeError(value) : value,
        ]),
      )
    : undefined;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...sanitizedContext,
  };

  console.log(JSON.stringify(entry));
}

export const logger = {
  info(message: string, context?: LogContext) {
    log("INFO", message, context);
  },

  warn(message: string, context?: LogContext) {
    log("WARN", message, context);
  },

  error(message: string, context?: LogContext) {
    log("ERROR", message, context);
  },
};