import { useState } from "react";

import { Button } from "~/components/button";

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
      <textarea
        className="field-sizing-content max-h-40 flex-1 resize-none rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 dark:border-stone-800 dark:bg-stone-900"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask about leave, IT help, policies…"
        rows={1}
        maxLength={4000}
      />
      {isStreaming ? (
        <Button type="button" variant="danger" onClick={onStop}>
          Stop
        </Button>
      ) : (
        <Button type="submit" disabled={!text.trim()}>
          Send
        </Button>
      )}
    </form>
  );
}
