"use client";

import { useState } from "react";
import { theme } from "@/lib/theme";

/**
 * Rounded hexagon clip-path — each corner is approximated by multiple points
 * for smooth/soft edges instead of sharp corners.
 */
const HEX_CLIP_ROUNDED =
  "polygon(47.5% 5.67%, 48.29% 5.3%, 49.13% 5.08%, 50% 5%, 50.87% 5.08%, 51.71% 5.3%, 52.5% 5.67%, 87.14% 25.67%, 87.85% 26.17%, 88.47% 26.79%, 88.97% 27.5%, 89.34% 28.29%, 89.57% 29.13%, 89.64% 30%, 89.64% 70%, 89.57% 70.87%, 89.34% 71.71%, 88.97% 72.5%, 88.47% 73.21%, 87.85% 73.83%, 87.14% 74.33%, 52.5% 94.33%, 51.71% 94.7%, 50.87% 94.92%, 50% 95%, 49.13% 94.92%, 48.29% 94.7%, 47.5% 94.33%, 12.86% 74.33%, 12.15% 73.83%, 11.53% 73.21%, 11.03% 72.5%, 10.66% 71.71%, 10.43% 70.87%, 10.36% 70%, 10.36% 30%, 10.43% 29.13%, 10.66% 28.29%, 11.03% 27.5%, 11.53% 26.79%, 12.15% 26.17%, 12.86% 25.67%)";

/** Inner fill when selected/hovered (same as original CARD_BG). */
const HEX_INNER_SELECTED = "#2a2a2a";

type ContributionHexCardProps = {
  icon: React.ReactNode;
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
};

export function ContributionHexCard({
  icon,
  label,
  selected,
  onClick,
  className = "",
}: ContributionHexCardProps) {
  const [hovered, setHovered] = useState(false);
  const isActive = selected || hovered;

  const outerBackground = isActive
    ? theme.accentGold
    : hovered
      ? "var(--tott-contribute-hex-outer-hover)"
      : "var(--tott-contribute-hex-outer)";

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group relative -mx-[12px] -my-[18px] flex w-[190px] shrink-0 cursor-pointer flex-col items-center justify-center gap-1 px-3 py-4 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#C9A96E] focus:ring-offset-0 focus:ring-offset-transparent ${className}`}
      style={{
        clipPath: HEX_CLIP_ROUNDED,
        background: outerBackground,
        padding: isActive ? "2px" : "0",
        minHeight: "174px",
      }}
      aria-pressed={selected}
    >
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-2 bg-transparent"
        style={{
          clipPath: HEX_CLIP_ROUNDED,
          ...(isActive ? { background: HEX_INNER_SELECTED } : {}),
        }}
      >
        <span
          className="flex shrink-0 items-center justify-center [&>svg]:h-6 [&>svg]:w-auto"
          style={{
            color: isActive ? theme.accentGold : "var(--tott-contribute-hex-label-inactive)",
          }}
        >
          {icon}
        </span>
        <span
          className="text-center text-xs font-medium leading-tight"
          style={{
            color: isActive ? theme.accentGold : "var(--tott-contribute-hex-label-inactive)",
          }}
        >
          {label}
        </span>
      </div>
    </button>
  );
}
