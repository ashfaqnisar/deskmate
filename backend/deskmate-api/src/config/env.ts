import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3000),
  LLM_BASE_URL: z.string().url(),
  LLM_API_KEY: z.string().min(1, "LLM_API_KEY is empty; add it to .env"),
  LLM_MODEL: z.string().min(1),
  INTENT_MODEL: z.string().min(1).optional(),
  INTENT_BACKEND: z.enum(["llm", "decision"]).default("llm"),
  INTENT_DECISION_URL: z.url().default("http://localhost:11434"),
  INTENT_DECISION_MODEL: z.string().min(1).optional(),
  INTENT_DECISION_API_KEY: z.string().min(1).optional(),
  EMBED_BASE_URL: z.url().default("http://localhost:11434/v1"),
  EMBED_MODEL: z.string().min(1).default("nomic-embed-text"),
  DATABASE_URL: z.string().default("postgres://deskmate:deskmate@localhost:5432/deskmate"),
  CORS_ORIGIN: z
    .string()
    .default("http://localhost:5173")
    .transform((value) => value.split(",").map((origin) => origin.trim())),
  RATE_LIMIT_MAX: z.coerce.number().default(60),
  DOCS_ENABLED: z.stringbool().default(true),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment:\n", z.prettifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;
