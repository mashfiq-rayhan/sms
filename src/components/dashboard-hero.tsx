import type { LucideIcon } from "lucide-react";

export function DashboardHero({
  icon: Icon,
  eyebrow,
  title,
  description,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative isolate overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-8 shadow-lg shadow-black/20 backdrop-blur-xl sm:px-10 sm:py-10">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
      />
      <div
        aria-hidden
        className="absolute -top-24 -right-16 size-64 rounded-full bg-primary/25 blur-[90px]"
      />
      <div
        aria-hidden
        className="absolute -bottom-24 left-1/4 size-56 rounded-full bg-[var(--chart-2)]/15 blur-[90px]"
      />
      <Icon aria-hidden className="absolute -right-4 -bottom-6 size-36 text-primary/10" />
      <p className="relative text-sm font-medium tracking-wide text-primary uppercase">{eyebrow}</p>
      <h1 className="relative mt-1 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="relative mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">{description}</p>
    </div>
  );
}
