import { cosineDistance, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "~/db";
import { chunks, documents } from "~/db/schema";

import { TOP_K } from "~/rag/config";
import { embedQuery } from "~/rag/embed";

import type { AccessLevel } from "~/db/schema";

type Options = { accessLevels: AccessLevel[]; k?: number };

// Returns the k chunks closest to the question, limited to documents the caller may read.
// similarity is cosine similarity: 1 means identical direction, 0 means unrelated.
export async function retrieve(question: string, { accessLevels, k = TOP_K }: Options) {
  const embedding = await embedQuery(question);
  const similarity = sql<number>`1 - (${cosineDistance(chunks.embedding, embedding)})`;

  return db
    .select({
      source: documents.source,
      title: documents.title,
      heading: chunks.heading,
      content: chunks.content,
      similarity,
    })
    .from(chunks)
    .innerJoin(documents, eq(chunks.documentId, documents.id))
    .where(inArray(documents.accessLevel, accessLevels))
    .orderBy(desc(similarity))
    .limit(k);
}
