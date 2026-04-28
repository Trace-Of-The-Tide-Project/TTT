"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Grid2x2Icon, CalendarIcon } from "@/components/ui/icons";
import { theme } from "@/lib/theme";

type CollectionItem = {
  image: string;
  title: string;
  author: string;
  date: string;
  description: string;
};

type ContentCollectionProps = {
  articleCount: number;
  duration: string;
  items: CollectionItem[];
  visibleCount?: number;
};

export function ContentCollection({
  articleCount,
  duration,
  items,
  visibleCount = 5,
}: ContentCollectionProps) {
  const t = useTranslations("Content");
  const [showAll, setShowAll] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);
  const visible = showAll ? items : items.slice(0, visibleCount);

  return (
    <div
      className="rounded-xl border p-4"
      style={{ backgroundColor: theme.pageBackground, borderColor: theme.cardBorder }}
    >
      <h3 className="text-lg font-bold text-foreground">{t("collectionTitle")}</h3>
      <p className="mt-0.5 text-sm text-[var(--tott-muted)]">
        {t("articlesCount", { count: articleCount })} • {duration} {t("ofContent")}
      </p>

      <ul className="-ml-4 mt-4 space-y-3">
        {visible.map((item, i) => {
          const isSelected = selectedIndex === i;
          return (
            <li
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedIndex(i)}
              onKeyDown={(e) => e.key === "Enter" && setSelectedIndex(i)}
              className="flex cursor-pointer gap-3 rounded-lg transition-colors hover:bg-[var(--tott-dash-ghost-hover)]"
            >
              <div
                className="h-full min-h-16 w-0.5 shrink-0 self-stretch rounded-full"
                style={{
                  backgroundColor: isSelected ? theme.accentGoldFocus : "transparent",
                }}
              />
              <div
                className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-[var(--tott-well-bg)]"
                style={{
                  borderColor: isSelected ? theme.accentGoldFocus : "var(--tott-card-border)",
                }}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
                <div className="absolute left-1.5 top-1.5 text-white">
                  <Grid2x2Icon />
                </div>
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p
                  className="truncate text-sm font-medium"
                  style={{ color: isSelected ? theme.accentGoldFocus : "var(--foreground)" }}
                >
                  {item.title}
                </p>
                <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[var(--tott-muted)]">
                  <span className="flex min-w-0 shrink items-center gap-1.5">
                    <span
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ backgroundColor: "#C9A96E", color: "#1a1a1a" }}
                    >
                      {item.author.charAt(0).toUpperCase()}
                    </span>
                    <span className="truncate">{item.author}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1 text-[var(--tott-muted)]">
                    <CalendarIcon />
                    <span className="truncate">{item.date}</span>
                  </span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[var(--tott-muted)]">
                  {item.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex items-center justify-between text-xs text-[var(--tott-muted)]">
        <span>
          {Math.min(visible.length, items.length)}/{items.length}
        </span>
        {items.length > visibleCount && (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="font-medium hover:underline"
            style={{ color: theme.accentGold }}
          >
            {showAll ? t("showLess") : t("showMore")}
          </button>
        )}
      </div>
    </div>
  );
}
