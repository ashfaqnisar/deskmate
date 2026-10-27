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

export const INTENT_DESCRIPTIONS: Record<(typeof INTENTS)[number], string> = {
  policy_question:
    "Asks for information or a how-to that company documents could answer (leave rules, working from home, holidays, payroll, how to set up VPN, how to reset a password)",
  leave_request: "Wants to apply for, change, or cancel their own leave or time off",
  it_ticket:
    "Reports something broken or asks IT to do something (laptop, account locked out, access, software install, equipment)",
  chitchat: "Greetings, thanks, or small talk with no HR or IT request",
  off_topic: "Anything unrelated to HR or IT at work (coding help, trivia, jokes, personal advice)",
};
