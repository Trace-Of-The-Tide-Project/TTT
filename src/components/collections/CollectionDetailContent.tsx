"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { ShareYourStory } from "@/components/contribute/ShareYourStory";
import { ContentBreadcrumb } from "@/components/content/related/ContentBreadcrumb";
import { PlusIcon } from "@/components/ui/icons";
import { theme } from "@/lib/theme";
import { bucketByYear, type CollectionRowItem } from "@/lib/content/collection-buckets";
import {
  CollectionFilterBar,
  type ContentFilter,
  type SortOrder,
} from "./CollectionFilterBar";
import { CollectionTimelineSection } from "./CollectionTimelineSection";

export type CollectionDetailViewModel = {
  id: string;
  name: string;
  description: string;
  coverImage: string | null;
  items: CollectionRowItem[];
  /** Year used for bucketing (passed from server so SSR/CSR agree). */
  currentYear: number;
};

export function CollectionDetailContent({ collection }: { collection: CollectionDetailViewModel }) {
  const t = useTranslations("Collections");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ContentFilter>("all");
  const [sort, setSort] = useState<SortOrder>("newest");

  const buckets = useMemo(() => {
    let items = collection.items;

    if (filter !== "all") {
      items = items.filter((i) => (i.contentType ?? "article").toLowerCase() === filter);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(q) || i.excerpt.toLowerCase().includes(q),
      );
    }
    const sorted = [...items].sort((a, b) => {
      const ta = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const tb = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return sort === "newest" ? tb - ta : ta - tb;
    });

    return bucketByYear(sorted, collection.currentYear);
  }, [collection.items, collection.currentYear, filter, search, sort]);

  const totalVisible = buckets.reduce((n, b) => n + b.items.length, 0);

  const defaultOpenKey = useMemo(() => {
    const current = buckets.find((b) => b.key === "current");
    if (current && current.items.length) return "current";
    const largest = [...buckets]
      .filter((b) => b.items.length)
      .sort((a, b) => b.items.length - a.items.length)[0];
    return largest?.key ?? "current";
  }, [buckets]);

  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: theme.homeSurface }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-35 overflow-hidden"
        style={{ opacity: "var(--tott-dash-hex-opacity, 1)" }}
      >
        <HexBackground />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-24 sm:px-10 sm:pt-28">
        <ContentBreadcrumb
          items={[
            { label: t("breadcrumbRoot"), href: "/collections" },
            { label: collection.name },
          ]}
        />

        {/* Cover */}
        <div
          className="mt-6 overflow-hidden rounded-2xl border"
          style={{ borderColor: theme.cardBorder }}
        >
          <div className="relative aspect-[1392/483] w-full bg-[var(--tott-well-bg)]">
            {collection.coverImage && (
              <Image
                src={collection.coverImage}
                alt={collection.name}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            )}
          </div>
        </div>

        {/* Header row */}
        <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-medium">
              <span className="text-foreground">{t("breadcrumbRoot")} </span>
              <span style={{ color: theme.accentGold }}>{collection.name}</span>
            </h1>
            {collection.description && (
              <p className="mt-2 max-w-2xl text-sm text-[var(--tott-muted)]">
                {collection.description}
              </p>
            )}
          </div>
          <Link
            href="/contribute"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-black"
            style={{ backgroundColor: theme.accentGold }}
          >
            <PlusIcon />
            {t("contribute")}
          </Link>
        </div>

        {/* Filter bar */}
        <div className="mt-8">
          <CollectionFilterBar
            search={search}
            onSearch={setSearch}
            filter={filter}
            onFilter={setFilter}
            sort={sort}
            onSort={setSort}
          />
        </div>

        {/* Sections */}
        <div className="mt-6 flex flex-col gap-4 pb-12">
          {totalVisible === 0 ? (
            <p
              className="rounded-2xl border p-8 text-center text-sm"
              style={{ borderColor: theme.cardBorder, color: "var(--tott-muted)" }}
            >
              {t("allEmpty")}
            </p>
          ) : (
            buckets.map((b) => (
              <CollectionTimelineSection
                key={b.key}
                bucket={b}
                defaultOpen={b.key === defaultOpenKey}
              />
            ))
          )}
        </div>
      </div>

      <ShareYourStory />
    </div>
  );
}
