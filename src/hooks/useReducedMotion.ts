"use client";

import { useReducedMotion as motionUseReducedMotion } from "motion/react";

/** SSR-safe wrapper around motion's hook — returns a definite boolean. */
export function useReducedMotion(): boolean {
  const value = motionUseReducedMotion();
  return value === true;
}
