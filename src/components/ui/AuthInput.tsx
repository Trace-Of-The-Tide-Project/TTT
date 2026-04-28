"use client";

import type { InputHTMLAttributes } from "react";

type NativeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "name" | "type" | "placeholder" | "className"
>;

type AuthInputProps = NativeInputProps & {
  id: string;
  name: string;
  type?: "text" | "email" | "password" | "tel";
  /** Field label rendered above the input. Pass an empty string to hide. */
  label: string;
  placeholder: string;
  /** Icon shown on the leading edge of the input. */
  icon: React.ReactNode;
  /** Slot rendered on the trailing edge (e.g. password show/hide button). */
  rightSlot?: React.ReactNode;
  /** Optional element shown to the right of the label (e.g. "Forgot password?"). */
  labelRight?: React.ReactNode;
  /** Override the default input class. Rare. */
  inputClassName?: string;
};

/**
 * Standard auth-form text input. Owns layout (icon, label, optional right-slot)
 * but stays a controlled-or-uncontrolled native `<input>` underneath.
 */
export function AuthInput({
  id,
  name,
  type = "text",
  label,
  placeholder,
  icon,
  rightSlot,
  labelRight,
  inputClassName,
  ...rest
}: AuthInputProps) {
  const paddingRight = rightSlot ? "pr-11" : "pr-3";
  const baseClass = [
    "w-full rounded-md py-2 pl-10 text-sm text-foreground",
    "border bg-[color:var(--tott-auth-input-bg)]",
    "border-[color:var(--tott-auth-input-border)]",
    "placeholder:text-[color:var(--tott-auth-input-placeholder)]",
    "transition-[background-color,border-color,box-shadow] duration-200 ease-out",
    "hover:bg-[color:var(--tott-auth-input-hover)]",
    "focus:bg-[color:var(--tott-auth-input-hover)] focus:outline-none focus:ring-0",
    "focus:border-[#CBA158]/55 focus:shadow-[inset_0_0_0_1px_rgba(203,161,88,0.12)]",
    paddingRight,
  ].join(" ");

  return (
    <div className="space-y-1">
      {(label || labelRight) && (
        <div className="flex items-center justify-between">
          {label ? (
            <label htmlFor={id} className="text-sm font-medium text-foreground">
              {label}
            </label>
          ) : (
            <span />
          )}
          {labelRight}
        </div>
      )}
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--tott-auth-input-icon)]">
          {icon}
        </span>
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          className={inputClassName ?? baseClass}
          {...rest}
        />
        {rightSlot ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
        ) : null}
      </div>
    </div>
  );
}
