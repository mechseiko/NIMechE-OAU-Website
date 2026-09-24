"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

export function Tabs({
  items,
  active,
  onChange,
  className,
}: {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div role="tablist" aria-label="Sections" className={cn("flex gap-1 overflow-x-auto rounded-xl bg-surface-sunken p-1", className)}>
      {items.map((item) => (
        <button
          key={item.id}
          role="tab"
          aria-selected={active === item.id}
          onClick={() => onChange(item.id)}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
            active === item.id
              ? "bg-surface text-primary shadow-card"
              : "text-ink-muted hover:text-ink",
          )}
        >
          {item.icon}
          {item.label}
          {typeof item.count === "number" && (
            <span className="rounded-full bg-surface-sunken px-1.5 py-0.5 text-[10px] font-bold text-ink-muted">
              {item.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
