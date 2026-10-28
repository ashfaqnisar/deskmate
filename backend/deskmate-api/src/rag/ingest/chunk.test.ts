import { expect, test } from "bun:test";

import { chunkMarkdown } from "./chunk";

const doc = `# Leave Policy

Intro text that is not part of any section.

## Annual Leave
Employees get **18 days**.

## Sick Leave
Employees get **8 days**.
`;

test("makes one chunk per section, plus an overview for text before the first section", () => {
  const chunks = chunkMarkdown("Leave Policy", doc);
  expect(chunks.map((c) => c.heading)).toEqual(["Overview", "Annual Leave", "Sick Leave"]);
  expect(chunks[1]!.content).toStartWith("Leave Policy > Annual Leave");
  expect(chunks[1]!.content).toContain("18 days");
});

test("splits a long section on paragraph boundaries", () => {
  const paragraph = "word ".repeat(150).trim();
  const long = `## Long\n${[paragraph, paragraph, paragraph].join("\n\n")}`;
  const chunks = chunkMarkdown("Doc", long);
  expect(chunks.length).toBeGreaterThan(1);
  expect(chunks.every((c) => c.heading === "Long")).toBe(true);
});

test("keeps a document with no sections as a single overview chunk", () => {
  const chunks = chunkMarkdown("Salary Bands", "# Salary Bands\n\n| L1 | 6 to 10 |\n");
  expect(chunks).toHaveLength(1);
  expect(chunks[0]!.content).toContain("6 to 10");
});

test("returns no chunks for an empty document", () => {
  expect(chunkMarkdown("Doc", "# Doc\n")).toEqual([]);
});
