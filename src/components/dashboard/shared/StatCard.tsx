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

const TONE_STYLES: Record<StatTone, { iconBg: string; iconFg: string }> = {
  sea: { iconBg: "var(--tott-sea-soft)", iconFg: "var(--tott-sea-deep)" },
  seafoam: { iconBg: "var(--tott-seafoam-soft)", iconFg: "var(--tott-seafoam)" },
  amber: { iconBg: "var(--tott-amber-soft)", iconFg: "var(--tott-amber-warm)" },
  coral: { iconBg: "var(--tott-coral-soft)", iconFg: "var(--tott-coral)" },
};

function renderStatIcon(icon: StatCardProps["icon"]): ReactNode {
  if (isValidElement(icon)) return icon;
  if (typeof icon === "function") return createElement(icon as ComponentType);
  return icon;
}

export function StatCard({ icon, value, label, tone = "sea", trend }: StatCardProps) {
  const palette = TONE_STYLES[tone];
  return (
    <SpringCard className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-5 py-6 shadow-[0_1px_2px_rgba(22,36,58,0.04),0_4px_16px_rgba(22,36,58,0.04)]">
      <span
        className="flex h-12 w-12 items-center justify-center rounded-full"
        style={{ backgroundColor: palette.iconBg, color: palette.iconFg }}
      >
        {renderStatIcon(icon)}
      </span>
      <span className="text-xs font-medium tracking-wide text-[var(--tott-muted)] uppercase">{label}</span>
      <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
      {trend && (
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold"
            style={{
              backgroundColor:
                trend.direction === "up"
                  ? "color-mix(in srgb, var(--tott-dash-positive) 14%, transparent)"
                  : "color-mix(in srgb, var(--tott-dash-negative) 14%, transparent)",
              color:
                trend.direction === "up"
                  ? "var(--tott-dash-positive)"
                  : "var(--tott-dash-negative)",
            }}
          >
            {trend.direction === "up" ? "↗" : "↘"} {trend.value}
          </span>
          <span className="text-[var(--tott-muted)] opacity-70">{trend.comparison}</span>
        </div>
      )}
    </SpringCard>
  );
}
