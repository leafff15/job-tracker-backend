import "dotenv/config";
import app from "./app.js";

const port = Number(process.env.PORT) || 3000;
const server = app.listen(port, () => console.log(`Server listening on port ${port}`));

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