"use client";

import { SpringCard } from "@/components/motion/SpringCard";

const HEX_CLIP =
  "polygon(47.5% 5.67%, 48.29% 5.3%, 49.13% 5.08%, 50% 5%, 50.87% 5.08%, 51.71% 5.3%, 52.5% 5.67%, 87.14% 25.67%, 87.85% 26.17%, 88.47% 26.79%, 88.97% 27.5%, 89.34% 28.29%, 89.57% 29.13%, 89.64% 30%, 89.64% 70%, 89.57% 70.87%, 89.34% 71.71%, 88.97% 72.5%, 88.47% 73.21%, 87.85% 73.83%, 87.14% 74.33%, 52.5% 94.33%, 51.71% 94.7%, 50.87% 94.92%, 50% 95%, 49.13% 94.92%, 48.29% 94.7%, 47.5% 94.33%, 12.86% 74.33%, 12.15% 73.83%, 11.53% 73.21%, 11.03% 72.5%, 10.66% 71.71%, 10.43% 70.87%, 10.36% 70%, 10.36% 30%, 10.43% 29.13%, 10.66% 28.29%, 11.03% 27.5%, 11.53% 26.79%, 12.15% 26.17%, 12.86% 25.67%)";

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
        clipPath: HEX_CLIP,
        background: "var(--tott-auth-hex-outer)",
        padding: "3px",
      }}
    >
      <div
        className={`relative w-full flex min-h-0 flex-col items-center justify-center overflow-y-auto ${styles.inner}`}
        style={{
          clipPath: HEX_CLIP,
          background: "var(--tott-auth-hex-inner)",
          boxShadow: "inset 0 0 0 1px var(--tott-auth-hex-inset-ring)",
        }}
      >
        {children}
      </div>
    </SpringCard>
  );
}
