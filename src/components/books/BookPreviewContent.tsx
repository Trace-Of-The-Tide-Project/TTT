"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { HexPatternBackdrop } from "@/components/home/magazine/HexPatternBackdrop";
import {
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

const BOOK_IMAGE = "/images/home/Book.png";
const SHARE_HEX = "/images/home/Icon-5.svg";

const CHIP_CHAMFER =
  "polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)";

// Tokens for the bottom toolbar capsule.
const TAB_BG = "var(--tott-panel-bg)";
const TAB_BORDER = "var(--tott-card-border)";
const TAB_INACTIVE_TEXT = "var(--tott-home-text-muted)";

const FLIP_MS = 700;
const DEFAULT_INITIAL_PAGE = 16;
const FALLBACK_TOTAL_PAGES = 128;

export type BookPreviewBook = {
  id: string;
  title: string;
  category: string;
  rating: number | null;
  reviewCount: number | null;
  pageCount: number | null;
  pdfUrl: string | null;
};

/**
 * Book preview reader — same visual treatment as the magazine
 * Issues pane (rounded white spread, prev/next chevrons, capsule
 * toolbar) but scoped to a single book and reachable from the
 * Preview button on the book detail page.
 *
 * The book content is a static brand spread (Book.png); the
 * page-flip animation is cosmetic. Real per-page artwork can drop
 * in later by replacing the spread layer.
 */
export function BookPreviewContent({ book }: { book: BookPreviewBook }) {
  const t = useTranslations("Home");
  const tIssues = useTranslations("Home.magazine.issues");
  const tDetail = useTranslations("Home.bookDetail");

  const totalPages = book.pageCount ?? FALLBACK_TOTAL_PAGES;
  // Start the indicator at min(16, totalPages) so demos still feel
  // "in the middle" without overshooting on short books.
  const initialPage = Math.min(DEFAULT_INITIAL_PAGE, totalPages);

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [flipping, setFlipping] = useState<"next" | "prev" | null>(null);
  const [flipPhase, setFlipPhase] = useState<"start" | "end">("start");
  const flipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (flipTimer.current) clearTimeout(flipTimer.current);
    };
  }, []);

  // After flipping mounts the overlay at rotateY 0, push it to ±180
  // on the next animation frame so the CSS transition runs.
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

  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: "var(--tott-home-surface)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-35 overflow-hidden"
        style={{ opacity: "var(--tott-dash-hex-opacity, 1)" }}
      >
        <HexBackground />
      </div>

      <div className="relative mx-auto w-full max-w-[1280px] px-4 pb-16 pt-24 sm:px-6 sm:pt-28 md:px-8 md:pt-32">
        {/* Breadcrumb — Books > Category > Title > Preview */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center"
          style={{
            height: "56px",
            padding: "0 20px",
            gap: "12px",
            backgroundColor: "var(--tott-panel-bg)",
            border: "1px solid var(--tott-card-border)",
            borderRadius: "12px",
          }}
        >
          <Link
            href="/"
            aria-label="Home"
            className="inline-flex items-center justify-center transition-opacity hover:opacity-80"
            style={{
              width: "20px",
              height: "20px",
              color: "var(--tott-home-text-muted)",
            }}
          >
            <BreadcrumbHomeIcon />
          </Link>
          <Link
            href="/books"
            style={CRUMB_LINK_STYLE}
            className="transition-opacity hover:opacity-80"
          >
            {tDetail("breadcrumbBooks")}
          </Link>
          {book.category ? (
            <>
              <BreadcrumbChevron />
              <Link
                href="/books"
                className="capitalize transition-opacity hover:opacity-80"
                style={CRUMB_LINK_STYLE}
              >
                {book.category}
              </Link>
            </>
          ) : null}
          <BreadcrumbChevron />
          <Link
            href={`/books/${book.id}`}
            className="line-clamp-1 transition-opacity hover:opacity-80"
            style={CRUMB_LINK_STYLE}
          >
            {book.title}
          </Link>
          <BreadcrumbChevron />
          <span style={CRUMB_ACTIVE_STYLE}>{tDetail("preview")}</span>
        </nav>

        {/* Compact header — title + chip + rating */}
        <header className="mt-6">
          <h1
            style={{
              fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "clamp(1.5rem, 2vw + 0.75rem, 2rem)",
              lineHeight: "1.25",
              color: "var(--tott-home-text-strong)",
              margin: 0,
            }}
          >
            {book.title}
          </h1>
          {book.category || book.rating !== null ? (
            <div
              className="mt-3 flex flex-wrap items-center"
              style={{ gap: "12px" }}
            >
              {book.category ? (
                <span
                  className="inline-flex items-center justify-center capitalize"
                  style={{
                    minWidth: "76px",
                    height: "24px",
                    padding: "4px 10px",
                    backgroundColor: "var(--tott-dash-gold-text)",
                    color: "var(--tott-auth-btn-text)",
                    fontFamily: "'Inter', var(--font-sans, sans-serif)",
                    fontWeight: 500,
                    fontSize: "12px",
                    lineHeight: "16px",
                    clipPath: CHIP_CHAMFER,
                    WebkitClipPath: CHIP_CHAMFER,
                  }}
                >
                  {book.category}
                </span>
              ) : null}
              {book.rating !== null && book.category ? (
                <span
                  aria-hidden
                  style={{
                    fontFamily: "'Inter', var(--font-sans, sans-serif)",
                    fontWeight: 500,
                    fontSize: "12px",
                    lineHeight: "16px",
                    color: "var(--tott-home-text-muted)",
                  }}
                >
                  ·
                </span>
              ) : null}
              {book.rating !== null ? (
                <span
                  className="flex items-center"
                  style={{ gap: "4px" }}
                >
                  <PartialStar fill={book.rating / 5} size={16} />
                  <span
                    style={{
                      fontFamily: "'Inter', var(--font-sans, sans-serif)",
                      fontWeight: 500,
                      fontSize: "12px",
                      lineHeight: "16px",
                      color: "var(--tott-home-text-strong)",
                    }}
                  >
                    {book.rating.toFixed(1)}
                  </span>
                  {book.reviewCount !== null ? (
                    <span
                      style={{
                        fontFamily: "'Inter', var(--font-sans, sans-serif)",
                        fontWeight: 400,
                        fontSize: "12px",
                        lineHeight: "16px",
                        color: "var(--tott-home-text-muted)",
                      }}
                    >
                      {tDetail("ratingReviews", { count: book.reviewCount })}
                    </span>
                  ) : null}
                </span>
              ) : null}
            </div>
          ) : null}
        </header>

        {/* Reader — book spread with a cosmetic page-flip overlay
            and side chevrons. Same pattern as MagazineIssues. */}
        <div className="relative mt-8 mx-auto w-full sm:px-12 lg:px-16">
          <button
            type="button"
            onClick={goPrev}
            disabled={flipping !== null || currentPage - 2 < 1}
            aria-label={tIssues("previousPage")}
            className="absolute left-2 top-1/2 z-20 hidden -translate-y-1/2 transition-opacity hover:opacity-70 disabled:opacity-30 sm:block focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--tott-accent-gold)]"
            style={{ color: "var(--tott-home-text-strong)" }}
          >
            <ChevronLeftLargeIcon />
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={flipping !== null || currentPage + 2 > totalPages}
            aria-label={tIssues("nextPage")}
            className="absolute right-2 top-1/2 z-20 hidden -translate-y-1/2 transition-opacity hover:opacity-70 disabled:opacity-30 sm:block focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--tott-accent-gold)]"
            style={{ color: "var(--tott-home-text-strong)" }}
          >
            <ChevronRightLargeIcon />
          </button>

          <div
            className="relative mx-auto w-full max-w-[1100px]"
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
                priority
                sizes="(min-width: 1280px) 1100px, 100vw"
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

        {/* Bottom capsule toolbar — page nav + view controls. */}
        <div
          className="mx-auto mt-8 flex w-full max-w-[542px] flex-nowrap items-center overflow-x-auto justify-start sm:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            height: "64px",
            padding: "0 16px",
            backgroundColor: TAB_BG,
            border: `1px solid ${TAB_BORDER}`,
            borderRadius: "32px",
            gap: "16px",
            columnGap: "clamp(12px, 3vw, 24px)",
          }}
        >
          <div className="flex items-center" style={{ gap: "16px" }}>
            <button
              type="button"
              onClick={goPrev}
              disabled={flipping !== null || currentPage - 2 < 1}
              aria-label={tIssues("previousPage")}
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
              <span style={{ color: "var(--tott-home-text-strong)" }}>
                {currentPage}
              </span>
              <span style={{ color: TAB_INACTIVE_TEXT }}>/</span>
              <span style={{ color: TAB_INACTIVE_TEXT }}>{totalPages}</span>
            </span>
            <button
              type="button"
              onClick={goNext}
              disabled={flipping !== null || currentPage + 2 > totalPages}
              aria-label={tIssues("nextPage")}
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
              background: TAB_BORDER,
            }}
          />

          <ToolbarBtn label={tIssues("viewList")}>
            <ListIcon />
          </ToolbarBtn>
          <ToolbarBtn label={tIssues("viewGrid")}>
            <Grid2x2Icon />
          </ToolbarBtn>
          <ToolbarBtn label={tIssues("zoomIn")}>
            <ZoomInIcon />
          </ToolbarBtn>
          <ToolbarBtn label={tIssues("zoomOut")}>
            <ZoomOutIcon />
          </ToolbarBtn>
          <ToolbarBtn label={tIssues("fullscreen")}>
            <FullscreenIcon />
          </ToolbarBtn>
          <ToolbarBtn label={tIssues("share")}>
            <ShareIcon />
          </ToolbarBtn>
          <ToolbarBtn label={tIssues("more")}>
            <MoreDotsIcon />
          </ToolbarBtn>
        </div>
      </div>

      <ShareYourStory tShare={t} />
    </main>
  );
}

