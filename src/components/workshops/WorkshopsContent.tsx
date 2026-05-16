"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import { HexPatternBackdrop } from "@/components/home/magazine/HexPatternBackdrop";
import { WorkshopModal } from "@/components/workshops/WorkshopModal";
import { JoinWorkshopModal } from "@/components/workshops/JoinWorkshopModal";
import type {
  WorkshopListItem,
  WorkshopDetail,
} from "@/services/workshops.service";
import { getWorkshop } from "@/services/workshops.service";

const HERO_ICON = "/images/writing-room/workshops-icon.svg";
const JOIN_ROOM_ICON = "/images/writing-room/join-room-icon.svg";
// Working gallery slides. We use the existing brand silk +
// trip photographs as placeholders until a curated workshop
// gallery is shipped; the carousel cycles through this list
// when the prev/next arrows are clicked. Cropped/fitted to the
// 1128/483 active frame via object-cover.
const GALLERY_IMAGES: string[] = [
  "/images/workshops/gallery-thumbnail.svg",
  "/images/home/hero-silk.png",
  "/images/trip.png",
];
// 72×419 dimmed (opacity 0.16 baked into the SVG) edge-slice
// shown at each outer edge of the gallery to hint at carousel
// navigation. Doesn't reflect the actual prev/next slide — it's
// a decorative "more content beyond" cue.
const GALLERY_PEEK = "/images/workshops/gallery-peek.svg";

