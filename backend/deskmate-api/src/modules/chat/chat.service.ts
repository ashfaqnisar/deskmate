import OpenAI from "openai";

import { HttpError } from "~/lib/errors";
import { logger } from "~/lib/logger";
import * as llm from "~/llm/provider";
import { intentService } from "~/modules/intent/intent.service";
import { READABLE_LEVELS } from "~/rag/config";
import { buildContext, NO_CONTEXT } from "~/rag/retrieval/context";
import { systemPrompt } from "~/prompts";

import type { ChatBody, StreamEvent } from "@deskmate/shared";

const REFUSE_CONFIDENCE = 0.7;
const OFF_TOPIC_REPLY =
  "I can only help with HR and IT questions at Acme, like leave, working from home, payroll, laptops, accounts, or VPN. What can I help you with?";

const toMessages = (body: ChatBody, context: string): llm.ChatMessage[] => [
  {
    role: "system",
    content: systemPrompt.render({ today: new Date().toISOString().slice(0, 10), context }),
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
    return { refuse: intent === "off_topic" && confidence >= REFUSE_CONFIDENCE, intent, tokens };
  } catch (err) {
    logger.warn({ err }, "Intent check failed, continuing without it");
    return { refuse: false, intent: undefined, tokens: 0 };
  }
}

// Small talk needs no documents; everything else gets the most relevant company docs.
const getContext = (message: string, intent?: string) =>
  intent === "chitchat" ? NO_CONTEXT : buildContext(message, READABLE_LEVELS);

const refusalResult = (startedAt: number, tokens: number) => ({
  reply: OFF_TOPIC_REPLY,
  model: "guardrail",
  usage: { promptTokens: 0, completionTokens: 0, totalTokens: tokens },
  latencyMs: Math.round(performance.now() - startedAt),
  sources: [],
});

export const chatService = {
  async reply(body: ChatBody, signal?: AbortSignal) {
    const startedAt = performance.now();
    const { refuse, intent, tokens } = await checkIntent(body.message, signal);
    if (refuse) return refusalResult(startedAt, tokens);

    try {
      const context = await getContext(body.message, intent);
      const result = await llm.chat(toMessages(body, context.text), signal);
      return { ...result, sources: context.sources };
    } catch (err) {
      throw toHttpError(err);
    }
  },

  async *stream(body: ChatBody, signal?: AbortSignal): AsyncGenerator<StreamEvent> {
    const startedAt = performance.now();
    const { refuse, intent, tokens } = await checkIntent(body.message, signal);
    if (refuse) {
      logger.warn({ intent: "off_topic" }, "Refusing off-topic request");
      const { reply, ...done } = refusalResult(startedAt, tokens);
      yield { type: "delta", text: reply };
      yield { type: "done", ...done };
      return;
    }

    try {
      const context = await getContext(body.message, intent);
      for await (const part of llm.stream(toMessages(body, context.text), signal)) {
        yield part.type === "done" ? { ...part, sources: context.sources } : part;
      }
    } catch (err) {
      throw toHttpError(err);
    }
  },
};
