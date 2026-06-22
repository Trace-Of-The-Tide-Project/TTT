"use client";

import { useEffect, useState } from "react";
import { theme } from "@/lib/theme";

/**
 * Slim scroll-progress bar pinned to the top of the viewport. Calm, thin
 * accent line — not a busy widget. Respects prefers-reduced-motion by
 * dropping the width transition.
 */
export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);

    let ticking = false;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

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
