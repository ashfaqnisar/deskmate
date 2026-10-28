import { FileText } from "lucide-react";

import { Button } from "~/shared/shadcn/button";

import type { Source } from "@deskmate/shared";

type Props = { sources: Source[]; numbered: boolean; onOpen: (source: string) => void };

// The documents behind a reply. When the text cites them, the numbers match the badges in the text.
export function SourceChips({ sources, numbered, onOpen }: Props) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-muted-foreground">Sources</span>
      {sources.map(({ source, title, section }, index) => (
        <Button
          key={source}
          variant="outline"
          size="sm"
          title={`${title} · ${section}`}
          onClick={() => onOpen(source)}
        >
          {numbered ? (
            <span className="text-muted-foreground tabular-nums">{index + 1}</span>
          ) : (
            <FileText />
          )}
          {title}
        </Button>
      ))}
    </div>
  );
}
