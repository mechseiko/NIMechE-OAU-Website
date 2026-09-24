import { Loader2, Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Spinner({ label = "Loading", className }: { label?: string; className?: string }) {
  return (
    <div role="status" aria-label={label} className={cn("flex items-center justify-center gap-2 py-10 text-ink-muted", className)}>
      <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden />
      <span className="text-sm">{label}…</span>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-lg bg-surface-sunken", className)} />;
}

export function CardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  message,
  action,
  icon,
}: {
  title: string;
  message?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-line bg-surface-subtle px-6 py-14 text-center">
      <span className="rounded-full bg-surface p-3 text-ink-muted shadow-card">
        {icon ?? <Inbox className="h-6 w-6" aria-hidden />}
      </span>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {message && <p className="max-w-md text-sm text-ink-muted">{message}</p>}
      {action}
    </div>
  );
}

export function SectionHeading({
  kicker,
  title,
  description,
  align = "left",
  action,
}: {
  kicker?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  action?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {kicker && <p className="section-kicker mb-1">{kicker}</p>}
        <h2 className="section-title text-balance">{title}</h2>
        {description && <p className="mt-2 text-sm text-ink-muted md:text-base">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  kicker,
  title,
  description,
  children,
}: {
  kicker?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden bg-primary text-primary-foreground">
      <div className="gear-pattern absolute inset-0" aria-hidden />
      <div
        className="absolute -right-24 -top-24 h-72 w-72 rounded-full border-[26px] border-secondary/30"
        aria-hidden
      />
      <div className="container-page relative py-14 md:py-20">
        {kicker && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">{kicker}</p>}
        <h1 className="max-w-3xl text-3xl font-bold text-balance md:text-5xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-sm text-primary-foreground/85 md:text-base">{description}</p>}
        {children}
      </div>
    </header>
  );
}
