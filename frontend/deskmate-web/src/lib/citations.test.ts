import { expect, test } from "bun:test";

import { citedSources, linkCitations } from "~/lib/citations";

const sources = [
  { source: "wfh-and-holidays.md", title: "Work From Home", section: "Work From Home" },
  { source: "leave-policy.md", title: "Leave Policy", section: "Sick Leave" },
];

test("numbers citations by first appearance and moves them after the punctuation", () => {
  const text = "You can work 2 days [wfh-and-holidays.md]. Sick leave is 8 days [leave-policy.md].";
  expect(linkCitations(text, sources, false)).toBe(
    "You can work 2 days.[1](#cite-wfh-and-holidays.md) Sick leave is 8 days.[2](#cite-leave-policy.md)",
  );
});

test("keeps a run of citations together after the punctuation", () => {
  const text = "Two days [wfh-and-holidays.md] [leave-policy.md].";
  expect(linkCitations(text, sources, false)).toBe(
    "Two days.[1](#cite-wfh-and-holidays.md)[2](#cite-leave-policy.md)",
  );
});

test("removes citations of documents that are not among the sources", () => {
  expect(linkCitations("Call HR [HR_CONTACT.md].", sources, false)).toBe("Call HR.");
});

test("hides a half-written citation while streaming", () => {
  expect(linkCitations("Eight days [leave-pol", undefined, true)).toBe("Eight days");
});

test("lists only cited sources, in the order cited", () => {
  const text = "A [leave-policy.md]. B [wfh-and-holidays.md].";
  expect(citedSources(text, sources).map((s) => s.source)).toEqual([
    "leave-policy.md",
    "wfh-and-holidays.md",
  ]);
});
