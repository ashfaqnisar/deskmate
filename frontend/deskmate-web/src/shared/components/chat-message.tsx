import { cn } from "~/lib/utils";

import { Markdown } from "~/shared/components/markdown";

import type { Message } from "~/hooks/use-chat";

export function ChatMessage({ message, isStreaming }: { message: Message; isStreaming: boolean }) {
  const { role, content, error, meta } = message;
  const isUser = role === "user";

  return (
    <article className={cn("flex max-w-[85%] flex-col text-sm", isUser && "items-end self-end")}>
      {isUser ? (
        <div className="rounded-2xl rounded-br-sm bg-muted px-3.5 py-2 break-words whitespace-pre-wrap">
          {content}
        </div>
      ) : (
        <>
          {content && <Markdown isStreaming={isStreaming}>{content}</Markdown>}
          {isStreaming && !content && !error && (
            <span className="text-muted-foreground">Thinking…</span>
          )}
        </>
      )}
      {error && <p className="mt-1.5 text-destructive">{error}</p>}
      {meta && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          {meta.model} · {meta.totalTokens} tokens · {(meta.latencyMs / 1000).toFixed(1)}s
        </p>
      )}
    </article>
  );
}
