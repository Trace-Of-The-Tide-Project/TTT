"use client";

import { createElement, isValidElement, type ComponentType, type ReactNode } from "react";
import { SpringCard } from "@/components/motion/SpringCard";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";

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

// All metric icons use the original gold accent (tone prop kept for compat).
const TONE_ACCENT: Record<StatTone, string> = {
  sea: "var(--tott-dash-gold-text)",
  seafoam: "var(--tott-dash-gold-text)",
  amber: "var(--tott-dash-gold-text)",
  coral: "var(--tott-dash-gold-text)",
};

function renderStatIcon(icon: StatCardProps["icon"]): ReactNode {
  if (isValidElement(icon)) return icon;
  if (typeof icon === "function") return createElement(icon as ComponentType);
  return icon;
}

export function StatCard({ icon, value, label, tone = "sea", trend }: StatCardProps) {
  const accent = TONE_ACCENT[tone];
  return (
    <SpringCard className="relative flex flex-col items-center gap-2 px-4 py-7">
      <ChamferedFrame />
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
