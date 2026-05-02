"use client";

export type FilterOption = {
  id: string;
  label: string;
};

type CreatePageFiltersProps = {
  options: FilterOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  /** Kept for prop-stability — both variants now share the gold-outline chip design. */
  variant?: "filled" | "outlined";
};

/**
 * Filter chips per the Figma create-page header: rounded-lg pills.
 * Selected → gold border + gold text + transparent bg.
 * Unselected → muted border + dash-control bg + muted text.
 * All colors come from theme tokens.
 */
export function CreatePageFilters({
  options,
  selectedId,
  onSelect,
}: CreatePageFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.map((opt) => {
        const isSelected = opt.id === selectedId;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            aria-pressed={isSelected}
            className={`whitespace-nowrap rounded-lg border px-4 py-1.5 text-sm font-medium transition-colors ${
              isSelected
                ? "border-[color:var(--tott-accent-gold)] bg-transparent text-[color:var(--tott-accent-gold)]"
                : "border-[color:var(--tott-card-border)] bg-[color:var(--tott-dash-control-bg)] text-[color:var(--tott-muted)] hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
