"use client";

import { useTranslations } from "next-intl";
import { SearchIcon, ChevronDownIcon } from "@/components/ui/icons";
import { theme } from "@/lib/theme";

export type ContentFilter = "all" | "article" | "video" | "audio" | "figma";
export type SortOrder = "newest" | "oldest";

const CHIPS: { id: ContentFilter; key: string }[] = [
  { id: "all", key: "filterShowAll" },
  { id: "article", key: "filterArticles" },
  { id: "video", key: "filterVideos" },
  { id: "audio", key: "filterAudio" },
  { id: "figma", key: "filterSlides" },
];

export function CollectionFilterBar({
  search,
  onSearch,
  filter,
  onFilter,
  sort,
  onSort,
}: {
  search: string;
  onSearch: (v: string) => void;
  filter: ContentFilter;
  onFilter: (v: ContentFilter) => void;
  sort: SortOrder;
  onSort: (v: SortOrder) => void;
}) {
  const t = useTranslations("Collections");

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      {/* Search */}
      <label
        className="flex w-full items-center gap-2 rounded-lg border px-4 py-2.5 lg:max-w-xs"
        style={{ borderColor: theme.cardBorder, backgroundColor: "var(--tott-well-bg)" }}
      >
        <span className="text-[var(--tott-muted)]">
          <SearchIcon />
        </span>
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={t("detailSearchPlaceholder")}
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-[var(--tott-muted)]"
        />
      </label>

      {/* Chips */}
      <div className="flex flex-wrap items-center gap-2">
        {CHIPS.map((c) => {
          const active = filter === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onFilter(c.id)}
              className="rounded-md border px-3 py-1.5 text-sm transition-colors"
              style={{
                borderColor: active ? theme.accentGold : theme.cardBorder,
                color: active ? theme.accentGold : "var(--foreground)",
                backgroundColor: active ? "var(--tott-dash-ghost-hover)" : "transparent",
              }}
            >
              {t(c.key)}
            </button>
          );
        })}
      </div>

      {/* Sort + Filters */}
      <div className="flex items-center gap-2">
        <label
          className="flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: theme.cardBorder, backgroundColor: "var(--tott-well-bg)" }}
        >
          <span className="text-[var(--tott-muted)]">{t("sortLabel")}</span>
          <select
            value={sort}
            onChange={(e) => onSort(e.target.value as SortOrder)}
            className="bg-transparent text-foreground outline-none"
          >
            <option value="newest">{t("sortNewest")}</option>
            <option value="oldest">{t("sortOldest")}</option>
          </select>
          <span className="text-[var(--tott-muted)]">
            <ChevronDownIcon />
          </span>
        </label>
        {/* Filters button — visual-only placeholder for v1 */}
        <button
          type="button"
          disabled
          className="rounded-lg border px-3 py-2 text-sm text-[var(--tott-muted)] opacity-70"
          style={{ borderColor: theme.cardBorder }}
        >
          {t("filtersButton")}
        </button>
      </div>
    </div>
  );
}
