import { judge } from "./judge";

import type { Check, CheckResult, EvalCase } from "./types";

type CheckOutcome = CheckResult & { tokens: number };

export async function runCheck(
  check: Check,
  testCase: EvalCase,
  reply: string,
): Promise<CheckOutcome> {
  const text = reply.toLowerCase();

  switch (check.type) {
    case "contains":
      return {
        check,
        passed: text.includes(check.value.toLowerCase()),
        detail: `should contain "${check.value}"`,
        tokens: 0,
      };
    case "notContains":
      return {
        check,
        passed: !text.includes(check.value.toLowerCase()),
        detail: `should not contain "${check.value}"`,
        tokens: 0,
      };
    case "regex":
      return {
        check,
        passed: new RegExp(check.pattern, "i").test(reply),
        detail: `should match /${check.pattern}/`,
        tokens: 0,
      };
    case "judge": {
      const { score, reason, tokens } = await judge(testCase.input, reply, check.rubric);
      return {
        check,
        passed: score >= check.minScore,
        detail: `judge needs ${check.minScore}/5`,
        score,
        reason,
        tokens,
      };
    }
  }
}
