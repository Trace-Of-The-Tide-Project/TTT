"use client";

import type { ReactNode } from "react";
import { ChamferedFrame } from "./ChamferedFrame";

type ChamferedPanelProps = {
  children: ReactNode;
  className?: string;
  /** Corner size in px for the outer frame. Default 25. */
  size?: number;
  borderColor?: string;
};

/**
 * A box wrapped in a chamfered (octagonal) outline. Use as a drop-in
 * replacement for `border + rounded-lg` containers when the design calls
 * for chamfered corners. The outline auto-adapts to light/dark theme.
 */
export function ChamferedPanel({
  children,
  className,
  size,
  borderColor,
}: ChamferedPanelProps) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <ChamferedFrame size={size} borderColor={borderColor} />
      <div className="relative">{children}</div>
    </div>
  );
}
