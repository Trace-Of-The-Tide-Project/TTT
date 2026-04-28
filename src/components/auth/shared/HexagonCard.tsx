"use client";

import { SpringCard } from "@/components/motion/SpringCard";
import { TOTT_AUTH_HEX_CLIP_PATH } from "./authHexClipPath";

const SIZE_STYLES = {
  default: {
    outer: "max-w-3xl min-h-[750px]",
    inner: "h-full min-h-[calc(760px-6px)] px-50 py-24",
  },
  compact: {
    outer: "max-w-xl min-h-[520px]",
    inner: "h-full min-h-[calc(520px-6px)] px-28 py-18",
  },
  medium: {
    outer: "max-w-2xl min-h-[640px]",
    inner: "h-full min-h-[calc(640px-6px)] px-32 py-20",
  },
  large: {
    outer: "max-w-3xl min-h-[760px]",
    inner: "h-full min-h-[calc(760px-6px)] px-40 py-24",
  },
  xl: {
    outer: "max-w-4xl min-h-[810px]",
    inner: "min-h-[calc(810px-6px)] overflow-y-auto px-12 py-10 sm:px-20 sm:py-16 md:px-28 md:py-12",
  },
} as const;

export type HexagonCardSize = keyof typeof SIZE_STYLES;

type HexagonCardProps = {
  children: React.ReactNode;
  className?: string;
  /** Card size: default (full), compact (small), medium, or large */
  size?: HexagonCardSize;
  /** @deprecated Use size="compact" instead */
  compact?: boolean;
};

export function HexagonCard({ children, className, size, compact }: HexagonCardProps) {
  const effectiveSize = size ?? (compact ? "compact" : "default");
  const styles = SIZE_STYLES[effectiveSize];

  return (
    <SpringCard
      interactive={false}
      className={`relative w-full mx-auto ${styles.outer} ${className ?? ""}`}
      style={{
        clipPath: TOTT_AUTH_HEX_CLIP_PATH,
        background: "var(--tott-auth-hex-outer)",
        padding: "3px",
      }}
    >
      <div
        className={`relative w-full flex min-h-0 flex-col items-center justify-center overflow-y-auto ${styles.inner}`}
        style={{
          clipPath: TOTT_AUTH_HEX_CLIP_PATH,
          background: "var(--tott-auth-hex-inner)",
          boxShadow: "inset 0 0 0 1px var(--tott-auth-hex-inset-ring)",
        }}
      >
        {children}
      </div>
    </SpringCard>
  );
}
