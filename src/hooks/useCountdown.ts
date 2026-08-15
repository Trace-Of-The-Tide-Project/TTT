"use client";

import { useEffect, useState } from "react";

export type CountdownState = {
  days: number;
  hours: number;
  minutes: number;
  done: boolean;
};

function remaining(commonsAt: string): CountdownState {
  const diff = new Date(commonsAt).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, done: true };
  const minutes = Math.floor(diff / 60_000) % 60;
  const hours = Math.floor(diff / 3_600_000) % 24;
  const days = Math.floor(diff / 86_400_000);
  return { days, hours, minutes, done: false };
}

/**
 * Ticking countdown to a resource's commons_at date. Ticks every minute;
 * shared by CommonsCountdown (already-commons notice) and GiftWindowPanel
 * (active gift-window state) so both read the same clock.
 */
export function useCountdown(commonsAt: string): CountdownState {
  const [time, setTime] = useState(() => remaining(commonsAt));

  useEffect(() => {
    setTime(remaining(commonsAt));
    const id = setInterval(() => setTime(remaining(commonsAt)), 60_000);
    return () => clearInterval(id);
  }, [commonsAt]);

  return time;
}
