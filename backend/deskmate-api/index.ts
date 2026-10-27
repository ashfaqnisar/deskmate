import { buildApp } from "~/app";
import { env } from "~/config/env";
import { logger } from "~/lib/logger";

const app = buildApp();

app.listen({ port: env.PORT }, (err) => {
  if (err) {
    logger.error(err);
    process.exit(1);
  }
  if (env.DOCS_ENABLED) logger.info(`API docs available at http://localhost:${env.PORT}/docs`);
});

// Fastify doesn't close on signals by itself; do it so the onClose hooks (DB) run on Ctrl+C / kill.
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, async () => {
    await app.close();
    process.exit(0);
  });
}

for (const event of ["uncaughtException", "unhandledRejection"] as const) {
  process.on(event, (err) => {
    logger.fatal({ err }, event);
    process.exit(1);
  });
}
