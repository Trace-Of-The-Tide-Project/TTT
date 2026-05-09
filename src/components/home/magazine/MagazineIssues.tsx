"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  SearchIcon,
  FilterIcon,
  FullscreenIcon,
  ShareIcon,
  MoreDotsIcon,
  Grid2x2Icon,
} from "@/components/ui/icons";
import { FirstWordGold } from "./FirstWordGold";

// Pre-rendered book spread (1132×802 ≈ 5/3.55 aspect, transparent
// background outside the rounded rectangle, soft spine highlight built
// in). The page-flip overlay renders on top.
const BOOK_IMAGE = "/images/home/Book.png";

type FilterId = "all" | "articles" | "essays" | "collections" | "slides";

// Figma spec: each filter tab is a fixed pixel width — Show all 80,
// Articles 75, Essays 71, Collections 99, Slides 65.
const FILTERS: { id: FilterId; key: string; width: number }[] = [
  { id: "all", key: "filterAll", width: 80 },
  { id: "articles", key: "filterArticles", width: 75 },
  { id: "essays", key: "filterEssays", width: 71 },
  { id: "collections", key: "filterCollections", width: 99 },
  { id: "slides", key: "filterSlides", width: 65 },
];

// Figma colors (hard-coded so we exactly match the comp regardless of
// what the project tokens evaluate to).
// Theme tokens — adapt to dark/light via globals.css.
const TAB_BG = "var(--tott-panel-bg)";
const TAB_BORDER = "var(--tott-card-border)";
const TAB_ACTIVE = "var(--tott-accent-gold)";
const TAB_INACTIVE_TEXT = "var(--tott-home-text-muted)";
const TAB_PLACEHOLDER = "var(--tott-home-text-muted)";

/**
 * Issues pane — Visual Gallery with a book/spread reader.
 *
 *  Header: heading + subtitle + "View more →"
 *  Toolbar: search input | filter chips | sort by | filters
 *  Reader: chamfered white spread (two-page) with prev/next chevrons floating
 *          on the sides.
 *  Footer toolbar: page indicator + view/zoom/fullscreen/share/more controls.
 */
const TOTAL_PAGES = 128;
const FLIP_MS = 700;

