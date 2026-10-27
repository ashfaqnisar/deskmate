import { beforeEach, expect, mock, test } from "bun:test";

const replies: string[] = [];
const chat = mock(async () => ({
  reply: replies.shift() ?? "",
  usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
}));

await mock.module("~/llm/provider", () => ({ chat }));

const { intentService } = await import("./intent.service");

beforeEach(() => {
  replies.length = 0;
  chat.mockClear();
});

test("returns the intent when the JSON is valid", async () => {
  replies.push('{"intent":"it_ticket","confidence":0.9}');
  const result = await intentService.classify("my laptop is broken");
  expect(result).toEqual({ intent: "it_ticket", confidence: 0.9, tokens: 2 });
  expect(chat).toHaveBeenCalledTimes(1);
});

test("retries once when the first reply is invalid", async () => {
  replies.push("not json", '{"intent":"chitchat","confidence":0.8}');
  const result = await intentService.classify("hi");
  expect(result.intent).toBe("chitchat");
  expect(result.tokens).toBe(4);
  expect(chat).toHaveBeenCalledTimes(2);
});

test("retries when the intent is not one of the allowed values", async () => {
  replies.push('{"intent":"weather","confidence":0.9}', '{"intent":"off_topic","confidence":0.7}');
  const result = await intentService.classify("will it rain?");
  expect(result.intent).toBe("off_topic");
});

test("throws when both attempts are invalid", async () => {
  replies.push("nope", "still nope");
  const error = await intentService.classify("hi").catch((err: unknown) => err);
  expect(String(error)).toContain("invalid JSON twice");
  expect(chat).toHaveBeenCalledTimes(2);
});
