import clsx from "clsx";

import type { Message } from "~/hooks/use-chat";

export function ChatMessage({ message, isStreaming }: { message: Message; isStreaming: boolean }) {
  const { role, content, error, meta } = message;
  const isUser = role === "user";

  return (
    <article className={clsx("flex max-w-[85%] flex-col", isUser && "items-end self-end")}>
      <div
        className={clsx(
          "break-words whitespace-pre-wrap",
          isUser && "rounded-2xl rounded-br-sm bg-indigo-100 px-3.5 py-2 dark:bg-indigo-950",
        )}
      >
        {content}
        {isStreaming && !content && !error && <span className="text-stone-500">Thinking…</span>}
        {isStreaming && content && (
          <span className="ml-0.5 inline-block h-[1em] w-1.5 animate-pulse bg-indigo-600 align-text-bottom dark:bg-indigo-400" />
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>}
      {meta && (
        <p className="mt-1.5 text-xs text-stone-500">
          {meta.model} · {meta.totalTokens} tokens · {(meta.latencyMs / 1000).toFixed(1)}s
        </p>
      )}
    </article>
  );
}
