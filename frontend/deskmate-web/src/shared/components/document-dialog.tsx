import { useQuery } from "@tanstack/react-query";

import { fetchDocument } from "~/lib/api";

import { Markdown } from "~/shared/components/markdown";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/shared/shadcn/dialog";
import { Skeleton } from "~/shared/shadcn/skeleton";

type Props = { source: string | null; onClose: () => void };

export function DocumentDialog({ source, onClose }: Props) {
  const doc = useQuery({
    queryKey: ["document", source],
    queryFn: ({ signal }) => fetchDocument(source!, signal),
    enabled: source !== null,
  });

  return (
    <Dialog open={source !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] grid-rows-[auto_1fr] overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{doc.data?.title ?? source}</DialogTitle>
          <DialogDescription>{source}</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto pr-1">
          {doc.isPending && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          )}
          {doc.isError && <p className="text-destructive">{doc.error.message}</p>}
          {doc.data && <Markdown isStreaming={false}>{doc.data.content}</Markdown>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
