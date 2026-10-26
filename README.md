# Deskmate

An internal HR/IT helpdesk AI agent for the fictional **Acme Corp**, built by hand as a learning project.

- Answers policy questions from company docs (RAG + pgvector) with citations, and refuses when the answer isn't there
- Files leave requests and Jira tickets via tool calling and MCP
- Role-based access (employee / manager / hr_admin) enforced in code, not in the prompt
- Guardrails against SQL injection and prompt injection
- Evals for everything

**Stack:** TypeScript · Bun · DeepSeek API · Postgres + pgvector · Ollama embeddings · MCP TS SDK

📘 Start here: [`docs/LEARNING_PLAN.md`](docs/LEARNING_PLAN.md)

## Layout (so far)
- `docs/`: learning plan and notes
- `data/company/`: fake company knowledge base for RAG
- `data/evals/`: eval datasets (you write these)
