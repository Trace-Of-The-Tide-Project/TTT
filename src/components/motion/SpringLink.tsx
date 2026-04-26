"use client";

import { motion } from "motion/react";
import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";
import { springs, type SpringPreset } from "@/lib/motion";

type SpringLinkProps = ComponentProps<typeof Link> & {
  preset?: SpringPreset;
};

const DEFAULT_HOVER = { scale: 1.03 };
const DEFAULT_TAP = { scale: 0.97 };

export function SpringLink({
  children,
  preset = "snappy",
  className,
  style,
  ...rest
}: SpringLinkProps) {
  return (
    <motion.span
      style={{ display: "inline-block" }}
      whileHover={DEFAULT_HOVER}
      whileTap={DEFAULT_TAP}
      transition={springs[preset]}
    >
      <Link {...rest} className={className} style={style}>
        {children}
      </Link>
    </motion.span>
  );
}
