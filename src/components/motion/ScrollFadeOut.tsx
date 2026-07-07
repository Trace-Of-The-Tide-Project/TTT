"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type ScrollFadeOutProps = {
  children: ReactNode;
  className?: string;
  /** How far the content lifts (px) as it scrolls away. */
  lift?: number;
};

/**
 * Scroll-progress motion: the content stays fully visible at rest, then
 * fades and drifts upward *continuously* as the reader scrolls past it —
 * tied directly to scroll position, not a one-shot reveal. Best on a hero,
 * where it pairs with the artwork parallax so the whole banner dissolves
 * gracefully on the way down.
 *
 * Like all scroll-linked `style` transforms, this bypasses the global
 * `MotionConfig reducedMotion="user"`, so we gate it with `useReducedMotion`
 * and render a plain, static layer when reduced motion is preferred.
 */
export function ScrollFadeOut({ children, className, lift = 60 }: ScrollFadeOutProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -lift]);

  return (
    <motion.div
      ref={ref}
      className={className}
      style={reduced ? undefined : { opacity, y }}
    >
      {children}
    </motion.div>
  );
}
