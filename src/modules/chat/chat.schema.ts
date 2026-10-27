import { z } from "zod";

import type { Readable } from "node:stream";

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});

export const ChatBody = z.object({
  message: z.string().trim().min(1).max(4000),
  history: z.array(ChatMessageSchema).max(20).default([]),
});
export type ChatBody = z.infer<typeof ChatBody>;

export const UsageSchema = z.object({
  promptTokens: z.number(),
  completionTokens: z.number(),
  totalTokens: z.number(),
});

export const ChatResponse = z.object({
  reply: z.string(),
  model: z.string(),
  usage: UsageSchema,
  latencyMs: z.number(),
});
export type ChatResponse = z.infer<typeof ChatResponse>;

const streamExample =
  'data: {"type":"delta","text":"Hello"}\n\n' +
  'data: {"type":"delta","text":" there!"}\n\n' +
  'data: {"type":"done","model":"deepseek-chat","usage":{"promptTokens":12,"completionTokens":4,"totalTokens":16},"latencyMs":812}\n\n';

// Documents the raw event text in OpenAPI; at runtime the route sends a Readable stream of it.
export const StreamResponse = z.string().meta({
  description:
    "Server-sent events. Each message is a `data:` line with a JSON event: `delta` events carry the next text, and a final `done` event carries the model, token usage and latency. If the provider fails mid-stream, an `event: error` message is sent.",
  examples: [streamExample],
}) as unknown as z.ZodType<Readable>;
