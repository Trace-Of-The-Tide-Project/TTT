"use client";

import type { ReactNode } from "react";

export type SegmentedControlOption<TId extends string = string> = {
  id: TId;
  label: ReactNode;
};

type SegmentedControlProps<TId extends string = string> = {
  options: readonly SegmentedControlOption<TId>[];
  value: TId;
  onChange: (id: TId) => void;
  className?: string;
  /** Accessible label for the tablist. */
  ariaLabel?: string;
};

/**
 * Rounded segmented control matching the design SVG: outer pill bg
 * (`--tott-elevated`), active inner pill bg (`--tott-dash-control-bg`)
 * with white/foreground text, inactive labels in muted gray. Theme-aware.
 */
export function SegmentedControl<TId extends string = string>({
  options,
  value,
  onChange,
  className,
  ariaLabel,
}: SegmentedControlProps<TId>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`flex w-full gap-1 rounded-xl bg-[var(--tott-elevated)] p-1 ${className ?? ""}`}
    >
      {options.map((opt) => {
        const isActive = opt.id === value;
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(opt.id)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-[var(--tott-dash-control-bg)] text-foreground"
                : "bg-transparent text-[var(--tott-tab-inactive)] hover:text-[var(--tott-tab-inactive-hover)]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
