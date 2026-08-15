"use client";

import { useTranslations } from "next-intl";
import { useCountdown } from "@/hooks/useCountdown";

/**
 * Live countdown to a resource's commons_at date — replaces the lock icon
 * per SRS §6.2 ("no lock icon, use countdown"). Ticks every minute; reduced
 * motion friendly (no animation, just text updates) and CLS-safe (fixed-width
 * tabular numerals).
 *
 * Used for the ALREADY-commons notice (gift window has closed). For the
 * still-open gift-window state, see GiftWindowPanel, which uses the same
 * useCountdown hook but a different, inline layout.
 */
export function CommonsCountdown({ commonsAt }: { commonsAt: string }) {
  const t = useTranslations("Content.giftGate");
  const time = useCountdown(commonsAt);

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
