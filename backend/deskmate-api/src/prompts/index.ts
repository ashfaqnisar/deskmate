import { loadPrompt } from "./load";

export const systemPrompt = await loadPrompt("system", "v2");
export const intentPrompt = await loadPrompt("intent", "v1");