// ─── Helpers ────────────────────────────────────────────────────

const CRUMB_LINK_STYLE = {
  fontFamily: "'Inter', var(--font-sans, sans-serif)",
  fontWeight: 400,
  fontSize: "14px",
  lineHeight: "20px",
  letterSpacing: "-0.005em",
  color: "var(--tott-home-text-muted)",
} as const;

const CRUMB_ACTIVE_STYLE = {
  fontFamily: "'Inter', var(--font-sans, sans-serif)",
  fontWeight: 500,
  fontSize: "14px",
  lineHeight: "20px",
  letterSpacing: "-0.005em",
  color: "var(--tott-home-text-strong)",
} as const;

function BreadcrumbHomeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      <path
        d="M15.8334 7.25879L11.3892 3.80213C10.9992 3.49872 10.5192 3.33398 10.0251 3.33398C9.53093 3.33398 9.05091 3.49872 8.6609 3.80213L4.2159 7.25879C3.94877 7.46653 3.73264 7.73256 3.58403 8.03658C3.43541 8.3406 3.35824 8.67456 3.3584 9.01296V15.013C3.3584 15.455 3.53399 15.8789 3.84655 16.1915C4.15911 16.504 4.58304 16.6796 5.02507 16.6796H15.0251C15.4671 16.6796 15.891 16.504 16.2036 16.1915C16.5161 15.8789 16.6917 15.455 16.6917 15.013V9.01296C16.6917 8.32713 16.3751 7.67963 15.8334 7.25879Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BreadcrumbChevron() {
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center"
      style={{
        width: "16px",
        height: "20px",
        color: "var(--tott-home-text-muted)",
        opacity: 0.7,
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </span>
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

function PartialStar({ fill, size = 16 }: { fill: number; size?: number }) {
  const clamped = Math.max(0, Math.min(1, fill));
  return (
    <span
      aria-hidden
      className="relative inline-block"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        color: "var(--tott-accent-gold)",
      }}
    >
      {clamped > 0 ? (
        <span
          className="absolute left-0 right-0 overflow-hidden"
          style={{ bottom: 0, height: `${clamped * 100}%` }}
        >
          <span
            className="absolute left-0"
            style={{
              bottom: 0,
              width: `${size}px`,
              height: `${size}px`,
            }}
          >
            <svg width="100%" height="100%" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </span>
        </span>
      ) : null}
      <span className="absolute inset-0">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinejoin="round"
          aria-hidden
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      </span>
    </span>
  );
}

