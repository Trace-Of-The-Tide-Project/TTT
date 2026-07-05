import type { Transition } from "motion/react";

export const springs = {
  snappy: { type: "spring", stiffness: 420, damping: 32, mass: 1 },
  gentle: { type: "spring", stiffness: 180, damping: 26, mass: 1 },
  morph: { type: "spring", stiffness: 260, damping: 30, mass: 1.1 },
  page: { type: "spring", stiffness: 220, damping: 34, mass: 1 },
  breath: { type: "spring", stiffness: 14, damping: 8, mass: 1 },
} as const satisfies Record<string, Transition>;

export const durations = {
  hover: 0.18,
  enter: 0.45,
  page: 0.35,
} as const;

export type SpringPreset = keyof typeof springs;

/**
 * Refined editorial easing — a smooth, confident deceleration curve
 * (a.k.a. "ease-out-expo") with NO overshoot. This is the house motion
 * signature for section reveals: it reads as composed and premium, the
 * opposite of a bouncy spring. Used as a plain tween (not a spring) so
 * reveals never wobble.
 */
export const easeOut: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Whole-section soft-rise transition (the "Soft Rise" reveal). */
export const reveal: Transition = { duration: 0.7, ease: easeOut };

/** Per-item transition for staggered grid/list reveals — a touch quicker
 *  than a full section so a cascade of cards stays crisp. */
export const revealItem: Transition = { duration: 0.55, ease: easeOut };
