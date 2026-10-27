import { Plus, Sparkles } from "lucide-react";

import { cn } from "~/lib/utils";

import { ThemeToggle } from "~/shared/components/theme-toggle";
import { Badge } from "~/shared/shadcn/badge";
import { Button } from "~/shared/shadcn/button";

type Props = {
  status: "online" | "offline" | "checking";
  canReset: boolean;
  onReset: () => void;
};

const STATUS_LABEL = { online: "API online", offline: "API offline", checking: "Checking API" };

export function ChatHeader({ status, canReset, onReset }: Props) {
  return (
    <header className="flex items-center justify-between border-b py-4">
      <div className="flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Sparkles className="size-4" />
        </div>
        <h1 className="font-heading text-lg font-semibold tracking-tight">Deskmate</h1>
        <Badge variant="outline" className="hidden sm:inline-flex">
          <span
            className={cn(
              "size-1.5 rounded-full",
              status === "online" && "bg-emerald-500",
              status === "offline" && "bg-destructive",
              status === "checking" && "bg-muted-foreground/40",
            )}
          />
          {STATUS_LABEL[status]}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="outline" onClick={onReset} disabled={!canReset}>
          <Plus />
          New chat
        </Button>
      </div>
    </header>
  );
}
