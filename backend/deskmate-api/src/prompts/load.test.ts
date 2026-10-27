import { expect, test } from "bun:test";

import { systemPrompt } from "./index";

test("renders the date into the system prompt", () => {
  const prompt = systemPrompt.render({ today: "2026-10-27" });
  expect(prompt).toContain("Today's date is 2026-10-27.");
  expect(prompt).not.toContain("{{");
});

test("throws when a variable is missing", () => {
  expect(() => systemPrompt.render({})).toThrow("Missing prompt variable: today");
});
