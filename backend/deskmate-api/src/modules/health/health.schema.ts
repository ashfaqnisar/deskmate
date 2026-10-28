import { z } from "zod";

export const HealthSchema = z.object({ status: z.literal("ok") }).meta({
  examples: [{ status: "ok" }],
});
export type Health = z.infer<typeof HealthSchema>;
