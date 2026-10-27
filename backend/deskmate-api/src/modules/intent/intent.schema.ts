import { z } from "zod";

export const INTENTS = [
  "policy_question",
  "leave_request",
  "it_ticket",
  "chitchat",
  "off_topic",
] as const;

export const IntentResult = z.object({
  intent: z.enum(INTENTS),
  confidence: z.number().min(0).max(1),
});
export type IntentResult = z.infer<typeof IntentResult>;
