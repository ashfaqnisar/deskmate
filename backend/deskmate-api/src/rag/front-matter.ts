import { ACCESS_LEVELS } from "~/db/schema";

// Splits "---\nkey: value\n---\nbody" into its fields and body.
export function parseFrontMatter(text: string) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error("missing front matter");

  const fields = Object.fromEntries(
    match[1]!.split("\n").map((line) => {
      const [key, ...rest] = line.split(":");
      return [key!.trim(), rest.join(":").trim()];
    }),
  );
  const accessLevel = ACCESS_LEVELS.find((level) => level === fields.access_level);
  if (!fields.title || !accessLevel) throw new Error("front matter needs title and access_level");

  return { title: fields.title, accessLevel, body: match[2]! };
}
