import "dotenv/config";
import app from "./app.js";
import { logger } from "./utils/logger.js";
import { prisma } from "./config/database.js";

const port = Number(process.env.PORT) || 3000;

const server = app.listen(port, "0.0.0.0", () => {
  logger.info("Server started", {
    port,
  });
});

async function shutdown(signal: NodeJS.Signals) {
  logger.info("Shutdown signal received", {
    signal,
  });

  server.close(async (error) => {
    if (error) {
      logger.error("Error while closing server", {
        error,
      });

      process.exitCode = 1;
    }

    try {
      await prisma.$disconnect();

      logger.info("Database connection closed");
    } catch (error) {
      logger.error("Error while disconnecting database", {
        error,
      });

      process.exitCode = 1;
    }
  });
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);