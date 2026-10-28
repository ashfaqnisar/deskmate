import OpenAI from "openai";

import { env } from "~/config/env";

const client = new OpenAI({ baseURL: env.EMBED_BASE_URL, apiKey: "ollama", timeout: 60_000 });

async function embed(inputs: string[]) {
  const { data } = await client.embeddings.create({ model: env.EMBED_MODEL, input: inputs });
  return data.map((item) => item.embedding);
}

// nomic-embed-text expects these prefixes. Documents and questions must be embedded with the same
// model, but with different prefixes.
export const embedDocuments = (texts: string[]) =>
  embed(texts.map((text) => `search_document: ${text}`));

export const embedQuery = async (text: string) => (await embed([`search_query: ${text}`]))[0]!;
