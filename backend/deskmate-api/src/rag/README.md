# RAG

Lets Deskmate answer from the company documents in `data/company/`.

```
rag/
  config.ts         docs folder, who may read what, how many chunks, similarity threshold
  embed.ts          text -> numbers (nomic-embed-text through Ollama)
  front-matter.ts   reads a document's header (title, access_level)
  ingest/           load documents into Postgres (run with `bun run ingest`)
    ingest.ts         read -> chunk -> embed -> store; only re-embeds changed files
    chunk.ts          split a document into one chunk per "## " section
  retrieval/        used on every chat message
    retrieve.ts       embed the question and find the closest chunks
    context.ts        keep the relevant ones and format them for the prompt
```

Flow: `ingest` fills the `documents` and `chunks` tables once. For each question,
`retrieval/context.ts` returns the prompt text and the list of sources, which the chat service puts
into the system prompt and sends to the UI.
