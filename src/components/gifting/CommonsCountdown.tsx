"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

function remaining(commonsAt: string): { days: number; hours: number; minutes: number; done: boolean } {
  const diff = new Date(commonsAt).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, done: true };
  const minutes = Math.floor(diff / 60_000) % 60;
  const hours = Math.floor(diff / 3_600_000) % 24;
  const days = Math.floor(diff / 86_400_000);
  return { days, hours, minutes, done: false };
}

/**
 * Live countdown to a resource's commons_at date — replaces the lock icon
 * per SRS §6.2 ("no lock icon, use countdown"). Ticks every minute; reduced
 * motion friendly (no animation, just text updates) and CLS-safe (fixed-width
 * tabular numerals).
 */
export function CommonsCountdown({ commonsAt }: { commonsAt: string }) {
  const t = useTranslations("Content.giftGate");
  const [time, setTime] = useState(() => remaining(commonsAt));

  useEffect(() => {
    setTime(remaining(commonsAt));
    const id = setInterval(() => setTime(remaining(commonsAt)), 60_000);
    return () => clearInterval(id);
  }, [commonsAt]);

  if (time.done) {
    return (
      <p className="rounded-lg bg-[var(--tott-panel-bg)] px-4 py-2 text-center text-xs text-[var(--tott-home-text-muted)]">
        {t("commonsNotice")}
      </p>
    );
  }

  return (
    <div className="rounded-lg bg-[var(--tott-panel-bg)] px-4 py-3 text-center">
      <p className="text-xs text-[var(--tott-home-text-muted)]">{t("commonsCountdownLabel")}</p>
      <time
        dateTime={commonsAt}
        className="mt-1 block font-display text-lg [font-variant-numeric:tabular-nums]"
        style={{ color: "var(--tott-accent-gold)" }}
      >
        {t("commonsCountdownValue", { days: time.days, hours: time.hours, minutes: time.minutes })}
      </time>
    </div>
  );
}
