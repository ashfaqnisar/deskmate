export async function loadPrompt(name: string, version: string) {
  const template = await Bun.file(new URL(`./${name}/${version}.md`, import.meta.url)).text();

  return {
    version,
    render: (vars: Record<string, string> = {}) =>
      template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
        const value = vars[key];
        if (value === undefined) throw new Error(`Missing prompt variable: ${key}`);
        return value;
      }),
  };
}
