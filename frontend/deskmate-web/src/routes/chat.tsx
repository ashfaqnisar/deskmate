import { createRoute } from "@tanstack/react-router";

import { useApiHealth } from "~/hooks/use-api-health";
import { useChat } from "~/hooks/use-chat";

import { ChatHeader } from "~/shared/components/chat-header";
import { ChatMessage } from "~/shared/components/chat-message";
import { Composer } from "~/shared/components/composer";
import { EmptyState } from "~/shared/components/empty-state";

import { rootRoute } from "~/routes/root";

function ChatPage() {
  const { messages, isStreaming, send, regenerate, stop, reset } = useChat();
  const health = useApiHealth();
  const status = health.isError ? "offline" : health.isSuccess ? "online" : "checking";

  return (
    <>
      <ChatHeader status={status} canReset={messages.length > 0} onReset={reset} />

      <main className="flex flex-1 flex-col gap-6 overflow-y-auto py-6">
        {messages.length === 0 ? (
          <EmptyState onPick={send} />
        ) : (
          <>
            {messages.map((message, index) => {
              const isLast = index === messages.length - 1;
              return (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isStreaming={isStreaming && isLast}
                  canRegenerate={isLast && !isStreaming}
                  onRegenerate={regenerate}
                />
              );
            })}
            <div ref={(node) => node?.scrollIntoView({ block: "end" })} />
          </>
        )}
      </main>

      <div className="pt-2 pb-4">
        <Composer isStreaming={isStreaming} onSend={send} onStop={stop} />
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Deskmate can make mistakes. For anything important, confirm with HR or IT.
        </p>
      </div>
    </>
  );
}

export const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: ChatPage,
});
