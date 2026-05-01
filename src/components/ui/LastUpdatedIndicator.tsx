"use client";

import { useTranslations } from "next-intl";
import { ActivityIcon } from "@/components/ui/icons";

type LastUpdatedIndicatorProps = {
  className?: string;
};

/**
 * Standardized "Last updated: Just now" pill: heartbeat/activity icon
 * in green, muted-gray text. Used as a subtle freshness cue at the top
 * of admin page headers.
 */
export function LastUpdatedIndicator({ className }: LastUpdatedIndicatorProps) {
  const t = useTranslations("Dashboard.commandCenter");
  return (
    <span
      className={`flex items-center gap-2 text-sm font-medium text-[var(--tott-muted)] ${className ?? ""}`}
    >
      <span className="text-[var(--tott-dash-positive)]">
        <ActivityIcon />
      </span>
      {t("lastUpdated")}
    </span>
  );
}
