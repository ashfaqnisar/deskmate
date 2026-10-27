import { Readable } from "node:stream";

import { HttpError } from "~/lib/errors";
import { logger } from "~/lib/logger";

import { ChatBody, ChatResponse, StreamResponse } from "./chat.schema";
import { chatService } from "./chat.service";

import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";

const chatRateLimit = { rateLimit: { max: 20, timeWindow: "1 minute" } };

const sse = (data: unknown, event?: string) =>
  `${event ? `event: ${event}\n` : ""}data: ${JSON.stringify(data)}\n\n`;

const chatRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/",
    {
      config: chatRateLimit,
      schema: {
        tags: ["Chat"],
        summary: "Send a message and get the full reply",
        body: ChatBody,
        response: { 200: ChatResponse },
      },
    },
    async (req) => chatService.reply(req.body),
  );

  app.post(
    "/stream",
    {
      config: chatRateLimit,
      schema: {
        tags: ["Chat"],
        summary: "Send a message and stream the reply (server-sent events)",
        description:
          "Streams the reply as it is written. `delta` events carry the next piece of text, and a final `done` event carries the model, token usage and latency. If the provider fails mid-stream, an `event: error` message is sent instead.",
        body: ChatBody,
        produces: ["text/event-stream"],
        response: { 200: StreamResponse },
      },
    },
    async (req, reply) => {
      const controller = new AbortController();
      reply.raw.on("close", () => {
        if (!reply.raw.writableFinished) controller.abort();
      });

      async function* events() {
        try {
          for await (const event of chatService.stream(req.body, controller.signal)) {
            yield sse(event);
          }
        } catch (err) {
          if (controller.signal.aborted) return;
          logger.error({ err }, "Stream failed");
          yield sse(
            { error: err instanceof HttpError ? err.message : "Internal Server Error" },
            "error",
          );
        }
      }

      return reply
        .type("text/event-stream")
        .header("cache-control", "no-cache")
        .send(Readable.from(events()));
    },
  );
};

export default chatRoutes;
