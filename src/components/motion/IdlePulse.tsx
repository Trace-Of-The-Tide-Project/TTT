"use client";

import { motion } from "motion/react";
import type { ReactNode, CSSProperties } from "react";
import { useIdle } from "@/hooks/useIdle";
import { springs } from "@/lib/motion";

type Props = {
  children: ReactNode;
  phaseOffset?: number;
  idleTimeout?: number;
  className?: string;
  style?: CSSProperties;
};

export function IdlePulse({
  children,
  phaseOffset = 0,
  idleTimeout = 2500,
  className,
  style,
}: Props) {
  const isIdle = useIdle({ timeout: idleTimeout });

  return (
    <motion.div
      className={className}
      style={style}
      animate={{ opacity: isIdle ? 0.85 : 1 }}
      transition={
        isIdle
          ? { ...springs.breath, repeat: Infinity, repeatType: "reverse", delay: phaseOffset }
          : { duration: 0.4 }
      }
    >
      {children}
    </motion.div>
  );
}
