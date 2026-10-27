import { createRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { useApiHealth } from "~/hooks/use-api-health";
import { useChat } from "~/hooks/use-chat";
import { cn } from "~/lib/utils";

import { ChatMessage } from "~/shared/components/chat-message";
import { Composer } from "~/shared/components/composer";
import { Button } from "~/shared/shadcn/button";

import { rootRoute } from "~/routes/root";

function ChatPage() {
  const { messages, isStreaming, send, stop, reset } = useChat();
  const health = useApiHealth();

  return (
    <>
      <header className="flex items-center justify-between border-b py-4">
        <div className="flex items-center gap-2.5">
          <h1 className="font-heading text-base font-semibold tracking-tight">Deskmate</h1>
          <span
            title={
              health.isError ? "API offline" : health.isSuccess ? "API online" : "Checking API…"
            }
            className={cn(
              "size-2 rounded-full",
              health.isSuccess && "bg-emerald-500",
              health.isError && "bg-destructive",
              health.isPending && "bg-muted-foreground/40",
            )}
          />
        </div>
        <Button variant="outline" size="sm" onClick={reset} disabled={!messages.length}>
          <Plus />
          New chat
        </Button>
      </header>

      <main className="flex flex-1 flex-col gap-5 overflow-y-auto py-6">
        {messages.length === 0 ? (
          <p className="m-auto text-sm text-muted-foreground">
            Ask me anything about Acme HR or IT.
          </p>
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
