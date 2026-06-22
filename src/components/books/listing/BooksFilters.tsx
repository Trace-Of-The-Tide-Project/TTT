"use client";

import { ChevronDownIcon } from "@/components/ui/icons";

const ROW_TEXT_STYLE = {
  fontFamily: "'Inter', var(--font-sans, sans-serif)",
  fontWeight: 400,
  fontSize: "14px",
  lineHeight: "20px",
  letterSpacing: "-0.005em",
  color: "var(--tott-home-text-strong)",
} as const;

export function SidebarHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="mt-6"
      style={{ fontFamily: "'Inter', var(--font-sans, sans-serif)", fontWeight: 500, fontSize: "14px", lineHeight: "20px", letterSpacing: "-0.005em", color: "var(--tott-home-text-strong)" }}
    >
      {children}
    </h3>
  );
}

export function RadioRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center" style={{ gap: "8px" }}>
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        aria-hidden
        style={{ border: `1.5px solid ${checked ? "var(--tott-accent-gold)" : "var(--tott-card-border)"}` }}
      >
        {checked ? <span className="rounded-full" style={{ width: "8px", height: "8px", backgroundColor: "var(--tott-accent-gold)" }} /> : null}
      </span>
      <input type="radio" className="sr-only" checked={checked} onChange={onChange} />
      <span style={ROW_TEXT_STYLE}>{label}</span>
    </label>
  );
}

export function CheckboxRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center" style={{ gap: "8px" }}>
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center"
        aria-hidden
        style={{
          border: `1.5px solid ${checked ? "var(--tott-accent-gold)" : "var(--tott-card-border)"}`,
          backgroundColor: checked ? "var(--tott-accent-gold)" : "transparent",
          borderRadius: "4px",
          color: "var(--tott-auth-btn-text)",
        }}
      >
        {checked ? (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="2 6 5 9 10 3" />
          </svg>
        ) : null}
      </span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <span style={ROW_TEXT_STYLE}>{label}</span>
    </label>
  );
}

export function PriceInput({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div
      className="flex h-10 min-w-0 flex-1 items-center"
      style={{ backgroundColor: "var(--tott-panel-bg)", border: "1px solid var(--tott-card-border)", borderRadius: "8px", padding: "8px", gap: "4px" }}
    >
      <span aria-hidden style={{ color: "var(--tott-home-text-muted)", fontSize: "14px" }}>{placeholder}</span>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent outline-none focus:outline-none focus:ring-0"
        style={{ fontFamily: "'Inter', var(--font-sans, sans-serif)", fontWeight: 400, fontSize: "14px", lineHeight: "20px", letterSpacing: "-0.005em", color: "var(--tott-home-text-strong)", minWidth: 0, border: "none", boxShadow: "none", padding: 0, appearance: "none", WebkitAppearance: "none", MozAppearance: "textfield" }}
      />
    </div>
  );
}

export function RatingSelect({ value, onChange, labels }: {
  value: number;
  onChange: (v: number) => void;
  labels: { any: string; r1: string; r2: string; r3: string; r4: string };
}) {
  return (
    <div
      className="relative mt-2 flex h-10 items-center"
      style={{ backgroundColor: "var(--tott-panel-bg)", border: "1px solid var(--tott-card-border)", borderRadius: "8px", padding: "8px" }}
    >
      <select
        value={String(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-transparent pr-7 outline-none focus:outline-none focus:ring-0"
        style={{ fontFamily: "'Inter', var(--font-sans, sans-serif)", fontWeight: 400, fontSize: "14px", lineHeight: "20px", letterSpacing: "-0.005em", color: "var(--tott-home-text-strong)", border: "none", boxShadow: "none", padding: 0, appearance: "none", WebkitAppearance: "none", MozAppearance: "none", backgroundImage: "none" }}
      >
        <option value="0">{labels.any}</option>
        <option value="1">{labels.r1}</option>
        <option value="2">{labels.r2}</option>
        <option value="3">{labels.r3}</option>
        <option value="4">{labels.r4}</option>
      </select>
      <span aria-hidden className="pointer-events-none absolute right-2 [&>svg]:h-5 [&>svg]:w-5" style={{ color: "var(--tott-home-text-muted)" }}>
        <ChevronDownIcon />
      </span>
    </div>
  );
}
