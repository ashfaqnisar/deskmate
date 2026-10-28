import { StreamEventSchema } from "@deskmate/shared";

import type { Readable } from "node:stream";
import type { z } from "zod";

const streamExample =
  'data: {"type":"delta","text":"Hello"}\n\n' +
  'data: {"type":"delta","text":" there!"}\n\n' +
  'data: {"type":"done","model":"deepseek-chat","usage":{"promptTokens":12,"completionTokens":4,"totalTokens":16},"latencyMs":812,"sources":[{"source":"leave-policy.md","title":"Leave Policy","section":"Sick Leave"}]}\n\n';

// Documents the events in OpenAPI; at runtime the route sends a Readable stream of them.
export const StreamResponse = StreamEventSchema.meta({
  description: "Server-sent events. Each message is a `data:` line holding one JSON event.",
  examples: [streamExample],
}) as unknown as z.ZodType<Readable>;
