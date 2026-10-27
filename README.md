# Deskmate

An internal HR/IT helpdesk AI agent for the fictional **Acme Corp**, built by hand as a learning project.

- Answers policy questions from company docs (RAG + pgvector) with citations, and refuses when the answer isn't there
- Files leave requests and Jira tickets via tool calling and MCP
- Role-based access (employee / manager / hr_admin) enforced in code, not in the prompt
- Guardrails against SQL injection and prompt injection
- Evals for everything

**Stack:** TypeScript · Bun · DeepSeek API · Postgres + pgvector · Ollama embeddings · MCP TS SDK

## Layout

Bun workspaces monorepo.

- `apps/api/`: Fastify API (chat, docs, database, migrations)
- `apps/web/`: React UI (not created yet)
- `packages/shared/`: zod schemas and types shared by the API and the UI
- `data/company/`: fake company knowledge base for RAG
- `data/evals/`: eval datasets (you write these)
- `docs/`: learning plan and notes

## Getting started

```sh
bun install
docker compose up -d                 # Postgres + pgvector
cp apps/api/.env.example apps/api/.env   # then fill in LLM_API_KEY
bun run db:migrate
bun run dev                          # API on http://localhost:3000, docs at /docs
```

Other scripts: `bun run typecheck`, `bun run lint`, `bun run lint:fix`, `bun run db:generate`.
