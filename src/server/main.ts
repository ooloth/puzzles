// Wiring only: parse configuration, build the server, listen, and shut down on a signal.
import { buildServer, startServer } from "./app.ts";
import { parseServerConfig } from "./config.ts";
import { closeGracefully, defaultShutdownTiming, exitCodeFor } from "./shutdown.ts";

const app = buildServer();

const parsed = parseServerConfig(process.env);
if (!parsed.ok) {
  app.log.fatal({ problems: parsed.problems }, "invalid server configuration");
  process.exit(1);
}

try {
  await startServer(app, parsed.config);
} catch (error) {
  app.log.fatal({ err: error }, "server failed to start");
  process.exit(1);
}

let shuttingDown = false;
for (const signal of ["SIGTERM", "SIGINT"] as const) {
  process.on(signal, () => {
    if (shuttingDown) return;
    shuttingDown = true;
    app.log.info({ signal }, "shutting down");
    void closeGracefully(app, defaultShutdownTiming).then((outcome) => {
      if (outcome.kind === "drained") app.log.info("shut down");
      else app.log.error({ outcome }, "shutdown did not drain");
      // Exit explicitly: after a ceiling, the connections still open would keep the process alive.
      process.exit(exitCodeFor(outcome));
    });
  });
}
