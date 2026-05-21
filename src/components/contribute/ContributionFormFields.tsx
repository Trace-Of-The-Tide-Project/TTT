"use client";

import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

// Shared field primitives for the contribution forms (Open Call, Start an Issue).
// These match the Figma spec 1:1 — #262626 fill, #333333 border, 8px radius,
// 40px-tall rows, 20px leading icons. All colors resolve via --tott-* tokens so
// the fields swap cleanly between light and dark themes.
export const FIELD_BG = "var(--tott-elevated)";
export const FIELD_BORDER = "var(--tott-card-border)";
export const FIELD_RADIUS = 8;
export const LABEL_COLOR = "var(--tott-home-text-strong)";
export const HELPER_COLOR = "var(--tott-home-text-muted)";
export const PLACEHOLDER_COLOR = "var(--tott-home-text-muted)";
export const ICON_STROKE = "var(--tott-home-text-muted)";
export const ACCENT = "var(--tott-accent-gold)";
export const ACCENT_TEXT = "var(--tott-auth-btn-text)";

const SANS = "'Inter', var(--font-sans, sans-serif)";

export function Field({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: ReactNode;
}) {
  return (
    <label
      className="flex w-full flex-1 flex-col items-stretch"
      style={{ gap: "8px" }}
    >
      <span
        style={{
          fontFamily: SANS,
          fontWeight: 500,
          fontSize: "14px",
          lineHeight: "20px",
          letterSpacing: "-0.005em",
          color: LABEL_COLOR,
        }}
      >
        {label}
      </span>
      {children}
      {helper ? (
        <span
          style={{
            fontFamily: SANS,
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "16px",
            color: HELPER_COLOR,
          }}
        >
          {helper}
        </span>
      ) : null}
    </label>
  );
}

type FieldInputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: ReactNode;
};

export function FieldInput({ icon, style, ...rest }: FieldInputProps) {
  return (
    <span
      className="flex w-full flex-row items-center"
      style={{
        height: "40px",
        padding: "8px",
        backgroundColor: FIELD_BG,
        border: `1px solid ${FIELD_BORDER}`,
        borderRadius: `${FIELD_RADIUS}px`,
        boxSizing: "border-box",
      }}
    >
      {icon ? <LeadingIcon>{icon}</LeadingIcon> : null}
      <input
        {...rest}
        className="min-w-0 flex-1 bg-transparent focus:outline-none"
        style={{
          padding: "2px 8px",
          color: LABEL_COLOR,
          fontFamily: SANS,
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "20px",
          letterSpacing: "-0.005em",
          border: "none",
          ...(style || {}),
        }}
      />
    </span>
  );
}

type FieldSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  icon?: ReactNode;
  placeholder?: string;
};

export function FieldSelect({
  icon,
  placeholder,
  children,
  value,
  style,
  ...rest
}: FieldSelectProps) {
  const isEmpty = value === "" || value == null;
  return (
    <span
      className="relative flex w-full flex-row items-center"
      style={{
        height: "40px",
        padding: "8px",
        backgroundColor: FIELD_BG,
        border: `1px solid ${FIELD_BORDER}`,
        borderRadius: `${FIELD_RADIUS}px`,
        boxSizing: "border-box",
      }}
    >
      {icon ? <LeadingIcon>{icon}</LeadingIcon> : null}
      <select
        {...rest}
        value={value}
        className="min-w-0 flex-1 bg-transparent focus:outline-none"
        style={{
          padding: "2px 8px",
          color: isEmpty ? PLACEHOLDER_COLOR : LABEL_COLOR,
          fontFamily: SANS,
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "20px",
          letterSpacing: "-0.005em",
          border: "none",
          cursor: "pointer",
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
          backgroundImage: "none",
          ...(style || {}),
        }}
      >
        {placeholder ? (
          <option
            value=""
            style={{ backgroundColor: FIELD_BG, color: PLACEHOLDER_COLOR }}
          >
            {placeholder}
          </option>
        ) : null}
        {children}
      </select>
      <TrailingIcon>
        <ChevronDownGlyph />
      </TrailingIcon>
    </span>
  );
}

type FieldTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function FieldTextarea({ style, ...rest }: FieldTextareaProps) {
  return (
    <div
      className="relative w-full"
      style={{
        backgroundColor: FIELD_BG,
        border: `1px solid ${FIELD_BORDER}`,
        borderRadius: `${FIELD_RADIUS}px`,
      }}
    >
      <textarea
        {...rest}
        className="block w-full resize-y bg-transparent focus:outline-none"
        style={{
          height: "112px",
          padding: "8px 12px",
          color: LABEL_COLOR,
          fontFamily: SANS,
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "20px",
          letterSpacing: "0.005em",
          border: "none",
          borderRadius: `${FIELD_RADIUS}px`,
          ...(style || {}),
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute"
        style={{
          width: "6px",
          height: "6px",
          right: "8px",
          bottom: "8px",
          backgroundColor: "var(--tott-home-text-muted)",
        }}
      />
    </div>
  );
}

export function LeadingIcon({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden
      className="inline-flex items-center justify-center"
      style={{
        width: "28px",
        height: "24px",
        padding: "2px 4px",
        color: ICON_STROKE,
      }}
    >
      {children}
    </span>
  );
}

export function TrailingIcon({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none inline-flex items-center justify-center"
      style={{
        width: "28px",
        height: "24px",
        padding: "2px 4px",
        color: ICON_STROKE,
      }}
    >
      {children}
    </span>
  );
}

// ─── Outlined icons (1.5px stroke, 20×20) ────────────────────────

export function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <polyline points="3 7 12 13 21 7" />
    </svg>
  );
}

export function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function SchoolIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 10l10-5 10 5-10 5L2 10z" />
      <path d="M6 12v5c0 1.5 3 3 6 3s6-1.5 6-3v-5" />
      <line x1="22" y1="10" x2="22" y2="16" />
    </svg>
  );
}

export function ChevronDownGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
