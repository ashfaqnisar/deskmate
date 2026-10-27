import { StreamEventSchema } from "@deskmate/shared";

import type { ChatBody, StreamEvent } from "@deskmate/shared";

async function readError(res: Response) {
  const body = await res.json().catch(() => null);
  return body?.message ?? body?.error ?? `Request failed (${res.status})`;
}

function parseMessage(raw: string): StreamEvent | null {
  let event = "message";
  const data: string[] = [];
  for (const line of raw.split("\n")) {
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) data.push(line.slice(5).trim());
  }
  if (!data.length) return null;

  const payload = JSON.parse(data.join("\n"));
  if (event === "error") throw new Error(payload.error ?? "The stream failed");
  return StreamEventSchema.parse(payload);
}

export async function* streamChat(
  body: ChatBody,
  signal?: AbortSignal,
): AsyncGenerator<StreamEvent> {
  const res = await fetch("/api/v1/chat/stream", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body) throw new Error(await readError(res));

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += value;

    let end = buffer.indexOf("\n\n");
    while (end !== -1) {
      const event = parseMessage(buffer.slice(0, end));
      buffer = buffer.slice(end + 2);
      if (event) yield event;
      end = buffer.indexOf("\n\n");
    }
  }
}

export async function fetchHealth(signal?: AbortSignal) {
  const res = await fetch("/api/v1/health", { signal });
  if (!res.ok) throw new Error(await readError(res));
  return true;
}
