import { Readable } from "node:stream";

import { ChatBody, ChatResponse } from "@deskmate/shared";

import { HttpError } from "~/lib/errors";
import { logger } from "~/lib/logger";

import { StreamResponse } from "./chat.schema";
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
        description:
          "Sends a message, plus up to 20 earlier messages for context, and returns the whole reply at once. A confident off-topic request gets a fixed refusal without calling the model. Otherwise the most relevant company documents are retrieved and the model answers only from them, citing files like `[leave-policy.md]`. `sources` lists the documents used. Use the streaming endpoint to show the reply as it is written.",
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
          "Same behavior as the non-streaming endpoint, but the reply arrives as it is written. `delta` events carry the next piece of text, and a final `done` event carries the model, token usage, latency and the `sources` the answer was based on. If the provider fails mid-stream, an `event: error` message is sent instead.",
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
