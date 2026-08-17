"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SearchIcon } from "@/components/ui/icons";

// Must match backend CONTENT_TYPES (backend/src/enums/content-type.enum.ts) —
// the archive-query DTO rejects anything else via forbidNonWhitelisted.
const TYPE_OPTIONS = ["all", "article", "audio", "video", "opinion"] as const;
const LANGUAGE_OPTIONS = ["all", "en", "ar", "es", "fr"] as const;

type ArchiveFacetsProps = {
  routePath: string;
  search?: string;
  contentType?: string;
  language?: string;
};

/**
 * Client-side facet controls for /archive. Pushes every change into the URL
 * (searchParams) rather than local state — the RSC page reads searchParams
 * and refetches, so archive URLs stay shareable/bookmarkable.
 */
export function ArchiveFacets({ routePath, search, contentType, language }: ArchiveFacetsProps) {
  const t = useTranslations("Content");
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(search ?? "");

  // Debounce the search box before it pushes a new URL/refetch.
  useEffect(() => {
    const id = setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed === (search ?? "")) return;
      pushQuery({ search: trimmed || undefined });
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  function pushQuery(next: Record<string, string | undefined>) {
    const query: Record<string, string> = {
      ...(search ? { search } : {}),
      ...(contentType && contentType !== "all" ? { content_type: contentType } : {}),
      ...(language && language !== "all" ? { language } : {}),
    };
    for (const [key, value] of Object.entries(next)) {
      if (value === undefined) delete query[key];
      else query[key] = value;
    }
    router.push({ pathname: routePath, query });
  }

  return (
    <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
      <div
        className="flex flex-1 items-center gap-2 rounded-xl border px-4 py-2.5"
        style={{
          borderColor: "color-mix(in srgb, var(--tott-salt) 25%, transparent)",
          backgroundColor: "var(--tott-elevated)",
        }}
      >
        <span aria-hidden style={{ color: "var(--tott-salt)" }}>
          <SearchIcon />
        </span>
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={t("archive.searchPlaceholder")}
          aria-label={t("archive.searchPlaceholder")}
          className="w-full border-0 bg-transparent p-0 text-sm outline-none focus:ring-0"
          style={{ color: "var(--tott-home-text-strong)" }}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <SegmentedControl
          ariaLabel={t("archive.filterType")}
          value={contentType ?? "all"}
          onChange={(id) => pushQuery({ content_type: id === "all" ? undefined : id })}
          options={TYPE_OPTIONS.map((id) => ({
            id,
            label: t(`archive.type${id.charAt(0).toUpperCase()}${id.slice(1)}`),
          }))}
        />
        <SegmentedControl
          ariaLabel={t("archive.filterLanguage")}
          value={language ?? "all"}
          onChange={(id) => pushQuery({ language: id === "all" ? undefined : id })}
          options={LANGUAGE_OPTIONS.map((id) => ({
            id,
            label: t(`archive.language${id.charAt(0).toUpperCase()}${id.slice(1)}`),
          }))}
        />
      </div>
    </div>
  );
}
