import { z } from "zod";

import { INTENTS } from "~/modules/intent/intent.schema";

const CheckSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("contains"), value: z.string() }),
  z.object({ type: z.literal("notContains"), value: z.string() }),
  z.object({ type: z.literal("equals"), value: z.string() }),
  z.object({ type: z.literal("regex"), pattern: z.string() }),
  z.object({ type: z.literal("retrieves"), source: z.string(), k: z.number().default(4) }),
  z.object({ type: z.literal("judge"), rubric: z.string(), minScore: z.number().default(4) }),
]);

export const CaseSchema = z.object({
  id: z.string(),
  input: z.string(),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .default([]),
  checks: z.array(CheckSchema).default([]),
  expected: z.enum(INTENTS).optional(),
});

export type Check = z.infer<typeof CheckSchema>;
export type EvalCase = z.infer<typeof CaseSchema>;

export type CheckResult = {
  check: Check;
  passed: boolean;
  detail: string;
  score?: number;
  reason?: string;
};

export type CaseResult = {
  name: string;
  input: string;
  reply: string;
  passed: boolean;
  checks: CheckResult[];
  tokens: number;
  latencyMs: number;
};

export type RunResult = {
  startedAt: string;
  model: string;
  promptVersion: string;
  intentBackend: string;
  passRate: number;
  tokens: number;
  avgLatencyMs: number;
  cases: CaseResult[];
};
