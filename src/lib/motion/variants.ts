import type { Variants } from "motion/react";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};

export const staggerParent: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.06,
    },
  },
};

export const staggerChild = fadeUp;

/**
 * Clip-path mask reveal — content wipes up from behind a horizontal mask.
 * Apply per LINE, never per word or letter: Arabic letterforms join across
 * a word and splitting mid-line breaks shaping. Vertical inset only, so it
 * is RTL-safe with no logical-property flipping.
 *
 * IMPORTANT: `MotionConfig reducedMotion="user"` only disables transform and
 * layout animations — clip-path still animates. Consumers MUST check
 * `useReducedMotion()` and swap to `fadeIn` (same pattern as Parallax.tsx).
 * Pair with the shared `reveal` transition from ./springs.
 */
export const revealMask: Variants = {
  hidden: { clipPath: "inset(0% 0% 100% 0%)" },
  visible: { clipPath: "inset(0% 0% 0% 0%)" },
};
