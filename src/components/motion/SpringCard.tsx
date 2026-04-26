"use client";

import { motion } from "motion/react";
import type { HTMLMotionProps } from "motion/react";
import { springs, type SpringPreset } from "@/lib/motion";

type SpringCardProps = HTMLMotionProps<"div"> & {
  preset?: SpringPreset;
  /** Disable hover/tap springs — useful for form containers that shouldn't lift. */
  interactive?: boolean;
};

const DEFAULT_HOVER = { y: -4, scale: 1.01 };
const DEFAULT_TAP = { scale: 0.99 };

export function SpringCard({
  children,
  preset = "snappy",
  interactive = true,
  whileHover,
  whileTap,
  transition,
  ...rest
}: SpringCardProps) {
  return (
    <motion.div
      {...rest}
      whileHover={interactive ? (whileHover ?? DEFAULT_HOVER) : undefined}
      whileTap={interactive ? (whileTap ?? DEFAULT_TAP) : undefined}
      transition={transition ?? springs[preset]}
    >
      {children}
    </motion.div>
  );
}
