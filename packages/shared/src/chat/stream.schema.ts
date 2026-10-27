import { z } from "zod";

import { ChatResponse } from "./chat.schema";

export const StreamEventSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("delta"), text: z.string() }),
  ChatResponse.omit({ reply: true }).extend({ type: z.literal("done") }),
]);
export type StreamEvent = z.infer<typeof StreamEventSchema>;
