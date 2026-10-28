import { and, eq, inArray } from "drizzle-orm";

import { db } from "~/db";
import { documents } from "~/db/schema";
import { HttpError } from "~/lib/errors";
import { DOCS_DIR, READABLE_LEVELS } from "~/rag/config";
import { parseFrontMatter } from "~/rag/front-matter";

export const documentsService = {
  // The source must exist in the documents table and be readable, so it can never be used to
  // read an arbitrary file.
  async get(source: string) {
    const [doc] = await db
      .select({ title: documents.title })
      .from(documents)
      .where(and(eq(documents.source, source), inArray(documents.accessLevel, READABLE_LEVELS)));
    if (!doc) throw new HttpError(404, "Document not found");

    const { body } = parseFrontMatter(await Bun.file(new URL(source, DOCS_DIR)).text());
    return { source, title: doc.title, content: body.trim().replace(/^# .*\n+/, "") };
  },
};
