import { loadPrompt } from "./load";

export const systemPrompt = await loadPrompt("system", "v3");
export const intentPrompt = await loadPrompt("intent", "v1");
