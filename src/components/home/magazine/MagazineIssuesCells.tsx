"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HexCover } from "./HexCover";
import { HexPatternBackdrop } from "./HexPatternBackdrop";
import { FirstWordGold } from "./FirstWordGold";

const FALLBACK_IMAGE = "/images/image.png";

/** Full issue shape — mirrors the page's `fetchMagazineIssues` mapping
 *  so the cell grid can show edition, category and a deep link. */
export type MagazineIssueItem = {
  id: string;
  title: string;
  kind?: string | null;
  pageCount?: number | null;
  coverImage?: string | null;
  excerpt?: string | null;
  edition?: string | null;
  category?: string | null;
  publishedAt?: string | null;
  slug?: string | null;
};

export type MagazineIssuesCellsProps = {
  items: MagazineIssueItem[];
  /** How many cells to show before the "View more" link takes over.
   *  Defaults to 8 (two honeycomb rows on desktop). */
  limit?: number;
};

type FilterId = "all" | "articles" | "essays" | "collections" | "slides";

const FILTERS: { id: FilterId; key: string }[] = [
  { id: "all", key: "filterAll" },
  { id: "articles", key: "filterArticles" },
  { id: "essays", key: "filterEssays" },
  { id: "collections", key: "filterCollections" },
  { id: "slides", key: "filterSlides" },
];

function isValidImageUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function formatMonthYear(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function prettify(s: string | null | undefined): string {
  const v = (s ?? "").trim();
  if (!v) return "";
  return v
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Issues, reimagined as a calm honeycomb of cells.
 *
 * Replaces the old book-flip reader (fake page-turn animation + two
 * dense toolbars) with a single, legible idea: each issue is one cell.
 *
 *   ⬡ ⬡ ⬡ ⬡        Covers are hex-clipped (the brand silhouette),
 *   ⬡ ⬡ ⬡ ⬡        muted by default and blooming into full colour on
 *                  hover so the grid stays quiet until you engage it.
 *
 * What the visitor gets, at a glance:
 *  - one eyebrow + heading + one-line subtitle (what this section is),
 *  - light, borderless filter chips (how to narrow it down),
 *  - a clear single CTA per cell ("Read Online →") + a section-level
 *    "View more →".
 *
 * Everything is theme-token driven (works across dark / light / tide)
 * and the layout is a plain responsive grid, so it stacks cleanly to
 * two columns on mobile and survives RTL.
 */
export function MagazineIssuesCells({ items, limit = 8 }: MagazineIssuesCellsProps) {
  const t = useTranslations("Home.magazine.issues");
  const [active, setActive] = useState<FilterId>("all");

  // Staggered entrance — cells fade + rise on mount, one after another.
  // A plain mount flag (no keyframes) keeps it light and respects
  // prefers-reduced-motion via the motion-reduce utilities below.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Flip once on mount to trigger the staggered entrance transition.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (active === "all") return true;
      const kind = (it.kind ?? it.category ?? "").toLowerCase();
      // Filter ids are plural ("articles"); kinds are usually singular.
      return kind === active || `${kind}s` === active;
    });
  }, [items, active]);

  const visible = filtered.slice(0, limit);

  return (
    <section className="relative w-full overflow-hidden">
      {/* Faint honeycomb atmosphere — vertically centred so it sits
          behind the cells (not the header) and reinforces the "cells"
          idea without competing with the content. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 top-32 -z-0"
        style={{ opacity: 0.35 }}
      >
        <HexPatternBackdrop />
      </div>

      <div className="relative z-10 grid w-full gap-8 px-4 sm:gap-10 sm:px-6 md:px-8">
        {/* Header */}
        <header className="flex w-full flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p
              className="mb-2 text-xs font-medium uppercase tracking-[0.18em]"
              style={{ color: "var(--tott-home-eyebrow)" }}
            >
              {t("issuePrefix")}
            </p>
            <h2 className="text-2xl font-medium tracking-tight sm:text-3xl">
              <FirstWordGold raw={t("galleryHeading")} />
            </h2>
            <p
              className="mt-2 max-w-[52ch] text-sm sm:text-[0.95rem]"
              style={{ color: "var(--tott-home-text-muted)" }}
            >
              {t("gallerySubtitle")}
            </p>
          </div>
          <Link
            href="/open-issues"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: "var(--tott-accent-gold)" }}
          >
            {t("viewMore")}
            <span aria-hidden className="inline-block rtl:-scale-x-100">
              →
            </span>
          </Link>
        </header>

        {/* Light, borderless filter chips */}
        <div
          role="group"
          aria-label={t("galleryHeading")}
          className="flex flex-wrap items-center gap-x-5 gap-y-2"
        >
          {FILTERS.map((f) => {
            const isActive = active === f.id;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActive(f.id)}
                className="relative pb-1 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tott-accent-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--tott-home-surface)]"
                style={{
                  color: isActive ? "var(--tott-accent-gold)" : "var(--tott-home-text-muted)",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {t(f.key)}
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-px origin-center transition-transform duration-300"
                  style={{
                    backgroundColor: "var(--tott-accent-gold)",
                    transform: isActive ? "scaleX(1)" : "scaleX(0)",
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Honeycomb grid of issue cells */}
        {visible.length > 0 ? (
          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-10 sm:gap-x-6">
            {visible.map((item, i) => (
              <li
                key={item.id}
                className="max-w-[276px] basis-[calc(50%-0.5rem)] transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none sm:basis-[220px]"
                style={{
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? "translateY(0)" : "translateY(16px)",
                  transitionDelay: `${Math.min(i, 8) * 60}ms`,
                }}
              >
                <IssueCell
                  item={item}
                  readOnlineLabel={t("readOnline")}
                  issuePrefix={t("issuePrefix")}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-12 text-center text-sm" style={{ color: "var(--tott-home-text-muted)" }}>
            {t("noResults")}
          </p>
        )}
      </div>
    </section>
  );
}

function IssueCell({
  item,
  readOnlineLabel,
  issuePrefix,
}: {
  item: MagazineIssueItem;
  readOnlineLabel: string;
  issuePrefix: string;
}) {
  const date = formatMonthYear(item.publishedAt);
  const editionLabel = item.edition ? `${issuePrefix} ${item.edition}` : "";
  const metaTop = [editionLabel, date].filter(Boolean).join(" · ");
  const tag = prettify(item.category ?? item.kind ?? "");
  const href = item.slug ? `/magazine-issues/${encodeURIComponent(item.slug)}` : "/open-issues";
  const imgSrc = isValidImageUrl(item.coverImage) ? item.coverImage : FALLBACK_IMAGE;

  return (
    <Link
      href={href}
      aria-label={`${item.title}${metaTop ? ` — ${metaTop}` : ""}`}
      className="group flex w-full flex-col items-center rounded-2xl outline-none transition-transform duration-300 ease-out hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-[var(--tott-accent-gold)] focus-visible:ring-offset-4 focus-visible:ring-offset-[var(--tott-home-surface)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <HexCover src={imgSrc} alt={item.title} showFade interactive />

      <div
        className="flex w-full flex-col items-center text-center"
        style={{ padding: "16px 12px 0", gap: 6 }}
      >
        {metaTop ? (
          <p className="text-xs" style={{ color: "var(--tott-home-text-heading)", margin: 0 }}>
            {metaTop}
          </p>
        ) : null}

        <h3
          className="text-base font-medium leading-snug tracking-tight transition-colors duration-300 group-hover:[color:var(--tott-accent-gold)]"
          style={{ color: "var(--tott-home-text-strong)", margin: 0 }}
        >
          {item.title}
        </h3>

        {tag ? (
          <p className="text-xs" style={{ color: "var(--tott-home-text-muted)", margin: 0 }}>
            {tag}
          </p>
        ) : null}

        <span
          className="mt-1 inline-flex items-center gap-1.5 text-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:opacity-100"
          style={{ color: "var(--tott-accent-gold)" }}
        >
          {readOnlineLabel}
          <span aria-hidden className="inline-block rtl:-scale-x-100">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
