import { eq, notInArray } from "drizzle-orm";

import { db } from "~/db";
import { chunks, documents } from "~/db/schema";
import { logger } from "~/lib/logger";

import { chunkMarkdown } from "./chunk";
import { DOCS_DIR } from "~/rag/config";
import { embedDocuments } from "~/rag/embed";
import { parseFrontMatter } from "~/rag/front-matter";

// Re-running only re-embeds files whose content changed, and removes docs that no longer exist.
export async function ingest() {
  const files = await Array.fromAsync(new Bun.Glob("*.md").scan(Bun.fileURLToPath(DOCS_DIR)));
  const existing = new Map(
    (await db.select().from(documents)).map((doc) => [doc.source, doc.contentHash]),
  );

  let changed = 0;
  for (const source of files) {
    const text = await Bun.file(new URL(source, DOCS_DIR)).text();
    const contentHash = Bun.hash(text).toString(16);
    if (existing.get(source) === contentHash) continue;

    const { title, accessLevel, body } = parseFrontMatter(text);
    const pieces = chunkMarkdown(title, body);
    const embeddings = await embedDocuments(pieces.map((piece) => piece.content));

    await db.transaction(async (tx) => {
      await tx.delete(documents).where(eq(documents.source, source));
      const [doc] = await tx
        .insert(documents)
        .values({ source, title, accessLevel, contentHash })
        .returning({ id: documents.id });
      await tx
        .insert(chunks)
        .values(
          pieces.map((piece, i) => ({ ...piece, documentId: doc!.id, embedding: embeddings[i]! })),
        );
    });
    changed++;
    logger.info({ source, chunks: pieces.length, accessLevel }, "Document ingested");
  }

  const removed = await db.delete(documents).where(notInArray(documents.source, files)).returning();
  logger.info({ files: files.length, changed, removed: removed.length }, "Ingest finished");
}

if (import.meta.main) {
  await ingest();
  await db.$client.close();
}
