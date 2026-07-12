"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Slow layered "tide line" behind the hero headline. Pure CSS animation
 * (.tott-tide-drift / .tott-tide-sway from globals.css — transform-only,
 * auto-killed by the prefers-reduced-motion block); under reduced motion the
 * whole layer is removed, per the Session 1 spec.
 */

/* Wave paths start and end at the same y so the doubled drift strip loops seamlessly. */
const WAVE_A =
  "M0,192 C180,144 360,240 540,192 C720,144 900,240 1080,192 C1260,144 1380,216 1440,192 L1440,320 L0,320 Z";
const WAVE_B =
  "M0,224 C240,176 480,264 720,224 C960,184 1200,264 1440,224 L1440,320 L0,320 Z";

function Wave({ d, className, opacity }: { d: string; className?: string; opacity: number }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      fill="var(--tott-gold-muted)"
      fillOpacity={opacity}
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

export function TideBackground() {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);

  // ponytail: hero sits above the fold — this only matters once the visitor scrolls past.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setPaused(!entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (reduced) return null;

  return (
    <div
      ref={ref}
      dir="ltr"
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${
        paused
          ? "[&_.tott-tide-drift]:[animation-play-state:paused] [&_.tott-tide-sway]:[animation-play-state:paused]"
          : ""
      }`}
    >
      {/* Static base wave — depth for free, no animation cost. */}
      <Wave d={WAVE_B} opacity={0.04} className="absolute bottom-0 left-0 h-[38%] w-full" />

      {/* Sway layer: oversized so the ±12px translate never exposes an edge. */}
      <div className="tott-tide-sway absolute bottom-0 left-0 h-[34%] w-[104%] -translate-x-[2%]">
        <Wave d={WAVE_B} opacity={0.05} className="h-full w-full" />
      </div>

      {/* Drift layer: two identical copies in a 200% strip; tott-tide-drift loops translateX(-50%). */}
      <div className="tott-tide-drift absolute bottom-0 left-0 flex h-[30%] w-[200%]">
        <Wave d={WAVE_A} opacity={0.08} className="h-full w-1/2 shrink-0" />
        <Wave d={WAVE_A} opacity={0.08} className="h-full w-1/2 shrink-0" />
      </div>
    </div>
  );
}
