import { useState } from "react";

import { Check, Copy, RefreshCw, Sparkles } from "lucide-react";

import { citedSources, linkCitations } from "~/lib/citations";
import { cn } from "~/lib/utils";

import { DocumentDialog } from "~/shared/components/document-dialog";
import { Markdown } from "~/shared/components/markdown";
import { SourceChips } from "~/shared/components/source-chips";
import { Avatar, AvatarFallback } from "~/shared/shadcn/avatar";
import { Button } from "~/shared/shadcn/button";
import { Skeleton } from "~/shared/shadcn/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/shared/shadcn/tooltip";

import type { ReactNode } from "react";
import type { Message } from "~/hooks/use-chat";

type Props = {
  message: Message;
  isStreaming: boolean;
  canRegenerate: boolean;
  onRegenerate: () => void;
};

function ActionButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={<Button variant="ghost" size="icon-sm" aria-label={label} onClick={onClick} />}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function ChatMessage({ message, isStreaming, canRegenerate, onRegenerate }: Props) {
  const { role, content, error, meta } = message;
  const [copied, setCopied] = useState(false);
  const [openSource, setOpenSource] = useState<string | null>(null);

  if (role === "user") {
    return (
      <article className="flex max-w-[85%] flex-col items-end self-end text-sm">
        <div className="rounded-2xl rounded-br-sm bg-muted px-3.5 py-2 break-words whitespace-pre-wrap">
          {content}
        </div>
      </article>
    );
  }

  // Citations are only checked against the reply's sources once the reply is complete.
  const known = isStreaming ? undefined : meta?.sources;
  const cited = known ? citedSources(content, known) : [];
  const chips = cited.length > 0 ? cited : (known ?? []);
  const titles = Object.fromEntries(
    (meta?.sources ?? []).map(({ source, title }) => [source, title]),
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch {
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <article className="group flex gap-3 text-sm">
      <Avatar size="sm">
        <AvatarFallback className="bg-primary/10 text-primary">
          <Sparkles className="size-3.5" />
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col">
        {content && (
          <Markdown isStreaming={isStreaming} citations={{ titles, onOpen: setOpenSource }}>
            {linkCitations(content, known, isStreaming)}
          </Markdown>
        )}
        {chips.length > 0 && (
          <SourceChips sources={chips} numbered={cited.length > 0} onOpen={setOpenSource} />
        )}
        <DocumentDialog source={openSource} onClose={() => setOpenSource(null)} />
        {isStreaming && !content && !error && (
          <output className="block space-y-2 pt-1.5" aria-label="Thinking">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3.5 w-1/2" />
          </output>
        )}
        {error && <p className="text-destructive">{error}</p>}
        {!isStreaming && (content || error) && (
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {meta &&
                `${meta.model} · ${meta.totalTokens} tokens · ${(meta.latencyMs / 1000).toFixed(1)}s`}
            </p>
            <div
              className={cn(
                "flex items-center gap-0.5 transition-opacity",
                "sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100",
              )}
            >
              {content && (
                <ActionButton label={copied ? "Copied" : "Copy"} onClick={() => void copy()}>
                  {copied ? <Check /> : <Copy />}
                </ActionButton>
              )}
              {canRegenerate && (
                <ActionButton label="Regenerate" onClick={onRegenerate}>
                  <RefreshCw />
                </ActionButton>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
