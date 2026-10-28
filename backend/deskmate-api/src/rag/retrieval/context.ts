import { logger } from "~/lib/logger";

import { MIN_SIMILARITY } from "~/rag/config";

import { retrieve } from "./retrieve";

import type { AccessLevel } from "~/db/schema";
import type { Source } from "@deskmate/shared";

const NO_DOCUMENTS = "No relevant company documents were found for this message.";
export const NO_CONTEXT = { text: NO_DOCUMENTS, sources: [] as Source[] };
const UNAVAILABLE = {
  text: "The company documents are temporarily unavailable. Say you cannot look them up right now.",
  sources: [] as Source[],
};

// Builds the "Company information" block for the system prompt from the most relevant chunks,
// plus the list of documents they came from (one entry per document, best match first).
export async function buildContext(question: string, accessLevels: AccessLevel[]) {
  try {
    const chunks = await retrieve(question, { accessLevels });
    const relevant = chunks.filter((chunk) => chunk.similarity >= MIN_SIMILARITY);
    logger.info(
      { found: relevant.map((c) => `${c.source}#${c.heading}`), best: chunks[0]?.similarity },
      "Retrieved context",
    );
    if (relevant.length === 0) return NO_CONTEXT;

    const text = relevant
      .map(
        (c) => `<document source="${c.source}" section="${c.heading}">\n${c.content}\n</document>`,
      )
      .join("\n\n");
    // `relevant` is best match first, so keeping the first chunk of each document keeps its best section.
    const best = relevant.filter((c, i) => relevant.findIndex((o) => o.source === c.source) === i);
    const sources = best.map((c) => ({
      source: c.source,
      title: c.title,
      section: c.heading,
    }));
    return { text, sources };
  } catch (err)  {
    logger.error({ err }, "Retrieval failed");
    return UNAVAILABLE;
  }
}
