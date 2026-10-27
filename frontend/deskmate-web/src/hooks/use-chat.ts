import { useRef, useState } from "react";

import { useMutation } from "@tanstack/react-query";

import { streamChat } from "~/lib/api";

import type { ChatMessage } from "@deskmate/shared";

export type Message = ChatMessage & {
  id: string;
  error?: string;
  meta?: { model: string; totalTokens: number; latencyMs: number };
};

type SendVariables = {
  text: string;
  history: ChatMessage[];
  replyId: string;
  signal: AbortSignal;
};

const MAX_HISTORY = 20;

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const controller = useRef<AbortController | null>(null);

  const update = (id: string, change: (message: Message) => Message) =>
    setMessages((all) => all.map((message) => (message.id === id ? change(message) : message)));

  const mutation = useMutation({
    mutationFn: async ({ text, history, replyId, signal }: SendVariables) => {
      for await (const event of streamChat({ message: text, history }, signal)) {
        if (event.type === "delta") {
          update(replyId, (message) => ({ ...message, content: message.content + event.text }));
        } else {
          const { model, usage, latencyMs } = event;
          update(replyId, (message) => ({
            ...message,
            meta: { model, totalTokens: usage.totalTokens, latencyMs },
          }));
        }
      }
    },
    onError: (err, { replyId, signal }) => {
      if (!signal.aborted) update(replyId, (message) => ({ ...message, error: err.message }));
    },
  });

  const send = (text: string) => {
    const history = messages
      .filter((message) => message.content && !message.error)
      .slice(-MAX_HISTORY)
      .map(({ role, content }) => ({ role, content }));

    const reply: Message = { id: crypto.randomUUID(), role: "assistant", content: "" };
    setMessages((all) => [...all, { id: crypto.randomUUID(), role: "user", content: text }, reply]);

    controller.current = new AbortController();
    mutation.mutate({ text, history, replyId: reply.id, signal: controller.current.signal });
  };

  const stop = () => controller.current?.abort();

  const reset = () => {
    controller.current?.abort();
    mutation.reset();
    setMessages([]);
  };

  return { messages, isStreaming: mutation.isPending, send, stop, reset };
}
