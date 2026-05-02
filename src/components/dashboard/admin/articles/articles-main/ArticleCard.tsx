"use client";

import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";
import { SpringCard } from "@/components/motion/SpringCard";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";

export type ArticleCardAction = {
  label?: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  ariaLabel?: string;
  /** "primary" renders the rounded filled button from Figma Button-2.svg (uses theme tokens). */
  variant?: "primary";
};

type ArticleCardProps = {
  icon: ReactNode;
  statusLabel: string;
  title: string;
  subtitle: string;
  subtitleIcon?: ReactNode;
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
  "relative flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-foreground transition-opacity hover:opacity-80";

const buttonClassCompact =
  "relative flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-foreground transition-opacity hover:opacity-80";

const iconOnlyButtonClass =
  "relative flex h-12 w-12 items-center justify-center p-3 text-foreground transition-opacity hover:opacity-80";

const iconOnlyButtonClassCompact =
  "relative flex h-9 w-9 items-center justify-center p-2 text-foreground transition-opacity hover:opacity-80";

// Figma Button-2.svg replicated in CSS — colors come from theme tokens (--tott-dash-control-*).
const primaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-opacity hover:opacity-90";
const primaryButtonStyle = {
  backgroundColor: "var(--tott-dash-control-bg)",
  color: "var(--tott-dash-control-fg)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
} as const;

export function ArticleCard({
  icon,
  statusLabel,
  title,
  subtitle,
  subtitleIcon,
  views,
  actions,
  useHexIcon = false,
  compact = false,
}: ArticleCardProps) {
  const cardClass = compact
    ? "relative flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
    : "relative flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between";
  const contentGap = compact ? "gap-3" : "gap-4";
  const headlineClass = "flex flex-wrap items-baseline gap-x-2 gap-y-0.5";
  const labelClass = "text-xs font-medium text-foreground";
  const titleClass = "truncate text-sm font-medium";
  const detailClass = compact ? "mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-gray-500" : "mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500";

  return (
    <SpringCard className={cardClass}>
      <ChamferedFrame />
      <div className={`relative flex min-w-0 flex-1 items-center ${contentGap}`}>
        <div className="shrink-0 self-center">
          {useHexIcon ? <HexIcon size={compact ? "sm" : "md"}>{icon}</HexIcon> : <span className={compact ? "text-gray-400" : "text-foreground"}>{icon}</span>}
        </div>
        <div className="min-w-0 flex-1">
          <div className={headlineClass}>
            <span className={labelClass}>{statusLabel}</span>
            <span className={titleClass} style={{ color: "var(--tott-dash-gold-text)" }}>
              {title}
            </span>
          </div>
          <div className={detailClass}>
            {subtitleIcon ? (
              <span className="inline-flex items-center text-gray-500">{subtitleIcon}</span>
            ) : null}
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

      <div className="relative flex shrink-0 flex-wrap gap-2">
        {actions.map((action, i) => {
          const isIconOnly = !action.label;
          const isPrimary = action.variant === "primary";
          const ariaLabel = action.ariaLabel ?? action.label ?? "Action";
          const chamferSize = compact ? 10 : 14;

          if (isPrimary) {
            // Figma Button-2.svg: arrow sits AFTER the label (right of the text).
            const inner = (
              <span className="inline-flex items-center gap-2">
                {action.label}
                {action.icon}
              </span>
            );
            const sharedProps = {
              className: primaryButtonClass,
              style: primaryButtonStyle,
              "aria-label": ariaLabel,
            };
            return action.href ? (
              <Link key={i} href={action.href} {...sharedProps}>
                {inner}
              </Link>
            ) : (
              <button key={i} type="button" onClick={action.onClick} {...sharedProps}>
                {inner}
              </button>
            );
          }

          const btnClass = isIconOnly
            ? (compact ? iconOnlyButtonClassCompact : iconOnlyButtonClass)
            : (compact ? buttonClassCompact : buttonClass);
          if (action.href) {
            return (
              <Link key={i} href={action.href} className={btnClass} aria-label={ariaLabel}>
                <ChamferedFrame size={chamferSize} />
                <span className="relative inline-flex items-center gap-2">
                  {action.icon}
                  {action.label}
                </span>
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
              <ChamferedFrame size={chamferSize} />
              <span className="relative inline-flex items-center gap-2">
                {action.icon}
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </SpringCard>
  );
}
