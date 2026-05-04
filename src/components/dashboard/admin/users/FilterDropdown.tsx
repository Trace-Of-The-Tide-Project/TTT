"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";

type FilterDropdownProps = {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function FilterDropdown({ options, value, onChange, className = "" }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayValue = options.find((o) => o.value === value)?.label ?? value;

  return (
    <div ref={ref} className={`relative w-full min-w-0 sm:w-[180px]${className ? ` ${className}` : ""}`}>
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] py-2.5 px-4 text-left text-sm text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)] focus:border-[var(--tott-muted)] focus:outline-none"
      >
        <span className="truncate">{displayValue}</span>

        <span className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}>
          <ChevronDownIcon />
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] py-1 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)]"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}