import type { Source } from "@deskmate/shared";

const NAME = /\[([\w-]+\.md)\]/g;
// One or more citations in a row, with the spaces before them and any punctuation right after.
const RUN = /(?:\s*\[[\w-]+\.md\])+([.,;:!?]?)/g;

export const CITE_PREFIX = "#cite-";

// File names a reply cites like [leave-policy.md], in the order they first appear. When the
// reply's sources are known, citations of anything else are ignored.
function citedNames(content: string, known?: Source[]) {
  const names = [...new Set([...content.matchAll(NAME)].map((match) => match[1]!))];
  return known ? names.filter((name) => known.some(({ source }) => source === name)) : names;
}

export const citedSources = (content: string, known: Source[]) =>
  citedNames(content, known).map((name) => known.find(({ source }) => source === name)!);

// Turns each [file.md] into a numbered link, "[1](#cite-file.md)", which the Markdown component
// draws as a small badge. The badges move after the sentence's punctuation ("year.[1]", not
// "year [1]."). While streaming, a half-written "[file-na" at the end is hidden.
export function linkCitations(content: string, known: Source[] | undefined, isStreaming: boolean) {
  const names = citedNames(content, known);
  const text = isStreaming ? content.replace(/\s*\[[\w.-]*$/, "") : content;

  return text.replace(RUN, (run, punctuation: string) => {
    const links = [...run.matchAll(NAME)].map(([, name]) => {
      const index = names.indexOf(name!);
      return index === -1 ? "" : `[${index + 1}](${CITE_PREFIX}${name})`;
    });
    return punctuation + links.join("");
  });
}
