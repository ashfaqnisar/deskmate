import type { AccessLevel } from "~/db/schema";

// Where the company documents live.
export const DOCS_DIR = new URL("../../../../data/company/", import.meta.url);

// Until auth exists (Phase 7), everyone is an employee and can only read employee documents.
export const READABLE_LEVELS: AccessLevel[] = ["employee"];

// How many chunks to fetch for each question.
export const TOP_K = 4;

// Below this cosine similarity a chunk is treated as unrelated. Relevant chunks scored 0.68 to
// 0.87 and unanswerable questions scored at most 0.59 when this was measured; re-measure it if
// the documents or the embedding model change.
export const MIN_SIMILARITY = 0.62;
