"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "@/i18n/navigation";

/**
 * Thin gold progress bar at the top of the viewport.
 * Starts on pathname change, completes shortly after the new page renders.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (pathname === prevPathRef.current) return;
    prevPathRef.current = pathname;

    // Clear any previous timers
    if (timerRef.current) clearTimeout(timerRef.current);

    // Start bar
    setVisible(true);
    setProgress(15);

    // Quickly advance to ~80% to simulate loading
    const t1 = setTimeout(() => setProgress(60), 80);
    const t2 = setTimeout(() => setProgress(80), 250);

    // Complete after the new page has painted
    const t3 = setTimeout(() => {
      setProgress(100);
      // Hide after the fill animation finishes
      const t4 = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
      timerRef.current = t4;
    }, 350);

    timerRef.current = t3;

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-[2px]"
      aria-hidden
    >
      <div
        className="h-full transition-all ease-out"
        style={{
          width: `${progress}%`,
          background: "var(--tott-gold, #C9A96E)",
          transitionDuration: progress === 100 ? "200ms" : "400ms",
          boxShadow: "0 0 6px 1px color-mix(in srgb, var(--tott-gold, #C9A96E) 60%, transparent)",
        }}
      />
    </div>
  );
}
