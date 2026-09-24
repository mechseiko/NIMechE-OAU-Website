import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "primary" | "secondary" | "accent" | "danger" | "success" | "neutral";

const tones: Record<Tone, string> = {
  primary: "bg-primary-soft text-primary-dark border-primary/20",
  secondary: "bg-secondary-soft text-secondary-dark border-secondary/25",
  accent: "bg-accent-soft text-accent-dark border-accent/30",
  danger: "bg-danger-soft text-danger border-danger/25",
  success: "bg-success-soft text-success border-success/25",
  neutral: "bg-surface-sunken text-ink-soft border-line",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): Tone {
  switch (status) {
    case "active":
    case "paid":
    case "completed":
    case "published":
      return "success";
    case "scheduled":
    case "pending":
    case "ongoing":
      return "accent";
    case "closed":
    case "unpaid":
    case "draft":
      return "neutral";
    case "proposed":
      return "secondary";
    default:
      return "neutral";
  }
}
