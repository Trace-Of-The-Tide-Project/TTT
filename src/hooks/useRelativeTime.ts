"use client";

import { useFormatter } from "next-intl";

/**
 * useFormatter().relativeTime requires an explicit `now` — without it
 * next-intl falls back silently but logs an ENVIRONMENT_FALLBACK error on
 * every call. `now` is fixed once per render pass (not tracked in state):
 * feed timestamps don't need to tick live, just avoid the console error.
 */
export function useRelativeTime() {
  const format = useFormatter();
  const now = new Date();
  return (date: Date | string) => format.relativeTime(new Date(date), now);
}
