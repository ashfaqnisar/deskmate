import OpenAI from "openai";

import { env } from "~/config/env";
import { logger } from "~/lib/logger";

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type Usage = { promptTokens: number; completionTokens: number; totalTokens: number };

export type StreamEvent =
  | { type: "delta"; text: string }
  | { type: "done"; model: string; usage: Usage; latencyMs: number };

const client = new OpenAI({
  baseURL: env.LLM_BASE_URL,
  apiKey: env.LLM_API_KEY,
  timeout: 30_000,
  maxRetries: 2,
});

const toUsage = (usage?: OpenAI.CompletionUsage | null): Usage => ({
  promptTokens: usage?.prompt_tokens ?? 0,
  completionTokens: usage?.completion_tokens ?? 0,
  totalTokens: usage?.total_tokens ?? 0,
});

const since = (startedAt: number) => Math.round(performance.now() - startedAt);

export async function chat(messages: ChatMessage[], signal?: AbortSignal) {
  const startedAt = performance.now();
  const completion = await client.chat.completions.create(
    { model: env.LLM_MODEL, messages },
    { signal },
  );

  const { model } = completion;
  const usage = toUsage(completion.usage);
  const latencyMs = since(startedAt);
  logger.info({ model, ...usage, latencyMs }, "LLM call");
  return { reply: completion.choices[0]?.message.content ?? "", model, usage, latencyMs };
}

export async function* stream(
  messages: ChatMessage[],
  signal?: AbortSignal,
): AsyncGenerator<StreamEvent> {
  const startedAt = performance.now();
  const completion = await client.chat.completions.create(
    { model: env.LLM_MODEL, messages, stream: true, stream_options: { include_usage: true } },
    { signal },
  );

  let model: string = env.LLM_MODEL;
  let usage = toUsage();
  for await (const chunk of completion) {
    model = chunk.model || model;
    if (chunk.usage) usage = toUsage(chunk.usage);
    const text = chunk.choices[0]?.delta.content;
    if (text) yield { type: "delta", text };
  }

  if (signal?.aborted) return;

  const latencyMs = since(startedAt);
  logger.info({ model, ...usage, latencyMs }, "LLM stream");
  yield { type: "done", model, usage, latencyMs };
}
