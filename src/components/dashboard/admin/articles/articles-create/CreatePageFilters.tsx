"use client";

export type FilterOption = {
  id: string;
  label: string;
};

type CreatePageFiltersProps = {
  options: FilterOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  /** "filled" = gold fill (admin default). "outlined" = gold border + text (profile). */
  variant?: "filled" | "outlined";
};

export function CreatePageFilters({
  options,
  selectedId,
  onSelect,
  variant = "filled",
}: CreatePageFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {options.map((opt) => {
        const isSelected = opt.id === selectedId;

        let selectedClass: string;
        let selectedStyle: React.CSSProperties | undefined;

        if (variant === "outlined") {
          selectedClass = isSelected
            ? "border border-[#CBA158] text-[#CBA158] bg-transparent"
            : "border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] text-gray-400 hover:border-gray-500 hover:text-foreground";
          selectedStyle = undefined;
        } else {
          selectedClass = isSelected
            ? "border-transparent text-[#1a1a1a]"
            : "border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] text-gray-300 hover:border-gray-500 hover:text-foreground";
          selectedStyle = isSelected ? { backgroundColor: "#C9A96E" } : undefined;
        }

        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onSelect(opt.id)}
            className={`whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${selectedClass}`}
            style={selectedStyle}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
