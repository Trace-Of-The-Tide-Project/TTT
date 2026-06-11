"use client";

type AuthCheckboxProps = {
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  /** Label content (string or rich nodes such as inline links). */
  children: React.ReactNode;
  className?: string;
};

/**
 * Generic gold-accented checkbox used across auth forms.
 *
 * The visual treatment matches the screen mocks: 16px square box,
 * rounded corners, gold fill (`#CBA158`) when checked, and a foreground
 * label aligned to the top of the box.
 *
 * Use this for "Remember me", "I agree to the terms…", and any other
 * single-line consent / preference toggles inside auth cards.
 */
export function AuthCheckbox({
  id,
  checked,
  onChange,
  children,
  className,
}: AuthCheckboxProps) {
  return (
    <div className={`flex items-start gap-3 ${className ?? ""}`}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 cursor-pointer rounded border-[color:var(--tott-auth-checkbox-border)] bg-transparent text-[color:var(--tott-accent-gold)] focus:ring-[color-mix(in_srgb,var(--tott-accent-gold)_50%,transparent)]"
      />
      <label
        htmlFor={id}
        className="cursor-pointer select-none text-sm text-foreground"
      >
        {children}
      </label>
    </div>
  );
}
