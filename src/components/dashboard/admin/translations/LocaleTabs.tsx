"use client";

/**
 * Locale chip row for editors that keep per-language copy inside one record
 * (home / magazine page editors): switches which locale's fields are being
 * edited. For content where each language is its own row, use
 * `TranslationsPanel` instead.
 */
export function LocaleTabs<L extends string>({
  locales,
  active,
  onChange,
}: {
  locales: readonly L[];
  active: L;
  onChange: (locale: L) => void;
}) {
  return (
    <div className="flex gap-0.5 rounded-lg bg-[var(--tott-elevated)] p-0.5">
      {locales.map((loc) => (
        <button
          key={loc}
          type="button"
          data-testid={`locale-tab-${loc}`}
          data-active={active === loc || undefined}
          onClick={() => onChange(loc)}
          className={`rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
            active === loc
              ? "bg-[var(--tott-dash-surface-inset)] text-foreground shadow-sm"
              : "text-[var(--tott-tab-inactive)] hover:text-foreground"
          }`}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
