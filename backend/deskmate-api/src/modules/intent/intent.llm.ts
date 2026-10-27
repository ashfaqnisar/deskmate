import { z } from "zod";

import { env } from "~/config/env";
import { logger } from "~/lib/logger";
import * as llm from "~/llm/provider";
import { intentPrompt } from "~/prompts";

import { IntentResult } from "./intent.schema";

function parseIntent(reply: string) {
  try {
    return IntentResult.safeParse(JSON.parse(reply));
  } catch {
    return IntentResult.safeParse(undefined);
  }
}

const classify = async (messages: llm.ChatMessage[], signal?: AbortSignal) => {
  const { reply, usage } = await llm.chat(messages, signal, {
    model: env.INTENT_MODEL,
    temperature: 0,
    json: true,
  });
  return { reply, tokens: usage.totalTokens, result: parseIntent(reply) };
};

export async function classifyWithLlm(message: string, signal?: AbortSignal) {
  const messages: llm.ChatMessage[] = [
    { role: "system", content: intentPrompt.render() },
    { role: "user", content: `<message>\n${message}\n</message>` },
  ];

  const first = await classify(messages, signal);
  if (first.result.success) {
    return { ...first.result.data, tokens: first.tokens };
  }

  logger.warn({ reply: first.reply }, "Intent output invalid, retrying");
  const retry = await classify(
    [
      ...messages,
      { role: "assistant", content: first.reply },
      {
        role: "user",
        content: `That was not valid. ${z.prettifyError(first.result.error)}\nReply with the JSON only.`,
      },
    ],
    signal,
  );
  if (!retry.result.success) throw new Error("Intent classifier returned invalid JSON twice");
  return { ...retry.result.data, tokens: first.tokens + retry.tokens };
}
