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
