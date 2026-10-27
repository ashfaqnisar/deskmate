import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
} from "fastify-type-provider-zod";

import { logger } from "~/lib/logger";

import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";

export class HttpError extends Error {
  constructor(
    readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

export function errorHandler(err: unknown, _req: FastifyRequest, reply: FastifyReply) {
  if (hasZodFastifySchemaValidationErrors(err)) {
    return reply.code(400).send({
      error: "Bad Request",
      message: "Request doesn't match the schema",
      issues: err.validation,
    });
  }
  if (isResponseSerializationError(err)) {
    logger.error({ err }, "Response doesn't match the schema");
    return reply.code(500).send({ error: "Internal Server Error" });
  }
  if (err instanceof HttpError) {
    return reply.code(err.statusCode).send({ error: err.message });
  }
  const { statusCode = 500, message } = err as FastifyError;
  if (statusCode >= 500) {
    logger.error({ err }, "Unhandled error");
    return reply.code(500).send({ error: "Internal Server Error" });
  }
  return reply.code(statusCode).send({ error: message });
}

export function notFoundHandler(req: FastifyRequest, reply: FastifyReply) {
  return reply
    .code(404)
    .send({ error: "Not Found", message: `${req.method} ${req.url} not found` });
}
