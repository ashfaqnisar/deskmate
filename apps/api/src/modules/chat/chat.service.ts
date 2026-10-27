import OpenAI from "openai";

import { HttpError } from "~/lib/errors";
import { logger } from "~/lib/logger";
import * as llm from "~/llm/provider";

import type { ChatBody } from "@deskmate/shared";

const toMessages = (body: ChatBody): llm.ChatMessage[] => [
  ...body.history,
  { role: "user", content: body.message },
];

function toHttpError(err: unknown) {
  if (!(err instanceof OpenAI.APIError)) return err;
  logger.error({ err, status: err.status }, "LLM provider error");
  if (err instanceof OpenAI.APIConnectionTimeoutError) {
    return new HttpError(504, "The AI provider timed out");
  }
  return new HttpError(502, "The AI provider failed");
}

export const chatService = {
  async reply(body: ChatBody, signal?: AbortSignal) {
    try {
      return await llm.chat(toMessages(body), signal);
    } catch (err) {
      throw toHttpError(err);
    }
  },

  async *stream(body: ChatBody, signal?: AbortSignal) {
    try {
      yield* llm.stream(toMessages(body), signal);
    } catch (err) {
      throw toHttpError(err);
    }
  },
};
