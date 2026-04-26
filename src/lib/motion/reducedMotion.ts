import type { Transition } from "motion/react";

export const instantTransition: Transition = { duration: 0 };

export function maybeSpring(preset: Transition, reduced: boolean): Transition {
  return reduced ? instantTransition : preset;
}
