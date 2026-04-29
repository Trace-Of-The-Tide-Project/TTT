"use client";

import { createElement, isValidElement, type ComponentType, type ReactNode } from "react";
import { SpringCard } from "@/components/motion/SpringCard";

export type StatTone = "sea" | "seafoam" | "amber" | "coral";

type StatCardProps = {
  icon: ReactNode | ComponentType;
  value: string | number;
  label: string;
  tone?: StatTone;
  trend?: {
    value: string;
    direction: "up" | "down";
    comparison: string;
  };
};

// All four metric icons share a soft sea-blue per the spec — tone is kept as
// a prop for future flexibility but currently routes everything through one
// cohesive accent.
const TONE_ACCENT: Record<StatTone, string> = {
  sea: "var(--tott-sea-mid)",
  seafoam: "var(--tott-sea-mid)",
  amber: "var(--tott-sea-mid)",
  coral: "var(--tott-sea-mid)",
};

function renderStatIcon(icon: StatCardProps["icon"]): ReactNode {
  if (isValidElement(icon)) return icon;
  if (typeof icon === "function") return createElement(icon as ComponentType);
  return icon;
}

export function StatCard({ icon, value, label, tone = "sea", trend }: StatCardProps) {
  const accent = TONE_ACCENT[tone];
  return (
    <SpringCard className="relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-5 py-6 shadow-[0_1px_2px_rgba(22,36,58,0.04),0_4px_16px_rgba(22,36,58,0.04)]">
      {/* warm sand wash at bottom for the gradient feel from the mockup */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-12"
        style={{
          background:
            "linear-gradient(to bottom, transparent, color-mix(in srgb, var(--tott-amber-soft) 40%, transparent))",
        }}
      />

      <span className="relative flex h-11 w-11 items-center justify-center" style={{ color: accent }}>
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 44 44" fill="none">
          <path
            d="M22 2L40 12.5V31.5L22 42L4 31.5V12.5Z"
            fill="var(--tott-dash-icon-bg)"
            stroke="currentColor"
            strokeOpacity="0.5"
            strokeWidth="1.25"
          />
        </svg>
        <span className="relative flex items-center justify-center">{renderStatIcon(icon)}</span>
      </span>

      <span className="relative text-[11px] font-medium tracking-wide text-[var(--tott-muted)]">
        {label}
      </span>
      <span className="relative text-3xl font-bold tracking-tight text-foreground">{value}</span>
      {trend && (
        <span
          className="relative inline-flex items-center gap-1 text-[11px] font-medium"
          style={{
            color:
              trend.direction === "up"
                ? "var(--tott-dash-positive)"
                : "var(--tott-dash-negative)",
          }}
        >
          {trend.direction === "up" ? "↗" : "↘"} {trend.value}
          <span className="text-[var(--tott-muted)] opacity-75">{trend.comparison}</span>
        </span>
      )}
    </SpringCard>
  );
}
