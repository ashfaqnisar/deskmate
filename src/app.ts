import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import fastify from "fastify";
import { randomUUIDv7 } from "bun";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { env } from "~/config/env";
import { sql } from "~/db";
import { docs } from "~/lib/docs";
import { errorHandler, notFoundHandler } from "~/lib/errors";
import { logger, requestContext, serializeRawReq } from "~/lib/logger";
import routes from "~/routes";

export function buildApp() {
  const app = fastify({
    loggerInstance: logger,
    genReqId: (req) => (req.headers["x-request-id"] as string) ?? randomUUIDv7(),
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.setErrorHandler(errorHandler);
  app.setNotFoundHandler(notFoundHandler);

  app.addHook("onRequest", (req, _reply, done) => {
    requestContext.run({ reqId: req.id, req: serializeRawReq(req.raw) }, done);
  });

  app.addHook("onReady", async () => {
    await sql`SELECT 1`;
    logger.info("Connected to Postgres");
  });
  app.addHook("onClose", async () => {
    await sql.close();
  });

  app.register(helmet);
  app.register(cors, { origin: env.CORS_ORIGIN, credentials: true });
  app.register(rateLimit, { max: env.RATE_LIMIT_MAX, timeWindow: "1 minute" });

  app.register(docs);

  app.register(routes, { prefix: "/api/v1" });

  return app;
}
