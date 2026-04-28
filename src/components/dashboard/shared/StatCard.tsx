"use client";

import { createElement, isValidElement, type ComponentType, type ReactNode } from "react";
import { SpringCard } from "@/components/motion/SpringCard";

type StatCardProps = {
  icon: ReactNode | ComponentType;
  value: string | number;
  label: string;
  trend?: {
    value: string;
    direction: "up" | "down";
    comparison: string;
  };
};

function renderStatIcon(icon: StatCardProps["icon"]): ReactNode {
  if (isValidElement(icon)) return icon;
  if (typeof icon === "function") return createElement(icon as ComponentType);
  return icon;
}

export function StatCard({ icon, value, label, trend }: StatCardProps) {
  return (
    <SpringCard className="flex flex-col items-center gap-2 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-5">
      <span
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--tott-card-border)] bg-[var(--tott-dash-icon-bg)] text-[var(--tott-dash-gold-text)]"
      >
        {renderStatIcon(icon)}
      </span>
      <span className="text-xs text-[var(--tott-muted)]">{label}</span>
      <span className="text-2xl font-bold text-foreground">{value}</span>
      {trend && (
        <div className="flex items-center gap-1 text-xs">
          <span style={{ color: trend.direction === "up" ? "var(--tott-dash-positive)" : "var(--tott-dash-negative)" }}>
            {trend.direction === "up" ? "↗" : "↘"} {trend.value}
          </span>
          <span className="text-[var(--tott-muted)] opacity-60">{trend.comparison}</span>
        </div>
      )}
    </SpringCard>
  );
}
