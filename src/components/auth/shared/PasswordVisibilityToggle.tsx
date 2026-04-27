"use client";

import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";

type PasswordVisibilityToggleProps = {
  visible: boolean;
  onToggle: () => void;
  showLabel: string;
  hideLabel: string;
};

/**
 * Right-slot icon-button for an `AuthInput` to show or hide a password field.
 * Pure presentational — owners hold their own boolean state.
 */
export function PasswordVisibilityToggle({
  visible,
  onToggle,
  showLabel,
  hideLabel,
}: PasswordVisibilityToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="text-neutral-500 transition-colors hover:text-foreground"
      aria-label={visible ? hideLabel : showLabel}
      aria-pressed={visible}
    >
      {visible ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  );
}
