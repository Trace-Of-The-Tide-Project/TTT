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
    "w-full rounded-md bg-[#2A2A2A] py-2.5 pl-10 text-sm text-foreground",
    "border border-transparent placeholder:text-neutral-500",
    "transition-colors duration-150",
    "hover:bg-[#2F2F2F]",
    "focus:bg-[#2F2F2F] focus:border-[#CBA158]/50 focus:outline-none focus:ring-0",
    paddingRight,
  ].join(" ");

  return (
    <div className="space-y-1.5">
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
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
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
