"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const IDLE_EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"] as const;

export function useIdle({ timeout = 2500 }: { timeout?: number } = {}): boolean {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reset = useCallback(() => {
    setIsIdle(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsIdle(true), timeout);
  }, [timeout]);

  useEffect(() => {
    IDLE_EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      IDLE_EVENTS.forEach((e) => window.removeEventListener(e, reset));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [reset]);

  return isIdle;
}
