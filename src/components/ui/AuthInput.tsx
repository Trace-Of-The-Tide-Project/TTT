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
 * Auth-form text input. Label + optional `labelRight` share a flex row above
 * the input (`justify-between`), then the input below. Label is always visible
 * — accessibility plus the user requirement that field names sit above each
 * field. Sized for thumb targets on mobile (44px) and refined typography above.
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
    "block w-full rounded-md py-1.5 pl-9 text-[13px] text-foreground min-[500px]:py-2 min-[500px]:pl-10 min-[500px]:text-sm md:py-2",
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
    <div className="w-full">
      {(label || labelRight) ? (
        <div className="mb-1 flex items-center justify-between gap-2 min-[500px]:mb-1.5">
          {label ? (
            <label
              htmlFor={id}
              className="text-[10px] font-medium uppercase tracking-[0.08em] leading-tight text-[color:var(--tott-auth-subtitle)] min-[500px]:text-[11px] sm:text-xs"
            >
              {label}
            </label>
          ) : (
            <span />
          )}
          {labelRight}
        </div>
      ) : null}
      <div className="relative">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[color:var(--tott-auth-input-icon)] min-[500px]:left-3 [&_svg]:h-4 [&_svg]:w-4 min-[500px]:[&_svg]:h-[18px] min-[500px]:[&_svg]:w-[18px]">
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
