import { CalendarDays, Globe, House, KeyRound } from "lucide-react";

const SUGGESTIONS = [
  {
    icon: CalendarDays,
    title: "Annual leave",
    hint: "Entitlement and carry-forward",
    question: "How many days of annual leave do I get, and can I carry them forward?",
  },
  {
    icon: House,
    title: "Work from home",
    hint: "Current WFH guidelines",
    question: "What is the work from home policy?",
  },
  {
    icon: Globe,
    title: "VPN access",
    hint: "Reach internal tools remotely",
    question: "How do I connect to the VPN?",
  },
  {
    icon: KeyRound,
    title: "Passwords and MFA",
    hint: "Rules for logging in",
    question: "What are the password and MFA rules?",
  },
];

export function EmptyState({ onPick }: { onPick: (question: string) => void }) {
  return (
    <div className="m-auto flex w-full flex-col items-center gap-8 py-8">
      <div className="space-y-2 text-center">
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          How can I help you today?
        </h2>
        <p className="text-sm text-muted-foreground">Ask me anything about Acme HR or IT.</p>
      </div>
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
        {SUGGESTIONS.map(({ icon: Icon, title, hint, question }) => (
          <button
            key={title}
            type="button"
            onClick={() => onPick(question)}
            className="flex flex-col items-start gap-3 rounded-xl border bg-card p-4 text-left transition-colors outline-none hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <Icon className="size-5 text-primary" />
            <span>
              <span className="block text-sm font-medium">{title}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
