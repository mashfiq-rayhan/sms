import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TONES = {
  indigo: {
    chip: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    glow: "hover:shadow-indigo-500/15",
    ring: "hover:ring-indigo-500/20",
  },
  emerald: {
    chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    glow: "hover:shadow-emerald-500/15",
    ring: "hover:ring-emerald-500/20",
  },
  amber: {
    chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    glow: "hover:shadow-amber-500/15",
    ring: "hover:ring-amber-500/20",
  },
  rose: {
    chip: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    glow: "hover:shadow-rose-500/15",
    ring: "hover:ring-rose-500/20",
  },
  violet: {
    chip: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    glow: "hover:shadow-violet-500/15",
    ring: "hover:ring-violet-500/20",
  },
} as const;

export function StatCard({
  icon: Icon,
  label,
  value,
  tone = "indigo",
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  tone?: keyof typeof TONES;
}) {
  const t = TONES[tone];
  return (
    <Card className={cn("hover:-translate-y-0.5 hover:ring-1", t.glow, t.ring)}>
      <CardHeader className="flex flex-row items-center gap-3 space-y-0">
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", t.chip)}>
          <Icon className="size-4.5" />
        </span>
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="text-3xl font-semibold tracking-tight">{value}</CardContent>
    </Card>
  );
}
