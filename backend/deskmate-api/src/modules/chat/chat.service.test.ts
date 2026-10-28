import { beforeEach, expect, mock, test } from "bun:test";

const replies: string[] = [];
const chat = mock(async () => ({
  reply: replies.shift() ?? "",
  model: "test-model",
  usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
  latencyMs: 1,
}));

await mock.module("~/llm/provider", () => ({ chat, stream: mock() }));
const sources = [{ source: "leave-policy.md", title: "Leave Policy", section: "Sick Leave" }];
const buildContext = mock(async () => ({ text: "<document>sample</document>", sources }));
await mock.module("~/rag/retrieval/context", () => ({
  buildContext,
  NO_CONTEXT: { text: "none", sources: [] },
}));

const { chatService } = await import("./chat.service");

const body = { message: "hello", history: [] };

beforeEach(() => {
  replies.length = 0;
  chat.mockClear();
  buildContext.mockClear();
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

test("puts the retrieved documents into the system prompt", async () => {
  replies.push('{"intent":"policy_question","confidence":0.9}', "You get 18 days.");
  await chatService.reply(body);
  const [messages] = chat.mock.calls[1] as unknown as [{ role: string; content: string }[]];
  expect(messages[0]!.content).toContain("<document>sample</document>");
});

test("returns the sources the answer was based on", async () => {
  replies.push('{"intent":"policy_question","confidence":0.9}', "You get 8 days.");
  const result = await chatService.reply(body);
  expect(result.sources).toEqual(sources);
});

test("skips retrieval for small talk", async () => {
  replies.push('{"intent":"chitchat","confidence":0.9}', "Hi!");
  await chatService.reply(body);
  expect(buildContext).not.toHaveBeenCalled();
});