function ShareYourStory({
  tShare,
}: {
  tShare: ReturnType<typeof useTranslations>;
}) {
  return (
    <section
      aria-labelledby="book-preview-share-heading"
      className="relative w-full overflow-hidden px-4 py-16 sm:px-12 sm:py-28 md:py-32"
      style={{ minHeight: "420px" }}
    >
      <HexPatternBackdrop />
      <div className="relative mx-auto flex w-full max-w-[560px] flex-col items-center text-center">
        <div
          aria-hidden
          className="relative"
          style={{ width: "80px", height: "88px" }}
        >
          <Image
            src={SHARE_HEX}
            alt=""
            fill
            sizes="80px"
            className="select-none"
            draggable={false}
          />
        </div>
        <div
          className="mt-6 flex w-full flex-col items-center"
          style={{ gap: "8px" }}
        >
          <h2
            id="book-preview-share-heading"
            style={{
              width: "100%",
              fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "24px",
              lineHeight: "32px",
              color: "var(--tott-home-text-strong)",
              textAlign: "center",
              margin: 0,
            }}
          >
            {tShare("shareTitle")}
          </h2>
          <p
            style={{
              width: "100%",
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.005em",
              color: "var(--tott-home-text-muted)",
              textAlign: "center",
              margin: 0,
            }}
          >
            {tShare("shareBody")}
          </p>
        </div>
        <Link
          href="/contribute"
          className="mt-6 inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors hover:opacity-90"
          style={{
            backgroundColor: "var(--tott-magazine-btn-bg)",
            color: "var(--tott-auth-btn-text)",
          }}
        >
          {tShare("shareCta")}
        </Link>
      </div>
    </section>
  );
}
