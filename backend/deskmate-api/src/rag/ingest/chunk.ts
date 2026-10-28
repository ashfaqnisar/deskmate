export type Chunk = { heading: string; content: string };

const MAX_CHARS = 1200;

// Splits a markdown document into one chunk per "## " section. Text before the first section
// (like a table under the title) becomes an "Overview" chunk. A section longer than MAX_CHARS is
// split on blank lines. Each chunk starts with the document title and heading, so it still makes
// sense (and embeds well) on its own.
export function chunkMarkdown(title: string, body: string): Chunk[] {
  const [intro = "", ...sections] = body.split(/^## /m);
  const parts = [
    { heading: "Overview", text: intro.replace(/^# .*\n?/, "").trim() },
    ...sections.map((section) => {
      const [heading = "", ...lines] = section.split("\n");
      return { heading: heading.trim(), text: lines.join("\n").trim() };
    }),
  ];

  return parts
    .filter((part) => part.text)
    .flatMap(({ heading, text }) =>
      splitLong(text).map((piece) => ({ heading, content: `${title} > ${heading}\n\n${piece}` })),
    );
}

function splitLong(text: string) {
  if (text.length <= MAX_CHARS) return [text];

  const parts: string[] = [];
  let current = "";
  for (const paragraph of text.split(/\n{2,}/)) {
    if (current && current.length + paragraph.length > MAX_CHARS) {
      parts.push(current);
      current = "";
    }
    current += (current ? "\n\n" : "") + paragraph;
  }
  return current ? [...parts, current] : parts;
}
