"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { fadeIn, revealMask, reveal } from "@/lib/motion";

type MaskRevealProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Scroll-into-view clip reveal for a whole block (never per word — Arabic-safe).
 * clip-path is NOT covered by MotionConfig reducedMotion="user" — swap manually.
 */
export function MaskReveal({ children, className }: MaskRevealProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={reduced ? fadeIn : revealMask}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={reveal}
    >
      {children}
    </motion.div>
  );
}
