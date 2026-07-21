"use client";

import { useState } from "react";
import { theme } from "@/lib/theme";
import { useReadingProgress } from "@/hooks/useReadingProgress";

/**
 * Slim scroll-progress bar pinned to the top of the viewport. Calm, thin
 * accent line — not a busy widget. Respects prefers-reduced-motion by
 * dropping the width transition.
 */
export function ReadingProgressBar() {
  const progress = useReadingProgress();
  const [reduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-0.5"
      style={{ backgroundColor: "transparent" }}
    >
      <div
        className="h-full"
        style={{
          width: `${progress}%`,
          backgroundColor: theme.accentGold,
          transition: reduced ? "none" : "width 120ms linear",
        }}
      />
    </div>
  );
}
