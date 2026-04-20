"use client";

import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";

export type ArticleCardAction = {
  label?: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
};

type ArticleCardProps = {
  icon: ReactNode;
  statusLabel: string;
  title: string;
  subtitle: string;
  views?: string;
  actions: ArticleCardAction[];
  useHexIcon?: boolean;
  compact?: boolean;
};

function HexIcon({ children, size = "md" }: { children: React.ReactNode; size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-10 w-10" : "h-12 w-12";
  const iconScale = size === "sm" ? "scale-80" : "";
  return (
    <div className={`relative flex ${dim} shrink-0 items-center justify-center`}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 48 48" fill="none">
        <path
          d="M24 2L44 14V34L24 46L4 34V14Z"
          fill="var(--tott-dash-icon-bg)"
          stroke="var(--tott-card-border)"
          strokeWidth="1"
        />
      </svg>
      <span className={`relative text-gray-400 ${iconScale}`}>{children}</span>
    </div>
  );
}

const buttonClass =
  "flex items-center justify-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-[var(--tott-dash-surface-inset)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]";

const buttonClassCompact =
  "flex items-center justify-center gap-1.5 rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:bg-[var(--tott-dash-surface-inset)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]";

const iconOnlyButtonClass =
  "flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-icon-bg)] p-3 text-foreground transition-all hover:bg-[var(--tott-dash-surface-inset)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]";

const iconOnlyButtonClassCompact =
  "flex h-9 w-9 items-center justify-center rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-icon-bg)] p-2 text-foreground transition-all hover:bg-[var(--tott-dash-surface-inset)] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]";

export function ArticleCard({
  icon,
  statusLabel,
  title,
  subtitle,
  views,
  actions,
  useHexIcon = false,
  compact = false,
}: ArticleCardProps) {
  const cardClass = compact
    ? "flex flex-col gap-2 rounded-lg border border-[var(--tott-card-border)] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between"
    : "flex flex-col gap-4 rounded-xl border border-[var(--tott-card-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between";
  const contentGap = compact ? "gap-2" : "gap-3";
  const labelClass = "text-xs text-foreground";
  const titleClass = compact ? "mt-0.5 truncate text-sm font-medium" : "mt-1 truncate text-sm font-medium";
  const detailClass = compact ? "mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500" : "mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500";

  return (
    <div className={cardClass}>
      <div className={`flex min-w-0 flex-1 items-center ${contentGap}`}>
        <div className="shrink-0 self-center">
          {useHexIcon ? <HexIcon size={compact ? "sm" : "md"}>{icon}</HexIcon> : <span className={compact ? "text-gray-400" : "text-foreground"}>{icon}</span>}
        </div>
        <div className="min-w-0 flex-1">
          <p className={labelClass}>{statusLabel}</p>
          <p className={titleClass} style={{ color: "#DBC99E" }}>
            {title}
          </p>
          <div className={detailClass}>
            <span>{subtitle}</span>
            {views && (
              <>
                <span>·</span>
                <span>{views} views</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap gap-2">
        {actions.map((action, i) => {
          const isIconOnly = !action.label;
          const btnClass = isIconOnly
            ? (compact ? iconOnlyButtonClassCompact : iconOnlyButtonClass)
            : (compact ? buttonClassCompact : buttonClass);
          const ariaLabel = action.ariaLabel ?? action.label ?? "Action";
          if (action.href) {
            return (
              <Link key={i} href={action.href} className={btnClass} aria-label={ariaLabel}>
                {action.icon}
                {action.label}
              </Link>
            );
          }
          return (
            <button
              key={i}
              type="button"
              onClick={action.onClick}
              className={btnClass}
              aria-label={ariaLabel}
            >
              {action.icon}
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
