import { beforeEach, expect, mock, test } from "bun:test";

const replies: string[] = [];
const chat = mock(async () => ({
  reply: replies.shift() ?? "",
  model: "test-model",
  usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
  latencyMs: 1,
}));

await mock.module("~/llm/provider", () => ({ chat, stream: mock() }));

const { chatService } = await import("./chat.service");

const body = { message: "hello", history: [] };

beforeEach(() => {
  replies.length = 0;
  chat.mockClear();
});

test("refuses a confident off_topic message without calling the main model", async () => {
  replies.push('{"intent":"off_topic","confidence":0.95}');
  const result = await chatService.reply(body);
  expect(result.model).toBe("guardrail");
  expect(chat).toHaveBeenCalledTimes(1);
});

test("answers normally for an HR or IT message", async () => {
  replies.push('{"intent":"policy_question","confidence":0.9}', "You get 18 days.");
  const result = await chatService.reply(body);
  expect(result.reply).toBe("You get 18 days.");
  expect(chat).toHaveBeenCalledTimes(2);
});

test("lets a low-confidence off_topic message through", async () => {
  replies.push('{"intent":"off_topic","confidence":0.4}', "Main answer");
  const result = await chatService.reply(body);
  expect(result.reply).toBe("Main answer");
});

test("continues to the main model when the classifier output is unusable", async () => {
  replies.push("bad", "still bad", "Main answer");
  const result = await chatService.reply(body);
  expect(result.reply).toBe("Main answer");
});