export function MagazineIssues() {
  const t = useTranslations("Home.magazine.issues");
  const [active, setActive] = useState<FilterId>("all");

  // Page-flip state — `flipping` is set when an animation starts; the
  // `flipPhase` then transitions from "start" (rotateY 0) to "end"
  // (rotateY ±180) one frame later, so the CSS transition actually fires.
  const [currentPage, setCurrentPage] = useState(16);
  const [flipping, setFlipping] = useState<"next" | "prev" | null>(null);
  const [flipPhase, setFlipPhase] = useState<"start" | "end">("start");
  const flipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      // Two RAFs to make sure the browser has committed the initial style
      // before we change it (avoids the "starts at end state" jump).
      requestAnimationFrame(() => setFlipPhase("end"));
    });
    return () => cancelAnimationFrame(raf);
  }, [flipping]);

  const goNext = () => {
    if (flipping || currentPage + 2 > TOTAL_PAGES) return;
    setFlipping("next");
    flipTimer.current = setTimeout(() => {
      setCurrentPage((p) => Math.min(p + 2, TOTAL_PAGES));
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
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-90"
          style={{ color: "var(--tott-accent-gold)" }}
        >
          {t("viewMore")}
          <span aria-hidden>→</span>
        </button>
      </header>

      {/* Toolbar — Figma "Frame 280": search input + filters group with
          a 48px gap between them. Internal gaps: 8px between filter
          tabs, 16px between the chips group / divider / sort+filters
          group. All hard-coded to match the spec exactly.

          Wrapped in the same outer (sm:px-12 lg:px-16) + inner
          (mx-auto max-w-6xl) bounds as the book reader below, so the
          search bar's left edge sits exactly at the book's left edge
          on every viewport. */}
      <div className="w-full sm:px-12 lg:px-16">
      <div
        className="mx-auto flex w-full max-w-6xl flex-wrap items-center"
        style={{ gap: "48px" }}
      >
        {/* Search input — 338×40, fill TAB_BG, 1px TAB_BORDER, 8px radius. */}
        <label
          className="flex h-10 items-center gap-2 rounded-lg"
          style={{
            backgroundColor: TAB_BG,
            border: `1px solid ${TAB_BORDER}`,
            borderRadius: "8px",
            width: "338px",
            maxWidth: "100%",
            padding: "8px",
          }}
        >
          <span
            className="flex h-6 w-7 items-center justify-center"
            style={{ color: TAB_PLACEHOLDER }}
          >
            <SearchIcon />
          </span>
          <input
            type="search"
            placeholder={t("searchPlaceholder")}
            className="w-full bg-transparent outline-none focus:outline-none focus:ring-0"
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.005em",
              color: "var(--tott-home-text-strong)",
              border: "none",
              boxShadow: "none",
              appearance: "none",
              WebkitAppearance: "none",
            }}
          />
        </label>

        {/* Filters group — chips + divider + sort/filters, gap 16px. */}
        <div className="flex flex-wrap items-center" style={{ gap: "16px" }}>
          {/* Filter chips group — gap 8px. */}
          <div className="flex items-center" style={{ gap: "8px" }}>
            {FILTERS.map((f) => {
              const isActive = active === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActive(f.id)}
                  className="inline-flex items-center justify-center"
                  style={{
                    width: `${f.width}px`,
                    height: "40px",
                    padding: "10px 8px",
                    backgroundColor: TAB_BG,
                    border: `${isActive ? "2px" : "1px"} solid ${
                      isActive ? TAB_ACTIVE : TAB_BORDER
                    }`,
                    borderRadius: "8px",
                    fontFamily: "'Inter', var(--font-sans, sans-serif)",
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: "20px",
                    letterSpacing: "-0.005em",
                    color: isActive ? TAB_ACTIVE : TAB_INACTIVE_TEXT,
                  }}
                  aria-pressed={isActive}
                >
                  {t(f.key)}
                </button>
              );
            })}
          </div>

          {/* Divider — 1×16. */}
          <span
            aria-hidden
            style={{
              width: "0",
              height: "16px",
              borderLeft: `1px solid ${TAB_BORDER}`,
            }}
          />

          {/* Sort + Filters group — gap 8px. */}
          <div className="flex items-center" style={{ gap: "8px" }}>
            {/* Sort by — 186×40 */}
            <button
              type="button"
              className="inline-flex items-center justify-center"
              style={{
                width: "186px",
                height: "40px",
                padding: "10px 8px",
                gap: "8px",
                backgroundColor: TAB_BG,
                border: `1px solid ${TAB_BORDER}`,
                borderRadius: "8px",
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "-0.005em",
                color: TAB_INACTIVE_TEXT,
              }}
            >
              <span style={{ color: TAB_INACTIVE_TEXT }}>
                <SortDescIcon />
              </span>
              <span>{t("sortByLabel")}</span>
              <span style={{ color: "var(--tott-home-text-strong)" }}>
                {t("sortNewest")}
              </span>
            </button>

            {/* Filters — 93×40 */}
            <button
              type="button"
              className="inline-flex items-center justify-center"
              style={{
                width: "93px",
                height: "40px",
                padding: "10px 8px",
                gap: "8px",
                backgroundColor: TAB_BG,
                border: `1px solid ${TAB_BORDER}`,
                borderRadius: "8px",
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "-0.005em",
                color: TAB_INACTIVE_TEXT,
              }}
            >
              <span style={{ color: TAB_INACTIVE_TEXT }}>
                <FilterIcon />
              </span>
              <span>{t("filtersLabel")}</span>
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Reader — book spread w/ realistic page-flip animation. The
          turning page rotates around the spine using CSS 3D transforms;
          the static pages stay in place underneath.

          On mobile the book uses the full width (no side gutters — the
          bottom toolbar handles paging). At sm+ we add horizontal
          padding so the book sits centred with side gutters; the
          arrow buttons live in those gutters instead of on top of the
          book pages. */}
      <div className="relative mx-auto w-full sm:px-12 lg:px-16">
        {/* Side chevrons — hidden on mobile (no room beside the book).
            Positioned inside the side gutter at sm+ where the book is
            inset. */}
        <button
          type="button"
          onClick={goPrev}
          disabled={flipping !== null || currentPage - 2 < 1}
          aria-label={t("previousPage")}
          className="absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 text-2xl transition-opacity hover:opacity-70 disabled:opacity-30 sm:block sm:text-3xl"
          style={{ color: "var(--tott-home-text-strong)" }}
        >
          <span aria-hidden>←</span>
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={flipping !== null || currentPage + 2 > TOTAL_PAGES}
          aria-label={t("nextPage")}
          className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 text-2xl transition-opacity hover:opacity-70 disabled:opacity-30 sm:block sm:text-3xl"
          style={{ color: "var(--tott-home-text-strong)" }}
        >
          <span aria-hidden>→</span>
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
            {/* Pre-rendered book spread (rounded corners, spine
                highlight, white pages — all baked into the PNG). */}
            <Image
              src={BOOK_IMAGE}
              alt=""
              fill
              priority={false}
              sizes="(min-width: 1280px) 1152px, 100vw"
              className="select-none object-contain"
              draggable={false}
            />

            {/* Flipping page — half-width overlay anchored to the
                spine. Mounts at rotateY(0) (phase=start), then
                transitions to ±180° one frame later (phase=end). */}
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

      {/* Breadcrumbs / bottom toolbar — Figma spec:
          542×64 capsule, bg #262626, inset top 1px white at 8%.
          Inside (with 24px caps on each side): Book nav (chev-left, 16/128, chev-right),
          divider, then list / grid / zoom-in / zoom-out / maximize / share / dots-vertical.
          All icons 24×24, gap 24px between items. On screens narrower
          than 542px the toolbar scrolls horizontally so every control
          stays reachable without breaking the capsule shape. */}
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
        {/* Book navigation: chev-left + N/total + chev-right */}
        <div className="flex items-center" style={{ gap: "16px" }}>
          <button
            type="button"
            onClick={goPrev}
            disabled={flipping !== null || currentPage - 2 < 1}
            aria-label={t("previousPage")}
            className="flex h-6 w-6 items-center justify-center transition-opacity hover:opacity-80 disabled:opacity-40 [&>svg]:h-6 [&>svg]:w-6"
            style={{ color: TAB_INACTIVE_TEXT }}
          >
            <ChevronLeftIcon />
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
            <span style={{ color: TAB_INACTIVE_TEXT }}>{TOTAL_PAGES}</span>
          </span>
          <button
            type="button"
            onClick={goNext}
            disabled={flipping !== null || currentPage + 2 > TOTAL_PAGES}
            aria-label={t("nextPage")}
            className="flex h-6 w-6 items-center justify-center transition-opacity hover:opacity-80 disabled:opacity-40 [&>svg]:h-6 [&>svg]:w-6"
            style={{ color: TAB_INACTIVE_TEXT }}
          >
            <ChevronRightIcon />
          </button>
        </div>

        {/* Divider — 1×16, white at 12% */}
        <span
          aria-hidden
          style={{
            width: "1px",
            height: "16px",
            background: "var(--tott-card-border)",
          }}
        />

        {/* Action icons */}
        <ToolbarBtn label={t("viewList")}>
          <ListIcon />
        </ToolbarBtn>
        <ToolbarBtn label={t("viewGrid")}>
          <Grid2x2Icon />
        </ToolbarBtn>
        <ToolbarBtn label={t("zoomIn")}>
          <ZoomInIcon />
        </ToolbarBtn>
        <ToolbarBtn label={t("zoomOut")}>
          <ZoomOutIcon />
        </ToolbarBtn>
        <ToolbarBtn label={t("fullscreen")}>
          <FullscreenIcon />
        </ToolbarBtn>
        <ToolbarBtn label={t("share")}>
          <ShareIcon />
        </ToolbarBtn>
        <ToolbarBtn label={t("more")}>
          <MoreDotsIcon />
        </ToolbarBtn>
      </div>
    </div>
  );
}

function ToolbarBtn({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="flex h-6 w-6 items-center justify-center transition-colors hover:opacity-80 [&>svg]:h-6 [&>svg]:w-6"
      style={{ color: TAB_INACTIVE_TEXT }}
    >
      {children}
    </button>
  );
}

/** Chevron-left icon — 24×24. */
function ChevronLeftIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

/** Chevron-right icon — 24×24. */
function ChevronRightIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/* Lightweight inline icons that aren't already in the icons file.
 * Sized 24×24 to match the Figma toolbar spec. */
function ListIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function ZoomInIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function ZoomOutIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

/** Sort descending — three lines of decreasing length plus a downward
 * arrow on the right (↓). */
function SortDescIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Three lines, decreasing length top to bottom */}
      <line x1="3" y1="6" x2="14" y2="6" />
      <line x1="3" y1="12" x2="10" y2="12" />
      <line x1="3" y1="18" x2="6" y2="18" />
      {/* Down arrow */}
      <line x1="19" y1="6" x2="19" y2="18" />
      <polyline points="15 14 19 18 23 14" />
    </svg>
  );
}
