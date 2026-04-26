"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { staggerParent } from "@/lib/motion";

type Props = HTMLMotionProps<"div">;

export function StaggerContainer({ children, className, style, ...rest }: Props) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={staggerParent}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
