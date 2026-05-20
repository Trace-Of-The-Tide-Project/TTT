"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useMagazineIssues } from "@/hooks/queries/magazine-issues";
import {
  SearchIcon,
  ChevronLeftLargeIcon,
  ChevronRightLargeIcon,
} from "@/components/ui/icons";
import { FirstWordGold } from "./FirstWordGold";

// Pre-rendered book spread (1132×802 ≈ 5/3.55 aspect, transparent
// background outside the rounded rectangle, soft spine highlight built
// in). The page-flip overlay renders on top.
const BOOK_IMAGE = "/images/home/Book.png";

type FilterId = "all" | "articles" | "essays" | "collections" | "slides";

const FILTERS: { id: FilterId; key: string }[] = [
  { id: "all", key: "filterAll" },
  { id: "articles", key: "filterArticles" },
  { id: "essays", key: "filterEssays" },
  { id: "collections", key: "filterCollections" },
  { id: "slides", key: "filterSlides" },
];

// Theme tokens — adapt to dark/light via globals.css.
const TAB_BG = "var(--tott-panel-bg)";
const TAB_BORDER = "var(--tott-card-border)";
const TAB_ACTIVE = "var(--tott-accent-gold)";
const TAB_INACTIVE_TEXT = "var(--tott-home-text-muted)";

// The book spread is a static brand asset; the page-flip animation is
// cosmetic (we don't have per-page artwork yet). Real-data parts of
// this pane are the search/filter/sort controls + the issue list.
const FLIP_MS = 700;
// Fallback page count used only when the active issue has no
// `page_count` field — keeps the indicator from reading 0/0.
const DEMO_FALLBACK_TOTAL_PAGES = 128;
const DEMO_INITIAL_PAGE = 1;

/**
 * One row of the Issues list. Maps from `MagazineIssue` in the
 * service. Anything that drives the UI (heading, filter, indicator)
 * lives in this shape so the component stays decoupled from the API
 * type.
 */
export type MagazineIssueItem = {
  id: string;
  title: string;
  /** Maps to the filter chips: "articles" | "essays" | "collections"
   * | "slides" | other. Items with an unknown kind still appear under
   * the "all" filter. */
  kind?: string | null;
  pageCount?: number | null;
  coverImage?: string | null;
  excerpt?: string | null;
};

export type MagazineIssuesProps = {
  /** Pass an empty array to hide the section entirely. */
  items: MagazineIssueItem[];
};

/**
 * Issues pane — search/filter chrome over the live magazine-issues
 * list, with a stylized book-spread reader as the centrepiece.
 *
 *  Header: heading + subtitle + "View more →"
 *  Toolbar: search input | filter chips (kind) | sort by | filters
 *  Reader: chamfered white spread (two-page) with prev/next chevrons
 *  Footer toolbar: page indicator + view/zoom/fullscreen/share/more
 *
 * Real-data parts:
 *  - `items` filters by chip selection + search query.
 *  - The currently-shown issue (the first item under the active
 *    filter + search) drives the reader's title overlay and page
 *    count indicator.
 *
 * Stylized parts (not data-driven):
 *  - The book spread image and the page-flip animation. We don't
 *    have per-page artwork yet.
 */
