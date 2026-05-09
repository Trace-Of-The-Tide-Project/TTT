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
  ListIcon,
  ZoomInIcon,
  ZoomOutIcon,
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

// The Issues pane is currently a visual demo until the real magazine
// pages drop in — a static spread image with a cosmetic page-flip
// overlay. Hoisting these so it's obvious the page count + animation
// are placeholder values, not real data.
const DEMO_TOTAL_PAGES = 128;
const DEMO_INITIAL_PAGE = 16;
const FLIP_MS = 700;

/**
 * Issues pane — Visual Gallery with a book/spread reader.
 *
 *  Header: heading + subtitle + "View more →"
 *  Toolbar: search input | filter chips | sort by | filters
 *  Reader: chamfered white spread (two-page) with prev/next chevrons floating
 *          on the sides.
 *  Footer toolbar: page indicator + view/zoom/fullscreen/share/more controls.
 */
export function MagazineIssues() {
  const t = useTranslations("Home.magazine.issues");
  const [active, setActive] = useState<FilterId>("all");

  // Page-flip state — `flipping` is set when an animation starts; the
  // `flipPhase` then transitions from "start" (rotateY 0) to "end"
  // (rotateY ±180) one frame later, so the CSS transition actually fires.
  const [currentPage, setCurrentPage] = useState(DEMO_INITIAL_PAGE);
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
      requestAnimationFrame(() => setFlipPhase("end"));
    });
    return () => cancelAnimationFrame(raf);
  }, [flipping]);

  const goNext = () => {
    if (flipping || currentPage + 2 > DEMO_TOTAL_PAGES) return;
    setFlipping("next");
    flipTimer.current = setTimeout(() => {
      setCurrentPage((p) => Math.min(p + 2, DEMO_TOTAL_PAGES));
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

          {/* Filters group — chips + divider + sort/filters. */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
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

            <span
              aria-hidden
              className="hidden sm:inline-block"
              style={{
                width: 0,
                height: "16px",
                borderLeft: `1px solid ${TAB_BORDER}`,
              }}
            />

            <div className="flex flex-wrap items-center gap-2">
              <FilterChip
                icon={<SortDescIcon />}
                label={
                  <>
                    <span>{t("sortByLabel")}</span>
                    <span style={{ color: "var(--tott-home-text-strong)", marginInlineStart: "4px" }}>
                      {t("sortNewest")}
                    </span>
                  </>
                }
              />
              <FilterChip icon={<FilterIcon />} label={t("filtersLabel")} />
            </div>
          </div>
        </div>
      </div>

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
          disabled={flipping !== null || currentPage + 2 > DEMO_TOTAL_PAGES}
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
            <span style={{ color: TAB_INACTIVE_TEXT }}>{DEMO_TOTAL_PAGES}</span>
          </span>
          <button
            type="button"
            onClick={goNext}
            disabled={flipping !== null || currentPage + 2 > DEMO_TOTAL_PAGES}
            aria-label={t("nextPage")}
            className="flex h-6 w-6 items-center justify-center transition-opacity hover:opacity-80 disabled:opacity-40 [&>svg]:h-6 [&>svg]:w-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--tott-accent-gold)]"
            style={{ color: TAB_INACTIVE_TEXT }}
          >
            <ChevronRightLargeIcon />
          </button>
        </div>

        <span
          aria-hidden
          style={{
            width: "1px",
            height: "16px",
            background: "var(--tott-card-border)",
          }}
        />

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
      className="flex h-6 w-6 items-center justify-center transition-colors hover:opacity-80 [&>svg]:h-6 [&>svg]:w-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--tott-accent-gold)]"
      style={{ color: TAB_INACTIVE_TEXT }}
    >
      {children}
    </button>
  );
}

/** Sort descending — three lines of decreasing length plus a downward
 * arrow on the right. One-off compound glyph; lives here rather than
 * in icons.tsx because it's not reused elsewhere. */
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
      <line x1="3" y1="6" x2="14" y2="6" />
      <line x1="3" y1="12" x2="10" y2="12" />
      <line x1="3" y1="18" x2="6" y2="18" />
      <line x1="19" y1="6" x2="19" y2="18" />
      <polyline points="15 14 19 18 23 14" />
    </svg>
  );
}
