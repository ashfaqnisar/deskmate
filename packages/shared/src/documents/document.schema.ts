import { z } from "zod";

// A company document an answer was based on, shown under the reply.
export const SourceSchema = z
  .object({
    source: z.string().meta({ description: "File name of the document." }),
    title: z.string(),
    section: z.string().meta({ description: "The best-matching section of the document." }),
  })
  .meta({
    examples: [{ source: "leave-policy.md", title: "Leave Policy", section: "Sick Leave" }],
  });
export type Source = z.infer<typeof SourceSchema>;

export const DocumentParams = z.object({
  source: z
    .string()
    .regex(/^[\w-]+\.md$/)
    .meta({
      description: "File name of the document, as listed in a reply's sources.",
      examples: ["leave-policy.md"],
    }),
});

export const DocumentResponse = z
  .object({
    source: z.string(),
    title: z.string(),
    content: z.string().meta({ description: "The document body in markdown." }),
  })
  .meta({
    examples: [
      {
        source: "leave-policy.md",
        title: "Leave Policy",
        content:
          "## Sick Leave\nEmployees receive **8 days** of paid sick leave per year. A medical certificate is required for sick leave longer than **2 consecutive days**.",
      },
    ],
  });
export type DocumentResponse = z.infer<typeof DocumentResponse>;