export function MagazineIssues({ items }: MagazineIssuesProps) {
  const t = useTranslations("Home.magazine.issues");
  const [active, setActive] = useState<FilterId>("all");
  const [query, setQuery] = useState("");

  // Debounce the search box so we don't fire a request per keystroke.
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(id);
  }, [query]);

  // Server-side search: once the user types, query the backend with
  // `?search=` so results aren't limited to the first page the page
  // server-fetched. Kind chips stay client-side because the
  // chip→kind mapping (plural id vs singular kind) is fuzzy and the
  // backend's `kind` filter semantics aren't guaranteed. When there's
  // no query we show the SSR `items` the page passed in.
  const hasQuery = debouncedQuery.length > 0;
  const { data: searchResults } = useMagazineIssues(
    { status: "published", search: debouncedQuery, limit: 20 },
    { enabled: hasQuery },
  );

  const source: MagazineIssueItem[] = useMemo(() => {
    if (!hasQuery) return items;
    return (searchResults ?? []).map((it) => ({
      id: it.id,
      title: it.title,
      kind: it.kind ?? null,
      pageCount: it.page_count ?? null,
      coverImage: it.cover_image ?? null,
      excerpt: it.excerpt ?? null,
    }));
  }, [hasQuery, items, searchResults]);

  // Narrow the active source by the kind chip only — search is already
  // applied server-side (or, for the no-query case, there's nothing to
  // search). Memoized so `currentIssue` doesn't recompute every render.
  const filtered = useMemo(() => {
    return source.filter((it) => {
      if (active !== "all") {
        const kind = (it.kind ?? "").toLowerCase();
        // Filter ids are plural ("articles"); kinds are usually
        // singular ("article"). Allow both.
        if (kind !== active && `${kind}s` !== active) return false;
      }
      return true;
    });
  }, [source, active]);

  // The reader shows the first match — a "now reading" preview.
  const currentIssue = filtered[0] ?? items[0] ?? null;
  const totalPages =
    currentIssue?.pageCount && currentIssue.pageCount > 0
      ? currentIssue.pageCount
      : DEMO_FALLBACK_TOTAL_PAGES;

  // Page-flip state — `flipping` is set when an animation starts; the
  // `flipPhase` then transitions from "start" (rotateY 0) to "end"
  // (rotateY ±180) one frame later, so the CSS transition actually fires.
  const [currentPage, setCurrentPage] = useState(DEMO_INITIAL_PAGE);
  const [flipping, setFlipping] = useState<"next" | "prev" | null>(null);
  const [flipPhase, setFlipPhase] = useState<"start" | "end">("start");
  const flipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // When the user changes filter/search and the issue itself changes,
  // reset the page indicator so we don't show e.g. "page 16/24" on a
  // different shorter issue.
  useEffect(() => {
    setCurrentPage(DEMO_INITIAL_PAGE);
  }, [currentIssue?.id]);

  useEffect(() => {
    return () => {
      if (flipTimer.current) clearTimeout(flipTimer.current);
    };
  }, []);

  // After flipping mounts the overlay at rotation 0, push it to ±180 on
  // the next animation frame so the CSS transition runs.
  useEffect(() => {
    if (!flipping) return;
    setFlipPhase("start");
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setFlipPhase("end"));
    });
    return () => cancelAnimationFrame(raf);
  }, [flipping]);

  const goNext = () => {
    if (flipping || currentPage + 2 > totalPages) return;
    setFlipping("next");
    flipTimer.current = setTimeout(() => {
      setCurrentPage((p) => Math.min(p + 2, totalPages));
      setFlipping(null);
      setFlipPhase("start");
    }, FLIP_MS);
  };

  const goPrev = () => {
    if (flipping || currentPage - 2 < 1) return;
    setFlipping("prev");
    flipTimer.current = setTimeout(() => {
      setCurrentPage((p) => Math.max(p - 2, 1));
      setFlipping(null);
      setFlipPhase("start");
    }, FLIP_MS);
  };

  // The Issues pane always renders — the book-spread reader is a
  // brand visual, not driven by data. The list below the search/
  // filters is what's empty when `items` is empty.

  return (
    <div className="grid w-full min-w-0 gap-8 px-4 sm:gap-10 sm:px-6 md:px-8">
      {/* Header — full width of the section, so the heading's left
          edge sits at the same x-coordinate as Latest Published. */}
      <header className="flex w-full flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            className="text-lg font-medium tracking-tight sm:text-xl"
            style={{ color: "var(--tott-home-text-strong)" }}
          >
            <FirstWordGold raw={t("galleryHeading")} />
          </h2>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--tott-home-text-muted)" }}
          >
            {t("gallerySubtitle")}
          </p>
        </div>
        <Link
          href="/open-issues"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-90"
          style={{ color: "var(--tott-accent-gold)" }}
        >
          {t("viewMore")}
          <span aria-hidden>→</span>
        </Link>
      </header>

      {/* Toolbar — search input + filter chips + sort + filters.
          Wrapped in the same outer (sm:px-12 lg:px-16) + inner
          (mx-auto max-w-6xl) bounds as the book reader below, so the
          search bar's left edge sits exactly at the book's left edge
          on every viewport. */}
      <div className="w-full sm:px-12 lg:px-16">
        <div
          className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-12 gap-y-3"
        >
          {/* Search input */}
          <label
            className="flex h-10 min-w-[220px] flex-1 items-center gap-2 rounded-lg sm:max-w-[338px] focus-within:ring-2 focus-within:ring-[var(--tott-accent-gold)] focus-within:ring-offset-0"
            style={{
              backgroundColor: TAB_BG,
              border: `1px solid ${TAB_BORDER}`,
              padding: "8px",
            }}
          >
            <span
              className="flex h-6 w-7 items-center justify-center"
              style={{ color: TAB_INACTIVE_TEXT }}
            >
              <SearchIcon />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full bg-transparent text-sm leading-5 outline-none focus:outline-none focus:ring-0"
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                letterSpacing: "-0.005em",
                color: "var(--tott-home-text-strong)",
                border: "none",
                boxShadow: "none",
                appearance: "none",
                WebkitAppearance: "none",
              }}
            />
          </label>

          {/* Kind filter chips — functional client-side narrowing. */}
          <div className="flex flex-wrap items-center gap-2">
            {FILTERS.map((f) => (
              <FilterChip
                key={f.id}
                label={t(f.key)}
                active={active === f.id}
                onClick={() => setActive(f.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Now-reading caption — pulls from the active filtered issue
          so the user can tell which record the reader is previewing.
          Hidden when the filter+search returned 0 results AND the
          fallback (items[0]) is also missing — but `items.length > 0`
          guard above ensures there is always at least one. */}
      {currentIssue ? (
        <div
          className="mx-auto w-full sm:px-12 lg:px-16"
          aria-live="polite"
        >
          <p
            className="mx-auto max-w-6xl text-center text-sm"
            style={{ color: "var(--tott-home-text-muted)" }}
          >
            {currentIssue.title}
          </p>
        </div>
      ) : null}

      {/* Reader — book spread w/ realistic page-flip animation. The
          turning page rotates around the spine using CSS 3D transforms;
          the static pages stay in place underneath.

          Note: the book content is currently a single static PNG; the
          flip overlay is cosmetic. Once real spread data lands the
          overlay should snap to the new spread. */}
      <div className="relative mx-auto w-full sm:px-12 lg:px-16">
        <button
          type="button"
          onClick={goPrev}
          disabled={flipping !== null || currentPage - 2 < 1}
          aria-label={t("previousPage")}
          className="absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 transition-opacity hover:opacity-70 disabled:opacity-30 sm:block focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--tott-accent-gold)]"
          style={{ color: "var(--tott-home-text-strong)" }}
        >
          <ChevronLeftLargeIcon />
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={flipping !== null || currentPage + 2 > totalPages}
          aria-label={t("nextPage")}
          className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 transition-opacity hover:opacity-70 disabled:opacity-30 sm:block focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--tott-accent-gold)]"
          style={{ color: "var(--tott-home-text-strong)" }}
        >
          <ChevronRightLargeIcon />
        </button>

        <div
          className="relative mx-auto w-full max-w-6xl"
          style={{ perspective: "2000px" }}
        >
          <div
            className="relative w-full"
            style={{
              aspectRatio: "1132 / 802",
              transformStyle: "preserve-3d",
            }}
          >
            <Image
              src={BOOK_IMAGE}
              alt=""
              fill
              priority={false}
              sizes="(min-width: 1280px) 1152px, 100vw"
              className="select-none object-contain"
              draggable={false}
            />

            {flipping !== null && (() => {
              const target = flipping === "next" ? -180 : 180;
              const rotation = flipPhase === "end" ? target : 0;
              return (
                <div
                  aria-hidden
                  className="pointer-events-none absolute top-0 z-10 h-full"
                  style={{
                    width: "50%",
                    left: flipping === "next" ? "50%" : "0%",
                    transformOrigin:
                      flipping === "next" ? "left center" : "right center",
                    transform: `rotateY(${rotation}deg)`,
                    transition: `transform ${FLIP_MS}ms cubic-bezier(0.45, 0.05, 0.55, 0.95)`,
                    transformStyle: "preserve-3d",
                    backgroundColor: "#ffffff",
                    borderRadius:
                      flipping === "next"
                        ? "0 24px 24px 0"
                        : "24px 0 0 24px",
                    boxShadow:
                      flipping === "next"
                        ? "inset 8px 0 16px -8px rgba(0,0,0,0.15), -10px 0 20px rgba(0,0,0,0.18)"
                        : "inset -8px 0 16px -8px rgba(0,0,0,0.15), 10px 0 20px rgba(0,0,0,0.18)",
                  }}
                />
              );
            })()}
          </div>
        </div>
      </div>

      {/* Bottom toolbar — capsule with paging + view controls. */}
      <div
        className="mx-auto flex w-full max-w-[542px] flex-nowrap items-center justify-start overflow-x-auto sm:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          height: "64px",
          padding: "0 16px",
          backgroundColor: TAB_BG,
          borderRadius: "32px",
          border: "1px solid var(--tott-card-border)",
          gap: "16px",
          columnGap: "clamp(12px, 3vw, 24px)",
        }}
      >
        <div className="flex items-center" style={{ gap: "16px" }}>
          <button
            type="button"
            onClick={goPrev}
            disabled={flipping !== null || currentPage - 2 < 1}
            aria-label={t("previousPage")}
            className="flex h-6 w-6 items-center justify-center transition-opacity hover:opacity-80 disabled:opacity-40 [&>svg]:h-6 [&>svg]:w-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--tott-accent-gold)]"
            style={{ color: TAB_INACTIVE_TEXT }}
          >
            <ChevronLeftLargeIcon />
          </button>
          <span
            className="flex items-center"
            style={{
              gap: "4px",
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.005em",
            }}
          >
            <span style={{ color: "var(--tott-home-text-strong)" }}>{currentPage}</span>
            <span style={{ color: TAB_INACTIVE_TEXT }}>/</span>
            <span style={{ color: TAB_INACTIVE_TEXT }}>{totalPages}</span>
          </span>
          <button
            type="button"
            onClick={goNext}
            disabled={flipping !== null || currentPage + 2 > totalPages}
            aria-label={t("nextPage")}
            className="flex h-6 w-6 items-center justify-center transition-opacity hover:opacity-80 disabled:opacity-40 [&>svg]:h-6 [&>svg]:w-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--tott-accent-gold)]"
            style={{ color: TAB_INACTIVE_TEXT }}
          >
            <ChevronRightLargeIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Toolbar chip used for filter tabs and the sort/filter buttons.
 *
 * - Width comes from intrinsic content + padding instead of fixed pixel
 *   targets, so translated labels (Arabic / French / Spanish) don't
 *   overflow or clip.
 * - Active state keeps the 1px border and adds an inset gold ring,
 *   instead of swapping border width 1→2 (which shifts the label by
 *   1px on activation under box-sizing: border-box).
 * - Passes through focus-visible so keyboard users see a focus ring.
 */
function FilterChip({
  label,
  icon,
  active = false,
  onClick,
}: {
  label: React.ReactNode;
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center justify-center whitespace-nowrap focus-visible:outline-none"
      style={{
        padding: "10px 12px",
        gap: "8px",
        minWidth: "64px",
        backgroundColor: TAB_BG,
        border: `1px solid ${active ? TAB_ACTIVE : TAB_BORDER}`,
        boxShadow: active ? `inset 0 0 0 1px ${TAB_ACTIVE}` : undefined,
        borderRadius: "8px",
        fontFamily: "'Inter', var(--font-sans, sans-serif)",
        fontWeight: 500,
        fontSize: "14px",
        lineHeight: "20px",
        letterSpacing: "-0.005em",
        color: active ? TAB_ACTIVE : TAB_INACTIVE_TEXT,
      }}
      aria-pressed={onClick ? active : undefined}
    >
      {icon ? <span style={{ color: TAB_INACTIVE_TEXT }}>{icon}</span> : null}
      <span className="inline-flex items-center">{label}</span>
    </button>
  );
}
