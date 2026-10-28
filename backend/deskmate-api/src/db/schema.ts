import { pgTable, text, timestamp, uuid, vector } from "drizzle-orm/pg-core";

export const ACCESS_LEVELS = ["employee", "manager", "hr_admin"] as const;
export type AccessLevel = (typeof ACCESS_LEVELS)[number];

// nomic-embed-text produces 768-dimension vectors
export const EMBEDDING_DIMENSIONS = 768;

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  source: text("source").notNull().unique(),
  title: text("title").notNull(),
  accessLevel: text("access_level").$type<AccessLevel>().notNull(),
  contentHash: text("content_hash").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const chunks = pgTable("chunks", {
  id: uuid("id").primaryKey().defaultRandom(),
  documentId: uuid("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  heading: text("heading").notNull(),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: EMBEDDING_DIMENSIONS }).notNull(),
});
