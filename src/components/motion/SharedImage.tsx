"use client";

import { motion } from "motion/react";
import type { ReactNode, CSSProperties } from "react";

type Props = {
  layoutId?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/**
 * Wrapper that enables shared-layout image morphs across routes via `layoutId`.
 * When `layoutId` is omitted it renders a plain div with no motion overhead.
 */
export function SharedImage({ layoutId, children, className, style }: Props) {
  if (!layoutId) {
    return <div className={className} style={style}>{children}</div>;
  }
  return (
    <motion.div layoutId={layoutId} layout className={className} style={style}>
      {children}
    </motion.div>
  );
}
