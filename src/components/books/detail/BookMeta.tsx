"use client";

import { Link } from "@/i18n/navigation";
import { ChevronRightIcon } from "@/components/ui/icons";

const CHIP_CHAMFER =
  "polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)";

export const DATA_VALUE_STYLE = {
  fontFamily: "'Inter', var(--font-sans, sans-serif)",
  fontWeight: 500,
  fontSize: "12px",
  lineHeight: "16px",
  color: "var(--tott-home-text-strong)",
} as const;

export function BreadcrumbHomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        d="M15.8334 7.25879L11.3892 3.80213C10.9992 3.49872 10.5192 3.33398 10.0251 3.33398C9.53093 3.33398 9.05091 3.49872 8.6609 3.80213L4.2159 7.25879C3.94877 7.46653 3.73264 7.73256 3.58403 8.03658C3.43541 8.3406 3.35824 8.67456 3.3584 9.01296V15.013C3.3584 15.455 3.53399 15.8789 3.84655 16.1915C4.15911 16.504 4.58304 16.6796 5.02507 16.6796H15.0251C15.4671 16.6796 15.891 16.504 16.2036 16.1915C16.5161 15.8789 16.6917 15.455 16.6917 15.013V9.01296C16.6917 8.32713 16.3751 7.67963 15.8334 7.25879Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BreadcrumbChevron() {
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center [&>svg]:h-4 [&>svg]:w-4"
      style={{ width: "16px", height: "20px", color: "var(--tott-home-text-muted)", opacity: 0.7 }}
    >
      <ChevronRightIcon />
    </span>
  );
}

export function DataRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center" style={{ padding: "2px 0", gap: "8px" }}>
      <span
        style={{
          width: "128px",
          flexShrink: 0,
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 500,
          fontSize: "12px",
          lineHeight: "16px",
          color: "var(--tott-home-text-muted)",
          textShadow: "var(--tott-home-text-shadow)",
        }}
      >
        {label}
      </span>
      <span className="flex min-w-0 items-center" style={{ gap: "8px" }}>
        {children}
      </span>
    </div>
  );
}

export function CategoryChip({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center justify-center capitalize"
      style={{
        minWidth: "76px",
        height: "24px",
        padding: "4px 10px",
        backgroundColor: "var(--tott-dash-gold-text)",
        color: "var(--tott-auth-btn-text)",
        fontFamily: "'Inter', var(--font-sans, sans-serif)",
        fontWeight: 500,
        fontSize: "12px",
        lineHeight: "16px",
        boxShadow: "inset 0px 1px 1px rgba(255, 255, 255, 0.04)",
        clipPath: CHIP_CHAMFER,
        WebkitClipPath: CHIP_CHAMFER,
      }}
    >
      {label}
    </span>
  );
}

export function AvatarCircle({ initial }: { initial: string }) {
  return (
    <span
      aria-hidden
      className="flex shrink-0 items-center justify-center rounded-full"
      style={{
        width: "20px",
        height: "20px",
        backgroundColor: "var(--tott-dash-gold-text)",
        fontFamily: "'Inter', var(--font-sans, sans-serif)",
        fontWeight: 500,
        fontSize: "10px",
        lineHeight: "12px",
        color: "var(--tott-auth-btn-text)",
      }}
    >
      {initial.charAt(0).toUpperCase() || "A"}
    </span>
  );
}

export function AvatarStack({ initials }: { initials: string[] }) {
  return (
    <span aria-hidden className="inline-flex items-center" style={{ marginInlineStart: "4px" }}>
      {initials.map((s, i) => (
        <span
          key={`${s}-${i}`}
          className="flex shrink-0 items-center justify-center rounded-full"
          style={{
            width: "20px",
            height: "20px",
            marginInline: "0 -4px",
            backgroundColor: "var(--tott-dash-gold-text)",
            color: "var(--tott-auth-btn-text)",
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "10px",
            lineHeight: "12px",
            boxShadow: "0 0 0 2px var(--tott-home-surface)",
          }}
        >
          {s.charAt(0).toUpperCase() || "A"}
        </span>
      ))}
    </span>
  );
}

export function formatCoAuthors(raw: string): string {
  const all = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (all.length === 0) return "";
  const head = all.slice(0, 3).join(", ");
  const extra = all.length - 3;
  return extra > 0 ? `${head} +${extra}` : head;
}

export function BookDetailBreadcrumb({
  bookTitle,
  bookCategory,
  breadcrumbBooks,
}: {
  bookTitle: string;
  bookCategory: string;
  breadcrumbBooks: string;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center"
      style={{
        height: "56px",
        padding: "0 20px",
        gap: "12px",
        backgroundColor: "var(--tott-panel-bg)",
        border: "1px solid var(--tott-card-border)",
        borderRadius: "12px",
      }}
    >
      <Link
        href="/"
        aria-label="Home"
        className="inline-flex items-center justify-center transition-opacity hover:opacity-80 [&>svg]:h-5 [&>svg]:w-5"
        style={{ width: "20px", height: "20px", color: "var(--tott-home-text-muted)" }}
      >
        <BreadcrumbHomeIcon />
      </Link>
      <Link
        href="/books"
        style={{
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "20px",
          letterSpacing: "-0.005em",
          color: "var(--tott-home-text-muted)",
        }}
        className="transition-opacity hover:opacity-80"
      >
        {breadcrumbBooks}
      </Link>
      {bookCategory ? (
        <>
          <BreadcrumbChevron />
          <Link
            href="/books"
            className="capitalize transition-opacity hover:opacity-80"
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.005em",
              color: "var(--tott-home-text-muted)",
            }}
          >
            {bookCategory}
          </Link>
        </>
      ) : null}
      <BreadcrumbChevron />
      <span
        className="line-clamp-1 min-w-0"
        style={{
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 500,
          fontSize: "14px",
          lineHeight: "20px",
          letterSpacing: "-0.005em",
          color: "var(--tott-home-text-strong)",
        }}
      >
        {bookTitle}
      </span>
    </nav>
  );
}
