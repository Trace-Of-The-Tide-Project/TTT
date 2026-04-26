"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { springs } from "@/lib/motion";

type Props = HTMLMotionProps<"div">;

export function RevealOnScroll({ children, className, style, ...rest }: Props) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={springs.gentle}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
