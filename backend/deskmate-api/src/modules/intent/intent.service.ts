import { env } from "~/config/env";
import { logger } from "~/lib/logger";

import { classifyWithDecisionModel } from "./intent.decision";
import { classifyWithLlm } from "./intent.llm";

export const intentService = {
  async classify(message: string, signal?: AbortSignal) {
    const classify =
      env.INTENT_BACKEND === "decision" ? classifyWithDecisionModel : classifyWithLlm;
    const result = await classify(message, signal);
    logger.info(
      { intent: result.intent, confidence: result.confidence, backend: env.INTENT_BACKEND },
      "Intent",
    );
    return result;
  },
};
