"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { reveal } from "@/lib/motion";

type Props = HTMLMotionProps<"div">;

/**
 * The house "Soft Rise" section reveal: content fades in and drifts up
 * with the refined editorial easing (no bounce), once, as it enters the
 * viewport. Every section on the site routes through this so the whole
 * page shares one composed motion signature.
 */
export function RevealOnScroll({ children, className, style, ...rest }: Props) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={reveal}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
