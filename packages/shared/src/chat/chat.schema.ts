import { z } from "zod";

import { UsageSchema } from "../common";

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatBody = z.object({
  message: z.string().trim().min(1).max(4000),
  history: z.array(ChatMessageSchema).max(20).default([]),
});
export type ChatBody = z.infer<typeof ChatBody>;

export const ChatResponse = z.object({
  reply: z.string(),
  model: z.string(),
  usage: UsageSchema,
  latencyMs: z.number(),
});
export type ChatResponse = z.infer<typeof ChatResponse>;
