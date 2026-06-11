"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDownIcon, CalendarIcon } from "@/components/ui/icons";
import { theme } from "@/lib/theme";
import { CollectionTimelineRow } from "./CollectionTimelineRow";
import type { CollectionBucket } from "@/lib/content/collection-buckets";

const TITLE_KEY: Record<CollectionBucket["key"], string> = {
  past: "sectionPast",
  current: "sectionCurrent",
  future: "sectionFuture",
};

const INITIAL_VISIBLE = 5;

export function CollectionTimelineSection({
  bucket,
  defaultOpen,
}: {
  bucket: CollectionBucket;
  defaultOpen: boolean;
}) {
  const t = useTranslations("Collections");
  const [open, setOpen] = useState(defaultOpen);
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? bucket.items : bucket.items.slice(0, INITIAL_VISIBLE);
  const hasMore = bucket.items.length > INITIAL_VISIBLE;

  const rangeLabel =
    bucket.fromYear != null && bucket.toYear != null
      ? t("dateRange", { from: bucket.fromYear, to: bucket.toYear })
      : t("dateRangeEmpty");

  return (
    <section
      className="rounded-2xl border"
      style={{ borderColor: theme.cardBorder, backgroundColor: theme.homeSurface }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={open}
      >
        <span>
          <span className="block text-base font-medium text-foreground">
            {t(TITLE_KEY[bucket.key])}
          </span>
          <span className="mt-1 flex items-center gap-1.5 text-xs text-[var(--tott-muted)]">
            <CalendarIcon />
            {rangeLabel}
          </span>
        </span>
        <span
          className="shrink-0 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "none", color: "var(--tott-muted)" }}
        >
          <ChevronDownIcon />
        </span>
      </button>

      {open && (
        <div className="px-6 pb-6">
          {bucket.items.length === 0 ? (
            <p className="py-4 text-sm text-[var(--tott-muted)]">{t("sectionEmpty")}</p>
          ) : (
            <>
              <ul className="border-t pt-4" style={{ borderColor: theme.cardBorder }}>
                {visible.map((item, i) => (
                  <CollectionTimelineRow
                    key={item.id}
                    item={item}
                    isLast={i === visible.length - 1}
                  />
                ))}
              </ul>
              <div className="mt-2 flex items-center justify-between text-xs text-[var(--tott-muted)]">
                <span>
                  {t("itemCounter", { shown: visible.length, total: bucket.items.length })}
                </span>
                {hasMore && (
                  <button
                    type="button"
                    onClick={() => setShowAll((v) => !v)}
                    className="font-medium hover:underline"
                    style={{ color: theme.accentGold }}
                  >
                    {showAll ? t("showLess") : t("showMore")}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
