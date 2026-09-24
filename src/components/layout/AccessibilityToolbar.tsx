"use client";

import { useState } from "react";
import {
  Accessibility,
  Contrast,
  Link2,
  Minus,
  Motion,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { useA11y } from "@/context/A11yProvider";
import { cn } from "@/lib/utils";

export function AccessibilityToolbar() {
  const [open, setOpen] = useState(false);
  const a11y = useA11y();

  return (
    <div className="fixed bottom-4 left-4 z-[70] no-print">
      {open && (
        <div
          role="region"
          aria-label="Accessibility options"
          className="mb-2 w-64 rounded-xl border border-line bg-surface p-4 shadow-lift animate-fade-up"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink">Accessibility</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close accessibility options"
              className="rounded p-1 text-ink-muted hover:text-ink"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <p className="mb-1.5 text-xs font-semibold text-ink-muted">Text size</p>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={a11y.decreaseFont}
                  aria-label="Decrease text size"
                  className="flex h-9 flex-1 items-center justify-center rounded-lg border border-line hover:bg-surface-subtle"
                >
                  <Minus className="h-4 w-4" aria-hidden />
                </button>
                <span className="flex h-9 w-14 items-center justify-center rounded-lg bg-surface-sunken text-xs font-bold text-ink">
                  {Math.round(a11y.scale)}%
                </span>
                <button
                  type="button"
                  onClick={a11y.increaseFont}
                  aria-label="Increase text size"
                  className="flex h-9 flex-1 items-center justify-center rounded-lg border border-line hover:bg-surface-subtle"
                >
                  <Plus className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={a11y.resetFont}
                  aria-label="Reset text size"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-line hover:bg-surface-subtle"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden />
                </button>
              </div>
            </div>

            <ToggleRow
              label="High contrast"
              icon={<Contrast className="h-4 w-4" aria-hidden />}
              active={a11y.highContrast}
              onClick={a11y.toggleContrast}
            />
            <ToggleRow
              label="Underline all links"
              icon={<Link2 className="h-4 w-4" aria-hidden />}
              active={a11y.underlinedLinks}
              onClick={a11y.toggleLinks}
            />
            <ToggleRow
              label="Reduce motion"
              icon={<Motion className="h-4 w-4" aria-hidden />}
              active={a11y.reducedMotion}
              onClick={a11y.toggleMotion}
            />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label={open ? "Close accessibility options" : "Open accessibility options"}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full shadow-lift transition-colors",
          open ? "bg-ink text-white" : "bg-primary text-primary-foreground hover:bg-primary-dark",
        )}
      >
        <Accessibility className="h-6 w-6" aria-hidden />
      </button>
    </div>
  );
}

function ToggleRow({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary-soft text-primary"
          : "border-line text-ink-soft hover:bg-surface-subtle",
      )}
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
          active ? "bg-primary text-primary-foreground" : "bg-surface-sunken text-ink-muted",
        )}
      >
        {active ? "On" : "Off"}
      </span>
    </button>
  );
}
