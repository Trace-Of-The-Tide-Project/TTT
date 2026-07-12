"use client";

import type { ReactNode } from "react";
import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Lenis smooth scrolling, scoped to wherever this mounts (homepage only —
 * do not lift into a shared layout). Bails to native scroll under
 * prefers-reduced-motion. `anchors: true` routes in-page hash links
 * (SectionShell ids) through Lenis.
 *
 * Constraint for consumers: CSS scroll-snap does not work under Lenis —
 * use drag/buttons for horizontal strips instead.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  if (reduced) return <>{children}</>;
  return (
    <ReactLenis root options={{ anchors: true }}>
      {children}
    </ReactLenis>
  );
}
