import "dotenv/config";

import express from "express";

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

function shutdown(signal: NodeJS.Signals) {
  console.log(`${signal} received; closing server`);
  server.close((error) => {
    if (error) {
      console.error("Error while closing server:", error);
      process.exitCode = 1;
    }
  });
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);