"use client";

import type { ReactNode } from "react";

export const settingsCardClass =
  "rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)]/50 p-6 sm:p-8";

type SettingsToggleProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  id?: string;
  /** Accessible label (visually hidden title is often separate) */
  "aria-label": string;
};

export function SettingsToggle({ checked, onChange, id, "aria-label": ariaLabel }: SettingsToggleProps) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tott-accent-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--tott-dash-surface-inset)] ${
        checked ? "bg-[var(--tott-accent-gold)]" : "bg-[var(--tott-dash-control-bg)]"
      }`}
    >
      <span
        className={`pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition-[left] duration-200 ease-out ${
          checked ? "left-[calc(100%-1.25rem-0.25rem)]" : "left-1"
        }`}
        aria-hidden
      />
    </button>
  );
}

type SettingsRowProps = {
  title: string;
  description: string;
  control: ReactNode;
  showDivider?: boolean;
};

export function SettingsRow({ title, description, control, showDivider = true }: SettingsRowProps) {
  return (
    <div
      className={`flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 ${
        showDivider ? "border-b border-[var(--tott-card-border)] last:border-b-0" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-sm text-[var(--tott-muted)]">{description}</p>
      </div>
      <div className="flex shrink-0 justify-end sm:justify-start">{control}</div>
    </div>
  );
}
