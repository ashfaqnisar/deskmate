import { env } from "~/config/env";

import { INTENT_DESCRIPTIONS, INTENTS } from "./intent.schema";

import type { IntentResult } from "./intent.schema";

type DecisionResponse = {
  answers: { intent: { choice: IntentResult["intent"]; probabilities: Record<string, number> } };
  usage: { input_tokens: number; output_tokens: number };
};

const questions = {
  intent: {
    type: "choice",
    instructions:
      "Which intent best matches this message from an employee to an HR and IT helpdesk? If the message mixes topics, pick the main request.",
    criteria: INTENT_DESCRIPTIONS,
  },
};

export async function classifyWithDecisionModel(message: string, signal?: AbortSignal) {
  if (!env.INTENT_DECISION_MODEL) throw new Error("INTENT_DECISION_MODEL is not set");

  const response = await fetch(`${env.INTENT_DECISION_URL}/v1/systemone`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(env.INTENT_DECISION_API_KEY && {
        authorization: `Bearer ${env.INTENT_DECISION_API_KEY}`,
      }),
    },
    body: JSON.stringify({ model: env.INTENT_DECISION_MODEL, state: message, questions }),
    signal,
  });
  if (!response.ok) {
    throw new Error(`Decision model request failed: ${response.status} ${await response.text()}`);
  }

  const { answers, usage } = (await response.json()) as DecisionResponse;
  const { choice, probabilities } = answers.intent;
  if (!INTENTS.includes(choice))
    throw new Error(`Decision model returned unknown intent: ${choice}`);

  return {
    intent: choice,
    confidence: probabilities[choice] ?? 0,
    tokens: usage.input_tokens + usage.output_tokens,
  };
}
