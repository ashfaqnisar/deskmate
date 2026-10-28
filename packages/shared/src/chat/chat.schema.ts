import { z } from "zod";

import { UsageSchema } from "../common";
import { SourceSchema } from "../documents";

export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(8000),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

export const ChatBody = z
  .object({
    message: z
      .string()
      .trim()
      .min(1)
      .max(4000)
      .meta({ description: "The employee's new message." }),
    history: z.array(ChatMessageSchema).max(20).default([]).meta({
      description: "Earlier messages in this chat, oldest first. Send the last 20 at most.",
    }),
  })
  .meta({
    examples: [
      { message: "How many sick days do I get?", history: [] },
      {
        message: "And how many can I carry forward?",
        history: [
          { role: "user", content: "How many days of annual leave do I get?" },
          { role: "assistant", content: "You get **18 days** per year [leave-policy.md]." },
        ],
      },
    ],
  });
export type ChatBody = z.infer<typeof ChatBody>;

export const ChatResponse = z
  .object({
    reply: z
      .string()
      .meta({ description: "The answer in markdown, with citations like [leave-policy.md]." }),
    model: z
      .string()
      .meta({ description: 'The model that answered, or "guardrail" for a fixed refusal.' }),
    usage: UsageSchema,
    latencyMs: z.number(),
    sources: z.array(SourceSchema).meta({
      description: "The company documents the answer was based on. Empty if none were used.",
    }),
  })
  .meta({
    examples: [
      {
        reply: "You get **8 days** of paid sick leave per year [leave-policy.md].",
        model: "deepseek-flash",
        usage: { promptTokens: 512, completionTokens: 21, totalTokens: 533 },
        latencyMs: 1180,
        sources: [{ source: "leave-policy.md", title: "Leave Policy", section: "Sick Leave" }],
      },
    ],
  });
export type ChatResponse = z.infer<typeof ChatResponse>;
