import { useState } from "react";

import { ArrowUp, Square } from "lucide-react";

import { Button } from "~/shared/shadcn/button";
import { Kbd, KbdGroup } from "~/shared/shadcn/kbd";
import { Textarea } from "~/shared/shadcn/textarea";

import type { FormEvent, KeyboardEvent } from "react";

type Props = { isStreaming: boolean; onSend: (text: string) => void; onStop: () => void };

export function Composer({ isStreaming, onSend, onStop }: Props) {
  const [text, setText] = useState("");

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const message = text.trim();
    if (!message || isStreaming) return;
    onSend(message);
    setText("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) submit(event);
  };

  return (
    <form
      className="rounded-xl border bg-card shadow-sm transition-shadow focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30"
      onSubmit={submit}
    >
      <Textarea
        className="max-h-40 min-h-12 border-0 bg-transparent px-4 py-3 text-sm shadow-none focus-visible:ring-0 md:text-sm dark:bg-transparent"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask about leave, IT help, policies…"
        rows={1}
        maxLength={4000}
      />
      <div className="flex items-center justify-between gap-2 px-3 pb-3">
        <p className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
          <Kbd>Enter</Kbd> to send
          <KbdGroup>
            <Kbd>Shift</Kbd>+<Kbd>Enter</Kbd>
          </KbdGroup>
          for a new line
        </p>
        {isStreaming ? (
          <Button
            type="button"
            variant="destructive"
            size="icon-lg"
            aria-label="Stop"
            className="ml-auto"
            onClick={onStop}
          >
            <Square className="fill-current" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon-lg"
            aria-label="Send"
            className="ml-auto"
            disabled={!text.trim()}
          >
            <ArrowUp />
          </Button>
        )}
      </div>
    </form>
  );
}
