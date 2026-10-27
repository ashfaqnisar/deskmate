import { z } from "zod";

export const UsageSchema = z.object({
  promptTokens: z.number(),
  completionTokens: z.number(),
  totalTokens: z.number(),
});
export type Usage = z.infer<typeof UsageSchema>;
