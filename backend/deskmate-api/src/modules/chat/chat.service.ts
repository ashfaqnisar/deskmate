import OpenAI from "openai";

import { HttpError } from "~/lib/errors";
import { logger } from "~/lib/logger";
import * as llm from "~/llm/provider";
import { intentService } from "~/modules/intent/intent.service";
import { systemPrompt } from "~/prompts";

import type { ChatBody, StreamEvent } from "@deskmate/shared";

const REFUSE_CONFIDENCE = 0.7;
const OFF_TOPIC_REPLY =
  "I can only help with HR and IT questions at Acme, like leave, working from home, payroll, laptops, accounts, or VPN. What can I help you with?";

const toMessages = (body: ChatBody): llm.ChatMessage[] => [
  {
    role: "system",
    content: systemPrompt.render({ today: new Date().toISOString().slice(0, 10) }),
  },
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

// Classifies the message and says whether to refuse it without calling the main model.
// If the classifier fails, we let the request through; the system prompt still enforces scope.
async function checkIntent(message: string, signal?: AbortSignal) {
  try {
    const { intent, confidence, tokens } = await intentService.classify(message, signal);
    logger.info({ intent, confidence, promptVersion: systemPrompt.version }, "Chat request");
    return { refuse: intent === "off_topic" && confidence >= REFUSE_CONFIDENCE, tokens };
  } catch (err) {
    logger.warn({ err }, "Intent check failed, continuing without it");
    return { refuse: false, tokens: 0 };
  }
}

const refusalResult = (startedAt: number, tokens: number) => ({
  reply: OFF_TOPIC_REPLY,
  model: "guardrail",
  usage: { promptTokens: 0, completionTokens: 0, totalTokens: tokens },
  latencyMs: Math.round(performance.now() - startedAt),
});

export const chatService = {
  async reply(body: ChatBody, signal?: AbortSignal) {
    const startedAt = performance.now();
    const { refuse, tokens } = await checkIntent(body.message, signal);
    if (refuse) return refusalResult(startedAt, tokens);

    try {
      return await llm.chat(toMessages(body), signal);
    } catch (err) {
      throw toHttpError(err);
    }
  },

  async *stream(body: ChatBody, signal?: AbortSignal): AsyncGenerator<StreamEvent> {
    const startedAt = performance.now();
    const { refuse, tokens } = await checkIntent(body.message, signal);
    if (refuse) {
      logger.warn({ intent: "off_topic" }, "Refusing off-topic request");
      const { reply, ...done } = refusalResult(startedAt, tokens);
      yield { type: "delta", text: reply };
      yield { type: "done", ...done };
      return;
    }

    try {
      yield* llm.stream(toMessages(body), signal);
    } catch (err) {
      throw toHttpError(err);
    }
  },
};
