"use client";

import { Link } from "@/i18n/navigation";
import type { ReactNode } from "react";
import { HexIconOutlined } from "./HexIconOutlined";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";

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
  // ChamferedFrame draws the border; card itself is borderless + transparent.
  const cardClass = compact
    ? "group relative flex flex-col items-center justify-center gap-3 px-5 py-8 cursor-pointer"
    : "group relative flex flex-col items-center justify-center gap-4 px-6 py-14 cursor-pointer";

  // 25px chamfer matches ChamferedFrame's default size; clipping happens on a
  // separate hover layer so the frame's curved corners stay intact.
  const HOVER_LAYER_CLIP =
    "polygon(25px 0,calc(100% - 25px) 0,100% 25px,100% calc(100% - 25px),calc(100% - 25px) 100%,25px 100%,0 calc(100% - 25px),0 25px)";

  const iconSize = compact ? "md" : "lg";

  const content = (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-colors duration-200 group-hover:bg-[var(--tott-dash-ghost-hover)]"
        style={{ clipPath: HOVER_LAYER_CLIP, WebkitClipPath: HOVER_LAYER_CLIP }}
      />
      <ChamferedFrame />
      <div className="relative flex justify-center transition-transform duration-200 group-hover:scale-110">
        <HexIconOutlined size={iconSize}>{icon}</HexIconOutlined>
      </div>
      <div className="relative space-y-1 text-center">
        <p className={`font-medium text-gray-500 ${compact ? "text-[11px]" : "text-xs"}`}>{number}</p>
        <h3 className={`font-bold text-foreground ${compact ? "text-sm" : "text-base"}`}>{title}</h3>
      </div>
      <p className={`relative text-center leading-snug text-gray-500 ${compact ? "text-xs" : "text-sm"}`}>{description}</p>
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
