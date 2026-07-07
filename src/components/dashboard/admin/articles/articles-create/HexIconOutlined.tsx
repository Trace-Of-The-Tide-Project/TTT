import type { ReactNode } from "react";

const sizeClasses = {
  sm: "h-7 w-7 p-1.5 [&_.relative_svg]:h-3 [&_.relative_svg]:w-3",
  md: "h-14 w-14 p-2.5 [&_.relative_svg]:h-5 [&_.relative_svg]:w-5",
  lg: "h-18 w-18 p-3.5 [&_.relative_svg]:h-7 [&_.relative_svg]:w-7",
} as const;

type HexIconOutlinedProps = {
  children: ReactNode;
  size?: keyof typeof sizeClasses;
  className?: string;
};

/** Rounded hexagon path (same as ShareYourStory) */
function roundedHexPath(cx: number, cy: number, r: number) {
  const corners = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
  const rounding = r * 0.18;
  let d = "";
  for (let i = 0; i < 6; i++) {
    const prev = corners[(i + 5) % 6];
    const curr = corners[i];
    const next = corners[(i + 1) % 6];
    const dx1 = curr.x - prev.x,
      dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x,
      dy2 = next.y - curr.y;
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    const sx = curr.x - (dx1 / len1) * rounding;
    const sy = curr.y - (dy1 / len1) * rounding;
    const ex = curr.x + (dx2 / len2) * rounding;
    const ey = curr.y + (dy2 / len2) * rounding;
    if (i === 0) d += `M${sx},${sy}`;
    else d += `L${sx},${sy}`;
    d += `Q${curr.x},${curr.y} ${ex},${ey}`;
  }
  return d + "Z";
}

/**
 * Hexagonal outline container for template card icons.
 * Uses the rounded hexagon from ShareYourStory.
 */
export function HexIconOutlined({ children, size = "md", className = "" }: HexIconOutlinedProps) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center ${sizeClasses[size]} ${className}`}
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 48 48" fill="none">
        <path
          d={roundedHexPath(24, 24, 22)}
          fill="var(--tott-dash-icon-bg)"
          stroke="var(--tott-card-border)"
          strokeWidth="1.2"
        />
      </svg>
      <span className="relative" style={{ color: "var(--tott-dash-gold-text)" }}>
        {children}
      </span>
    </div>
  );
}
