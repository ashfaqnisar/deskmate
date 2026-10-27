import { createRoute } from "@tanstack/react-router";
import clsx from "clsx";

import { useApiHealth } from "~/hooks/use-api-health";
import { useChat } from "~/hooks/use-chat";

import { Button } from "~/components/button";
import { ChatMessage } from "~/components/chat-message";
import { Composer } from "~/components/composer";

import { rootRoute } from "~/routes/root";

function ChatPage() {
  const { messages, isStreaming, send, stop, reset } = useChat();
  const health = useApiHealth();

  return (
    <>
      <header className="flex items-center justify-between border-b border-stone-200 py-4 dark:border-stone-800">
        <div className="flex items-center gap-2.5">
          <h1 className="text-[17px] font-semibold tracking-tight">Deskmate</h1>
          <span
            title={
              health.isError ? "API offline" : health.isSuccess ? "API online" : "Checking API…"
            }
            className={clsx(
              "size-2 rounded-full",
              health.isSuccess && "bg-emerald-500",
              health.isError && "bg-red-500",
              health.isPending && "bg-stone-400",
            )}
          />
        </div>
        <Button variant="ghost" onClick={reset} disabled={!messages.length}>
          New chat
        </Button>
      </header>

      <main className="flex flex-1 flex-col gap-5 overflow-y-auto py-6">
        {messages.length === 0 ? (
          <p className="m-auto text-stone-500">Ask me anything about Acme HR or IT.</p>
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={message.id}
              message={message}
              isStreaming={isStreaming && index === messages.length - 1}
            />
          ))
        )}
        <div ref={(node) => node?.scrollIntoView({ block: "end" })} />
      </main>

      <Composer isStreaming={isStreaming} onSend={send} onStop={stop} />
    </>
  );
}

export const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: ChatPage,
});
