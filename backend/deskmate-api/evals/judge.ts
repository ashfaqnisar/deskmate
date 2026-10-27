import { z } from "zod";

import * as llm from "~/llm/provider";

const JudgeSchema = z.object({ score: z.number().int().min(1).max(5), reason: z.string() });

const JUDGE_SYSTEM = `You are a strict grader of answers from a company HR/IT helpdesk assistant.
Score the answer from 1 (fails the rubric) to 5 (fully meets the rubric), judging only against the rubric.
Do not reward length or politeness. Reply with JSON only: {"score": <1-5>, "reason": "<one sentence>"}`;

export async function judge(question: string, answer: string, rubric: string) {
  const { reply, usage } = await llm.chat(
    [
      { role: "system", content: JUDGE_SYSTEM },
      {
        role: "user",
        content: `Question:\n${question}\n\nAnswer:\n${answer}\n\nRubric:\n${rubric}`,
      },
    ],
    undefined,
    { temperature: 0 },
  );

  const json = reply.match(/\{[\s\S]*\}/)?.[0] ?? "";
  const parsed = JudgeSchema.safeParse(JSON.parse(json || "null"));
  if (!parsed.success) throw new Error(`Judge returned invalid output: ${reply.slice(0, 200)}`);
  return { ...parsed.data, tokens: usage.totalTokens };
}
