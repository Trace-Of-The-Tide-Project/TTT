"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { springs, staggerChild } from "@/lib/motion";

type Props = HTMLMotionProps<"div">;

export function StaggerItem({ children, className, style, ...rest }: Props) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={staggerChild}
      transition={springs.gentle}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
