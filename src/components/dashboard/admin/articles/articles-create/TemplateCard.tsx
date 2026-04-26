"use client";

import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";
import { HexIconOutlined } from "./HexIconOutlined";

export type TemplateCardProps = {
  number: string;
  title: string;
  description: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  /** Compact mode for dense grids (e.g. admin 4-col). Default is spacious (profile 2-col). */
  compact?: boolean;
};

export function TemplateCard({
  number,
  title,
  description,
  icon,
  href,
  onClick,
  compact = false,
}: TemplateCardProps) {
  const cardClass = compact
    ? "group flex flex-col items-center justify-center gap-3 rounded-xl border border-[var(--tott-card-border)] px-5 py-8 transition-all duration-200 cursor-pointer hover:border-[#CBA158]/40 hover:bg-[var(--tott-dash-ghost-hover)]"
    : "group flex flex-col items-center justify-center gap-4 rounded-xl border border-[var(--tott-card-border)] px-6 py-14 transition-all duration-200 cursor-pointer hover:border-[#CBA158]/40 hover:bg-[var(--tott-dash-ghost-hover)]";

  const iconSize = compact ? "md" : "lg";

  const content = (
    <>
      <div className="flex justify-center transition-transform duration-200 group-hover:scale-110">
        <HexIconOutlined size={iconSize}>{icon}</HexIconOutlined>
      </div>
      <div className="space-y-1 text-center">
        <p className={`font-medium text-gray-500 ${compact ? "text-[11px]" : "text-xs"}`}>{number}</p>
        <h3 className={`font-bold text-foreground ${compact ? "text-sm" : "text-base"}`}>{title}</h3>
      </div>
      <p className={`text-center leading-snug text-gray-500 ${compact ? "text-xs" : "text-sm"}`}>{description}</p>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cardClass}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`w-full ${cardClass}`}>
      {content}
    </button>
  );
}
