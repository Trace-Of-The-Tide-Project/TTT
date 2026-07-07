"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type ParallaxProps = {
  children: ReactNode;
  /**
   * Vertical drift, in px, applied across the element's full pass through
   * the viewport (± each direction). Keep this subtle — the inner layer is
   * over-scanned by exactly this much so the drift never exposes an edge.
   */
  distance?: number;
  /** Extra classes on the clipping container. */
  className?: string;
};

/**
 * Scroll-linked parallax. The wrapped content (typically a fill image) drifts
 * vertically at a slightly different rate than the page as the element passes
 * through the viewport, creating depth. The clip container hides the over-scan.
 *
 * IMPORTANT: scroll-linked transforms applied via `style` are NOT disabled by
 * the global `MotionConfig reducedMotion="user"` — so we gate them here with
 * the app's `useReducedMotion` hook and render a plain, static layer when the
 * user prefers reduced motion.
 */
export function Parallax({ children, distance = 30, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-distance, distance]);

  // The clip container must be a positioning context for the inner absolute
  // layer. Only add `relative` when the caller hasn't supplied their own
  // position (e.g. `absolute inset-0` to fill a parent) — otherwise the two
  // position utilities collide and the container collapses, hiding the image.
  const hasPosition = /(?:^|\s)(?:absolute|fixed|sticky|relative)(?:\s|$)/.test(
    className ?? "",
  );

  return (
    <div
      ref={ref}
      className={`overflow-hidden ${hasPosition ? "" : "relative"} ${className ?? ""}`}
    >
      <motion.div
        className="absolute inset-0"
        // Over-scan the moving layer by `distance` on top and bottom so the
        // drift stays covered. When reduced, sit flush with no transform.
        style={reduced ? undefined : { y, top: -distance, bottom: -distance }}
      >
        {children}
      </motion.div>
    </div>
  );
}
