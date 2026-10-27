import { useState } from "react";

import { ArrowUp, Square } from "lucide-react";

import { Button } from "~/shared/shadcn/button";
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
    <form className="flex items-end gap-2 pt-3 pb-5" onSubmit={submit}>
      <Textarea
        className="max-h-40 min-h-9 flex-1 px-3 py-2 text-sm md:text-sm"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask about leave, IT help, policies…"
        rows={1}
        maxLength={4000}
      />
      {isStreaming ? (
        <Button
          type="button"
          variant="destructive"
          size="icon-lg"
          aria-label="Stop"
          onClick={onStop}
        >
          <Square className="fill-current" />
        </Button>
      ) : (
        <Button type="submit" size="icon-lg" aria-label="Send" disabled={!text.trim()}>
          <ArrowUp />
        </Button>
      )}
    </form>
  );
}
