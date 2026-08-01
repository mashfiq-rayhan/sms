export function BackgroundDecor() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="absolute -top-40 -left-32 size-[36rem] rounded-full bg-primary/25 blur-[130px]" />
      <div className="absolute top-1/3 -right-40 size-[34rem] rounded-full bg-[var(--chart-2)]/15 blur-[130px]" />
      <div className="absolute -bottom-48 left-1/4 size-[26rem] rounded-full bg-violet-500/10 blur-[120px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--color-border)_1px,transparent_0)] bg-[length:24px_24px] opacity-[0.15]" />
    </div>
  );
}