export function WorkshopsContent({
  workshops,
}: {
  workshops: WorkshopListItem[];
}) {
  const t = useTranslations("Home.workshops");

  const gallery = GALLERY_IMAGES;
  const [galleryIndex, setGalleryIndex] = useState(0);
  const goPrev = () => {
    if (gallery.length <= 1) return;
    setGalleryIndex((i) => (i === 0 ? gallery.length - 1 : i - 1));
  };
  const goNext = () => {
    if (gallery.length <= 1) return;
    setGalleryIndex((i) => (i + 1) % gallery.length);
  };

  // Detail modal opens when a card's Explore is clicked. We fetch
  // the full workshop detail on click (list call only returns
  // summaries) and pre-fill the modal once it lands. Apply Now
  // inside the detail modal swaps to the Join Workshop form,
  // pre-filled with the same workshop id.
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<WorkshopDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [activeWorkshopId, setActiveWorkshopId] = useState<string | null>(null);

  const openDetail = async (w: WorkshopListItem) => {
    setActiveWorkshopId(w.id);
    setDetail(null);
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const full = await getWorkshop(w.id);
      setDetail(full);
    } catch {
      // Fall back to the list-item fields so the modal still
      // renders something useful even if detail fetch fails.
      setDetail(w as WorkshopDetail);
    } finally {
      setDetailLoading(false);
    }
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

      <div
        className="relative mx-auto w-full px-4 pb-16 pt-24 sm:px-6 sm:pt-28 md:px-8 md:pt-32"
        style={{
          // Fluid container — 1280px on standard desktop, scales up
          // continuously past that based on viewport width, capped
          // at 4500px for ultra-wide (5000px+) displays. The min()
          // term lets it shrink with the viewport so it still works
          // on small/medium screens.
          maxWidth: "min(90vw, 4500px)",
        }}
      >
        {/* ── Hero ("Call To Action" frame from Figma) ─────────
            Layout caps at the Figma intrinsic 552px on desktop and
            scales fluidly below via clamp(). All colors come from
            CSS vars so dark/light themes stay coherent.

            Icon: 64×72 rounded-square per Figma — dark base from
            `--tott-panel-bg` with a subtle top-down white sheen
            (color-mix → 6% strong) and a gold inset shadow at the
            bottom edge (color-mix → 24% gold). Houses a 32×32
            writing glyph extracted from the brand writing-icon.

            Title: gradient-clipped text — a gold radial flares
            from the left edge and fades into the strong text color
            by 50%. Same gold/text vars used everywhere else, no
            hex literals. */}
        <header
          className="mx-auto flex flex-col items-center text-center"
          style={{
            width: "100%",
            // Hero copy width scales fluidly with viewport so it
            // remains readable on huge displays without dead space.
            maxWidth: "clamp(320px, 40vw, 1100px)",
            gap: "clamp(16px, 1.5vw + 0.5rem, 48px)",
          }}
        >
          <span
            aria-hidden
            className="relative shrink-0"
            style={{
              width: "clamp(48px, 5vw, 140px)",
              height: "clamp(54px, 5.6vw, 158px)",
            }}
          >
            <Image
              src={HERO_ICON}
              alt=""
              fill
              sizes="64px"
              className="select-none"
              draggable={false}
              priority
            />
          </span>
          <div
            className="flex w-full flex-col items-center"
            style={{ gap: "8px" }}
          >
            <h1
              style={{
                fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                fontWeight: 500,
                // Two-anchor fluid clamp — hits the Figma 32px at
                // 1280px (laptop) and scales to ~150px at 5000px.
                // Negative rem offset lets the steep slope go
                // *through* the laptop anchor instead of past it.
                fontSize: "clamp(1.5rem, 3.2vw - 0.5rem, 10rem)",
                lineHeight: 1.15,
                margin: 0,
                backgroundImage:
                  "radial-gradient(100% 100% at 0% 50%, var(--tott-magazine-btn-bg) 0%, transparent 50%), linear-gradient(0deg, var(--tott-home-text-strong), var(--tott-home-text-strong))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
              }}
            >
              {t("heroTitle")}
            </h1>
            <p
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "clamp(0.8125rem, 0.9vw + 0.15rem, 3rem)",
                lineHeight: 1.55,
                letterSpacing: "-0.005em",
                color: "var(--tott-home-text-heading)",
                textShadow: "var(--tott-home-text-shadow)",
                margin: 0,
              }}
            >
              {t("heroSubtitle")}
            </p>
            <p
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "clamp(0.8125rem, 0.9vw + 0.15rem, 3rem)",
                lineHeight: 1.55,
                letterSpacing: "-0.005em",
                color: "var(--tott-home-text-heading)",
                textShadow: "var(--tott-home-text-shadow)",
                margin: 0,
              }}
            >
              {t("heroBody")}
            </p>
          </div>
        </header>

        {/* ── Current & Upcoming ─────────────────────────────── */}
        <section
          aria-labelledby="current-heading"
          className="relative"
          style={{
            marginTop: "clamp(48px, 4vw + 0.5rem, 200px)",
            padding:
              "clamp(20px, 1.6vw + 0.5rem, 80px) clamp(12px, 1.4vw + 0.4rem, 64px) clamp(24px, 1.8vw + 0.5rem, 96px)",
          }}
        >
          <ChamferedFrame size={24} borderColor="var(--tott-card-border)" />
          <h2
            id="current-heading"
            className="text-center"
            style={{
              fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "clamp(1.25rem, 2.6vw - 0.05rem, 8rem)",
              lineHeight: 1.2,
              color: "var(--tott-home-text-strong)",
              margin: 0,
            }}
          >
            {t("currentHeading")}
          </h2>
          <ul
            className="grid grid-cols-1 md:grid-cols-2"
            style={{
              marginTop: "clamp(32px, 2vw + 0.5rem, 96px)",
              gap: "clamp(16px, 1.4vw + 0.4rem, 80px)",
              padding: "clamp(0px, 0.6vw, 24px) clamp(0px, 0.8vw, 32px) 0",
            }}
          >
            {workshops.length === 0 ? (
              <li
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  fontFamily: "'Inter', var(--font-sans, sans-serif)",
                  fontWeight: 400,
                  fontSize: "clamp(0.875rem, 0.3vw + 0.5rem, 1.25rem)",
                  lineHeight: 1.5,
                  color: "var(--tott-home-text-muted)",
                  padding:
                    "clamp(24px, 1.5vw + 0.5rem, 64px) clamp(16px, 1vw, 32px)",
                }}
              >
                {t("emptyState")}
              </li>
            ) : (
              workshops.map((w) => (
                <li key={w.id} className="flex">
                  <WorkshopCard
                    title={w.title || t("cardTitle")}
                    body={w.body || t("cardBody")}
                    chips={[
                      w.duration_label || t("chipDuration"),
                      w.format_label || t("chipFormat"),
                    ].filter(Boolean)}
                    ctaLabel={t("explore")}
                    onExplore={() => openDetail(w)}
                  />
                </li>
              ))
            )}
          </ul>

          <div
            className="flex justify-center"
            style={{ marginTop: "clamp(40px, 3vw + 0.5rem, 144px)" }}
          >
            <Link
              href="/writing-room"
              className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
              style={{
                height: "clamp(40px, 2vw + 1rem, 96px)",
                padding: "clamp(8px, 0.6vw, 24px) clamp(20px, 1.4vw + 0.5rem, 56px)",
                gap: "clamp(8px, 0.4vw, 18px)",
                borderRadius: "8px",
                backgroundColor: "var(--tott-card-border)",
                boxShadow: "inset 0px 1px 1px rgba(255, 255, 255, 0.08)",
                color: "var(--tott-home-text-strong)",
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "clamp(0.875rem, 0.5vw + 0.5rem, 2rem)",
                lineHeight: 1.4,
                letterSpacing: "-0.005em",
              }}
            >
              <span
                aria-hidden
                className="inline-flex items-center justify-center"
                style={{
                  width: "clamp(20px, 1vw + 0.3rem, 48px)",
                  height: "clamp(20px, 1vw + 0.3rem, 48px)",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="11 6 5 12 11 18" />
                </svg>
              </span>
              {t("backToWritingRoom")}
            </Link>
          </div>
        </section>

        {/* ── Gallery ────────────────────────────────────────
            Full-bleed: breaks out of the page's max-w container
            so the left/right peek thumbnails sit FLUSH against
            the viewport edges per Figma (the page <main> already
            has overflow-x: hidden so the breakout is safe).
            Layout: [left peek pinned to edge] [← arrow] [center
            thumbnail] [→ arrow] [right peek pinned to edge].
            Justify-between pushes peeks outward; the inner
            arrow+center+arrow group floats in the middle. */}
        <section
          aria-label={t("galleryAlt")}
          className="relative"
          style={{
            marginTop: "clamp(48px, 4vw + 0.5rem, 200px)",
            width: "100vw",
            marginLeft: "calc(50% - 50vw)",
            marginRight: "calc(50% - 50vw)",
          }}
        >
          <div className="relative flex w-full items-center justify-between">
            {/* Left peek — mirrored 72×419 strip so its visible
                edge reads as the *right* side of the previous
                image. Hidden below sm to avoid cramping; scales
                up on big screens so it stays a meaningful slice. */}
            <span
              aria-hidden
              className="relative hidden shrink-0 sm:block"
              style={{
                width: "clamp(40px, 3vw + 0.5rem, 280px)",
                aspectRatio: "72 / 419",
                transform: "scaleX(-1)",
              }}
            >
              <Image
                src={GALLERY_PEEK}
                alt=""
                fill
                sizes="72px"
                className="select-none object-contain"
                draggable={false}
              />
            </span>

            {/* Inner group — pushes the [arrow → image → arrow]
                block into the centre of the full-bleed row while
                the peeks pin themselves to the outer edges via
                their parent's justify-between. */}
            <div
              className="flex shrink min-w-0 flex-1 items-center justify-center"
              style={{
                gap: "clamp(12px, 2vw, 24px)",
                padding: "0 clamp(8px, 2vw, 24px)",
              }}
            >
              <button
                type="button"
                onClick={goPrev}
                aria-label={t("prev")}
                className="z-10 flex shrink-0 items-center justify-center transition-opacity hover:opacity-70"
                style={{
                  width: "clamp(32px, 1.5vw + 0.5rem, 96px)",
                  height: "clamp(32px, 1.5vw + 0.5rem, 96px)",
                  color: "var(--tott-home-text-strong)",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    maxWidth: "clamp(20px, 1vw + 0.3rem, 56px)",
                    maxHeight: "clamp(20px, 1vw + 0.3rem, 56px)",
                    filter:
                      "drop-shadow(0px 1px 3px color-mix(in srgb, var(--tott-home-surface) 40%, transparent))",
                  }}
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="11 6 5 12 11 18" />
                </svg>
              </button>

              <div
                className="relative w-full overflow-hidden"
                role="region"
                aria-roledescription="carousel"
                aria-live="polite"
                style={{
                  // Fluid: ~1128px at standard desktop, scales up
                  // continuously past that. Capped at 4000px so on
                  // a 5000px monitor it still leaves room for the
                  // peeks and arrows on either side.
                  maxWidth: "min(82vw, 4000px)",
                  aspectRatio: "1128 / 483",
                  borderRadius: "16px",
                  border:
                    "1px solid color-mix(in srgb, var(--tott-home-text-strong) 8%, transparent)",
                }}
              >
                {/* All slides stay mounted and cross-fade — the
                    active one ramps to opacity 1 while the others
                    fade out. Keeps the carousel feeling smooth and
                    lets the browser cache pre-decoded frames. */}
                {gallery.map((src, i) => (
                  <Image
                    key={src}
                    src={src}
                    alt={i === galleryIndex ? t("galleryAlt") : ""}
                    aria-hidden={i === galleryIndex ? undefined : true}
                    fill
                    sizes="(min-width: 1280px) 1128px, 90vw"
                    className="select-none object-cover"
                    style={{
                      opacity: i === galleryIndex ? 1 : 0,
                      transition: "opacity 400ms ease",
                    }}
                    draggable={false}
                    priority={i === 0}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={goNext}
                aria-label={t("next")}
                className="z-10 flex shrink-0 items-center justify-center transition-opacity hover:opacity-70"
                style={{
                  width: "clamp(32px, 1.5vw + 0.5rem, 96px)",
                  height: "clamp(32px, 1.5vw + 0.5rem, 96px)",
                  color: "var(--tott-home-text-strong)",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    maxWidth: "clamp(20px, 1vw + 0.3rem, 56px)",
                    maxHeight: "clamp(20px, 1vw + 0.3rem, 56px)",
                    filter:
                      "drop-shadow(0px 1px 3px color-mix(in srgb, var(--tott-home-surface) 40%, transparent))",
                  }}
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="13 6 19 12 13 18" />
                </svg>
              </button>
            </div>

            {/* Right peek — 72×419 strip in its natural
                orientation, reading as the *left* edge of the
                next image. Hidden below sm; scales on large
                screens to match the left peek. */}
            <span
              aria-hidden
              className="relative hidden shrink-0 sm:block"
              style={{
                width: "clamp(40px, 3vw + 0.5rem, 280px)",
                aspectRatio: "72 / 419",
              }}
            >
              <Image
                src={GALLERY_PEEK}
                alt=""
                fill
                sizes="72px"
                className="select-none object-contain"
                draggable={false}
              />
            </span>
          </div>
        </section>

        {/* ── Join the Room ─────────────────────────────────── */}
        <section
          aria-labelledby="join-room-heading"
          className="relative overflow-hidden"
          style={{
            marginTop: "clamp(64px, 5vw + 0.5rem, 240px)",
            padding: "clamp(32px, 2vw + 0.5rem, 120px) clamp(16px, 1.2vw, 64px)",
          }}
        >
          <HexPatternBackdrop />

          <div
            className="relative z-10 flex flex-col items-center text-center"
            style={{ gap: "clamp(18px, 1.4vw + 0.4rem, 64px)" }}
          >
            <div
              aria-hidden
              className="relative"
              style={{
                width: "clamp(64px, 4vw + 1rem, 220px)",
                height: "clamp(70px, 4.4vw + 1.1rem, 242px)",
              }}
            >
              <Image
                src={JOIN_ROOM_ICON}
                alt=""
                fill
                sizes="80px"
                className="select-none"
                draggable={false}
              />
            </div>
            <h2
              id="join-room-heading"
              style={{
                fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "clamp(1.125rem, 2.15vw - 0.2rem, 6.5rem)",
                lineHeight: 1.2,
                color: "var(--tott-home-text-strong)",
                margin: 0,
              }}
            >
              {t("joinHeading")}
            </h2>
            <p
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "clamp(0.8125rem, 0.9vw + 0.15rem, 2.75rem)",
                lineHeight: 1.55,
                color: "var(--tott-home-text-muted)",
                maxWidth: "clamp(320px, 36vw, 1200px)",
              }}
            >
              {t("joinBody")}
            </p>
            <div
              className="mt-2 flex flex-wrap items-center justify-center"
              style={{ gap: "12px" }}
            >
              <button
                type="button"
                className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
                style={{
                  height: "clamp(40px, 2vw + 1rem, 96px)",
                  padding: "clamp(8px, 0.6vw, 24px) clamp(20px, 1.4vw + 0.5rem, 56px)",
                  borderRadius: "8px",
                  backgroundColor: "var(--tott-magazine-btn-bg)",
                  boxShadow: "inset 0px 1px 0px rgba(255, 255, 255, 0.4)",
                  color: "var(--tott-auth-btn-text)",
                  fontFamily: "'Inter', var(--font-sans, sans-serif)",
                  fontWeight: 500,
                  fontSize: "clamp(0.875rem, 0.5vw + 0.5rem, 2rem)",
                  lineHeight: 1.4,
                  letterSpacing: "-0.005em",
                  border: "none",
                }}
              >
                {t("applyResidency")}
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
                style={{
                  height: "clamp(40px, 2vw + 1rem, 96px)",
                  padding: "clamp(8px, 0.6vw, 24px) clamp(20px, 1.4vw + 0.5rem, 56px)",
                  borderRadius: "8px",
                  backgroundColor: "var(--tott-card-border)",
                  boxShadow: "inset 0px 1px 1px rgba(255, 255, 255, 0.08)",
                  color: "var(--tott-home-text-strong)",
                  fontFamily: "'Inter', var(--font-sans, sans-serif)",
                  fontWeight: 500,
                  fontSize: "clamp(0.875rem, 0.5vw + 0.5rem, 2rem)",
                  lineHeight: 1.4,
                  letterSpacing: "-0.005em",
                  border: "none",
                }}
              >
                {t("joinWorkshop")}
              </button>
            </div>
          </div>
        </section>
      </div>

      <WorkshopModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onApply={() => {
          setDetailOpen(false);
          setJoinOpen(true);
        }}
        loading={detailLoading}
        title={detail?.title || t("cardTitle")}
        body={detail?.description || detail?.body || t("cardBody")}
        chips={[
          detail?.duration_label || t("chipDuration"),
          detail?.format_label || t("chipFormat"),
        ].filter(Boolean)}
        doItems={detail?.what_youll_do ?? undefined}
        gainItems={detail?.what_youll_gain ?? undefined}
      />
      <JoinWorkshopModal
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        workshopId={activeWorkshopId}
      />
    </main>
  );
}

// ─── Workshop card ──────────────────────────────────────────────

function WorkshopCard({
  title,
  body,
  chips,
  ctaLabel,
  onExplore,
}: {
  title: string;
  body: string;
  chips: string[];
  ctaLabel: string;
  onExplore: () => void;
}) {
  return (
    <article
      className="relative flex w-full flex-col"
      style={{
        padding:
          "clamp(20px, 1.5vw + 0.4rem, 96px) clamp(20px, 1.8vw + 0.4rem, 112px) clamp(24px, 1.8vw + 0.4rem, 96px)",
        gap: "clamp(16px, 1vw + 0.3rem, 56px)",
      }}
    >
      <ChamferedFrame size={24} borderColor="var(--tott-card-border)" />

      <div className="flex flex-col" style={{ gap: "clamp(4px, 0.3vw, 16px)" }}>
        <h3
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "clamp(0.9375rem, 1.1vw + 0.13rem, 3.5rem)",
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
            color: "var(--tott-home-text-strong)",
            margin: 0,
          }}
        >
          {title}
        </h3>

        <p
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 400,
            fontSize: "clamp(0.8125rem, 0.7vw + 0.32rem, 2.5rem)",
            lineHeight: 1.55,
            letterSpacing: "-0.005em",
            color: "var(--tott-home-text-muted)",
            margin: 0,
          }}
        >
          {body}
        </p>
      </div>

      {/* Chip row — plain dark rectangles per Figma (no chamfer).
          Each chip is a 24px-tall block with 8px horizontal padding
          + frosted-glass backdrop blur. Between chips: a muted "."
          separator (Inter 14/20, --tott-home-text-muted). */}
      <div
        className="flex flex-wrap items-center"
        style={{ gap: "4px" }}
      >
        {chips.map((c, i) => (
          <span key={c} className="inline-flex items-center" style={{ gap: "4px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                height: "clamp(24px, 1.1vw + 0.4rem, 64px)",
                padding: "clamp(4px, 0.25vw, 12px) clamp(8px, 0.6vw, 28px)",
                borderRadius: "6px",
                backgroundColor: "var(--tott-card-border)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                color: "var(--tott-home-text-strong)",
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "clamp(12px, 0.55vw + 0.3rem, 2rem)",
                lineHeight: 1.4,
              }}
            >
              {c}
            </span>
            {i < chips.length - 1 ? (
              <span
                aria-hidden
                style={{
                  fontFamily: "'Inter', var(--font-sans, sans-serif)",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "20px",
                  letterSpacing: "-0.005em",
                  color: "var(--tott-home-text-muted)",
                }}
              >
                .
              </span>
            ) : null}
          </span>
        ))}
      </div>

      {/* Gold "Explore →" text link per Figma — opens the workshop
          detail modal. */}
      <button
        type="button"
        onClick={onExplore}
        className="inline-flex items-center self-start transition-opacity hover:opacity-80"
        style={{
          gap: "clamp(8px, 0.4vw, 18px)",
          color: "var(--tott-magazine-btn-bg)",
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 400,
          fontSize: "clamp(0.875rem, 0.5vw + 0.5rem, 1.75rem)",
          lineHeight: 1.4,
          letterSpacing: "-0.005em",
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
      >
        {ctaLabel}
        <span
          aria-hidden
          className="inline-flex items-center justify-center"
          style={{
            width: "clamp(20px, 1vw + 0.3rem, 48px)",
            height: "clamp(20px, 1vw + 0.3rem, 48px)",
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="13 6 19 12 13 18" />
          </svg>
        </span>
      </button>
    </article>
  );
}
