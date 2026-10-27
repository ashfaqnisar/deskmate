const PROMPT_VERSION = "v2";

const template = await Bun.file(new URL(`./system.${PROMPT_VERSION}.md`, import.meta.url)).text();

export const systemPrompt = {
  version: PROMPT_VERSION,
  render: (vars: Record<string, string>) =>
    template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
      const value = vars[key];
      if (value === undefined) throw new Error(`Missing prompt variable: ${key}`);
      return value;
    }),
};
