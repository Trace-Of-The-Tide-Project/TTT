"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import { PersonIcon } from "@/components/ui/icons";
import { FirstWordGold } from "@/components/home/magazine/FirstWordGold";

const WRITING_ICON = "/images/writing-room/writing-icon.svg";
const EXPERIENCES_HONEYCOMB = "/images/writing-room/experiences-honeycomb.svg";
const QUOTE_ICON = "/images/writing-room/quote-icon.svg";
const NOTE_ICON = "/images/writing-room/note-icon.svg";
// Match the home "Follow our Writers" silk hex + top icon assets so
// the Discover Featured Writing row reads as the same component on
// both pages. Image-2.png supplies both the hex silhouette and the
// silk fill (transparent outside the hex), and Icon-4.svg is the
// pre-baked 48×48 top-of-card icon.
const WRITER_CARD = "/images/home/Image-2.png";
const WRITER_TOP_ICON = "/images/home/Icon-4.svg";
const FILLER = "/images/home/Content Grid Filler.png";
const CHIP_CHAMFER =
  "polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)";
const HEX_CLIP =
  "polygon(50% 5%, 90% 27%, 90% 73%, 50% 95%, 10% 73%, 10% 27%)";

export type FeaturedWritingItem = {
  id: string;
  slug: string;
  title: string;
  author: string;
  coverImage: string | null;
};

type Experience = {
  key: "exp1" | "exp2" | "exp3";
  /** When set, renders this as a full 56×64 SVG asset instead of
   * an inline glyph inside the CSS-built dark square. Lets the
   * brand-exported `Icon Wrapper-*.svg` files (with their baked
   * gradient + inner shadow) drop in directly. */
  iconSrc?: string;
  icon?: React.ReactNode;
};

const EXPERIENCES: Experience[] = [
  {
    key: "exp1",
    iconSrc: "/images/writing-room/workshops-icon.svg",
  },
  {
    key: "exp2",
    iconSrc: "/images/writing-room/moon-icon.svg",
  },
  {
    key: "exp3",
    iconSrc: "/images/writing-room/moon-icon.svg",
  },
];

// Six static dictionary entries — placeholder content matching the
// Figma comp until a /dictionary endpoint exists.
const DICTIONARY = [
  { word: "Sakina", body: "A tranquility that doesn't come from silence, but from understanding.", author: "— Youssef M.", role: "CERAMIC ARTIST · 2023" },
  { word: "Sakina", body: "A tranquility that doesn't come from silence, but from understanding.", author: "— Youssef M.", role: "CERAMIC ARTIST · 2023" },
  { word: "Sakina", body: "A tranquility that doesn't come from silence, but from understanding.", author: "— Youssef M.", role: "CERAMIC ARTIST · 2023" },
  { word: "Sakina", body: "A tranquility that doesn't come from silence, but from understanding.", author: "— Youssef M.", role: "CERAMIC ARTIST · 2023" },
  { word: "Sakina", body: "A tranquility that doesn't come from silence, but from understanding.", author: "— Youssef M.", role: "CERAMIC ARTIST · 2023" },
  { word: "Sakina", body: "A tranquility that doesn't come from silence, but from understanding.", author: "— Youssef M.", role: "CERAMIC ARTIST · 2023" },
];

export function WritingRoomContent({
  featured,
}: {
  featured: FeaturedWritingItem[];
}) {
  const t = useTranslations("Home.writingRoom");

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
        {/* ── Hero (Figma "Call To Action" frame) ──────────────
            Self-contained 64×72 writing icon with gradient + gold
            inset shadow baked into Icon-7.svg, then the gold-first
            title and two paragraphs of muted body copy. The frame
            is centered and capped at 552px on desktop, full width
            on small screens. */}
        <header
          className="mx-auto flex flex-col items-center text-center"
          style={{ width: "100%", maxWidth: "552px", gap: "24px" }}
        >
          <span
            aria-hidden
            className="relative shrink-0"
            style={{ width: "64px", height: "72px" }}
          >
            <Image
              src={WRITING_ICON}
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
                fontSize: "clamp(1.75rem, 3vw + 1rem, 2rem)",
                lineHeight: "40px",
                margin: 0,
                color: "var(--tott-home-text-strong)",
              }}
            >
              <FirstWordGold raw={t("heroTitle")} />
            </h1>
            <p
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "20px",
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
                fontSize: "14px",
                lineHeight: "20px",
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

        {/* ── Experiences (Figma "Carousel" frame) ──────────────
            Outer ChamferedFrame around the whole section. Inside:
            heading at top, three Experience cards in a row — each
            ALSO wrapped in its own ChamferedFrame (mirrors Figma's
            nested-frame structure). 3 cols on md+, stacks below. */}
        <section
          aria-labelledby="experiences-heading"
          className="relative mt-12"
          style={{ padding: "16px 24px 40px" }}
        >
          <ChamferedFrame size={24} borderColor="var(--tott-card-border)" />
          <h2
            id="experiences-heading"
            className="mt-2 text-center"
            style={{
              fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "clamp(1.5rem, 2vw + 0.75rem, 2rem)",
              lineHeight: "40px",
              color: "var(--tott-home-text-strong)",
              margin: 0,
            }}
          >
            {t("experiencesHeading")}
          </h2>
          <ul
            className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            style={{ gap: "24px", padding: "16px 16px 0" }}
          >
            {EXPERIENCES.map((e) => (
              <li key={e.key} className="flex justify-center">
                <ExperienceCard
                  icon={e.icon}
                  iconSrc={e.iconSrc}
                  title={t(`${e.key}Title`)}
                  body={t(`${e.key}Body`)}
                  ctaLabel={t("expEnter")}
                />
              </li>
            ))}
          </ul>
        </section>

        {/* ── Decorative honeycomb (5 image-filled hexes, Figma "Group 11") ───
            Single self-contained SVG that bakes in the 2-on-top / 3-on-bottom
            arrangement plus per-hex drop shadows. Container caps at the Figma
            intrinsic width (823px) and scales fluidly below that — aspect
            ratio comes from the SVG's intrinsic 831×533 viewBox. */}
        <div className="mt-12 flex justify-center">
          <div
            className="relative w-full"
            style={{ maxWidth: "823px", aspectRatio: "831 / 533" }}
          >
            <Image
              src={EXPERIENCES_HONEYCOMB}
              alt=""
              fill
              sizes="(min-width: 823px) 823px, 100vw"
              className="select-none object-contain"
              draggable={false}
              aria-hidden
            />
          </div>
        </div>

        {/* ── Living Dictionary ───────────────────────────────── */}
        <section
          aria-labelledby="dictionary-heading"
          className="relative mt-12"
          style={{ padding: "32px 24px" }}
        >
          <ChamferedFrame size={24} borderColor="var(--tott-card-border)" />
          <header className="text-center">
            <h2
              id="dictionary-heading"
              style={{
                fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "clamp(1.5rem, 2vw + 0.75rem, 2rem)",
                lineHeight: "40px",
                color: "var(--tott-home-text-strong)",
                margin: 0,
              }}
            >
              {t("dictionaryHeading")}
            </h2>
            <p
              className="mx-auto mt-2 max-w-xl"
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "13px",
                lineHeight: "20px",
                color: "var(--tott-home-text-muted)",
              }}
            >
              {t("dictionarySubtitle")}
            </p>
          </header>

          <ul
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            style={{ gap: "24px", padding: "16px 16px 0" }}
          >
            {DICTIONARY.map((d, i) => (
              <li key={i} className="flex justify-center">
                <DictionaryCard
                  word={d.word}
                  body={d.body}
                  author={d.author}
                  role={d.role}
                />
              </li>
            ))}
          </ul>

          {/* ── Action row (Figma "Labels") — gold primary first,
              dark secondary with trailing arrow second. ────── */}
          <div
            className="mt-8 flex flex-wrap items-center justify-center"
            style={{ gap: "12px" }}
          >
            <button
              type="button"
              className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
              style={{
                height: "40px",
                padding: "8px 16px",
                borderRadius: "8px",
                backgroundColor: "var(--tott-magazine-btn-bg)",
                boxShadow: "inset 0px 1px 0px rgba(255, 255, 255, 0.4)",
                color: "var(--tott-auth-btn-text)",
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "-0.005em",
                border: "none",
              }}
            >
              {t("browseAll")}
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
              style={{
                height: "40px",
                padding: "8px 16px",
                gap: "8px",
                borderRadius: "8px",
                backgroundColor: "var(--tott-card-border)",
                boxShadow: "inset 0px 1px 1px rgba(255, 255, 255, 0.08)",
                color: "var(--tott-home-text-strong)",
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "-0.005em",
                border: "none",
              }}
            >
              {t("submitWord")}
              <span
                aria-hidden
                className="relative inline-flex shrink-0 items-center justify-center"
                style={{ width: "28px", height: "24px" }}
              >
                <Image
                  src={NOTE_ICON}
                  alt=""
                  fill
                  sizes="28px"
                  className="select-none object-contain"
                  draggable={false}
                />
              </span>
            </button>
          </div>
        </section>

        {/* ── Discover Featured Writing ───────────────────────── */}
        {featured.length > 0 ? (
          <FeaturedWritingRow
            items={featured}
            heading={t("discoverHeading")}
            viewAll={t("viewAll")}
            cardTitleFallback={t("cardTitle")}
            cardAuthorFallback={t("cardAuthor")}
            wantToEngage={t("wantToEngage")}
            visitReadingRoom={t("visitReadingRoom")}
          />
        ) : null}

        {/* ── Join the Room ───────────────────────────────────── */}
        <section
          aria-labelledby="join-room-heading"
          className="mt-16 flex flex-col items-center text-center"
          style={{ gap: "26px" }}
        >
          <span
            aria-hidden
            className="flex items-center justify-center [&>svg]:h-7 [&>svg]:w-7"
            style={{
              width: "64px",
              height: "64px",
              clipPath: HEX_CLIP,
              WebkitClipPath: HEX_CLIP,
              backgroundColor: "var(--tott-panel-bg)",
              color: "var(--tott-accent-gold)",
            }}
          >
            <PersonIcon />
          </span>
          <h2
            id="join-room-heading"
            style={{
              fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "24px",
              lineHeight: "26px",
              color: "var(--tott-home-text-strong)",
              margin: 0,
            }}
          >
            {t("joinHeading")}
          </h2>
          <p
            className="max-w-xl"
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              color: "var(--tott-home-text-muted)",
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
                height: "40px",
                padding: "8px 20px",
                borderRadius: "8px",
                backgroundColor: "transparent",
                border: "1px solid var(--tott-card-border)",
                color: "var(--tott-home-text-strong)",
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "20px",
              }}
            >
              {t("applyResidency")}
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
              style={{
                height: "40px",
                padding: "8px 20px",
                borderRadius: "8px",
                backgroundColor: "var(--tott-magazine-btn-bg)",
                boxShadow: "inset 0px 1px 0px rgba(255, 255, 255, 0.4)",
                color: "var(--tott-auth-btn-text)",
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "20px",
                border: "none",
              }}
            >
              {t("joinWorkshop")}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

// ─── Experience card ─────────────────────────────────────────────

/** Single Experience tile — Figma "Form" frame: ChamferedFrame
 * wrapper, dark icon square (with gold-tinted glyph), title, muted
 * body, gold "Enter" button with trailing arrow. Width caps at
 * 322px on desktop and stretches full-width below sm.
 *
 * `iconSrc` takes priority over `icon` — when supplied we render the
 * full 56×64 brand-exported SVG (which has the dark square + gold
 * glyph + inner shadow already baked in). Otherwise we build the
 * dark square in CSS and slot the inline icon glyph into it. */
function ExperienceCard({
  icon,
  iconSrc,
  title,
  body,
  ctaLabel,
}: {
  icon?: React.ReactNode;
  iconSrc?: string;
  title: string;
  body: string;
  ctaLabel: string;
}) {
  return (
    <article
      className="relative flex w-full flex-col items-center"
      style={{
        maxWidth: "322px",
        padding: "24px 40px",
        gap: "26px",
      }}
    >
      <ChamferedFrame size={24} borderColor="var(--tott-card-border)" />

      {/* Icon wrapper — when iconSrc is supplied we render the
          brand SVG directly (it ships with the dark square + glyph
          + inner shadow baked in). Otherwise we build the dark
          square in CSS and slot in the inline glyph. */}
      {iconSrc ? (
        <span
          aria-hidden
          className="relative shrink-0"
          style={{ width: "56px", height: "64px" }}
        >
          <Image
            src={iconSrc}
            alt=""
            fill
            sizes="56px"
            className="select-none"
            draggable={false}
          />
        </span>
      ) : (
        <span
          aria-hidden
          className="flex items-center justify-center [&>svg]:h-6 [&>svg]:w-6"
          style={{
            width: "56px",
            height: "64px",
            backgroundColor: "var(--tott-dark-pill)",
            boxShadow: "inset 0px 1px 0px var(--tott-card-border)",
            borderRadius: "8px",
            color: "var(--tott-dash-gold-text)",
          }}
        >
          {icon}
        </span>
      )}

      {/* Text block */}
      <div
        className="flex w-full flex-col items-center"
        style={{ gap: "4px" }}
      >
        <h3
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "26px",
            lineHeight: "24px",
            letterSpacing: "-0.01em",
            color: "var(--tott-home-text-strong)",
            textAlign: "center",
            margin: 0,
          }}
        >
          {title}
        </h3>
        <p
          style={{
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
          {body}
        </p>
      </div>

      {/* Gold "Enter" pill with trailing arrow */}
      <button
        type="button"
        className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
        style={{
          height: "40px",
          padding: "8px 16px",
          gap: "8px",
          borderRadius: "8px",
          backgroundColor: "var(--tott-magazine-btn-bg)",
          boxShadow: "inset 0px 1px 0px rgba(255, 255, 255, 0.4)",
          color: "var(--tott-auth-btn-text)",
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 500,
          fontSize: "14px",
          lineHeight: "20px",
          letterSpacing: "-0.005em",
          border: "none",
        }}
      >
        {ctaLabel}
        <span
          aria-hidden
          className="inline-flex items-center justify-center"
          style={{ width: "20px", height: "20px" }}
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
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="13 6 19 12 13 18" />
          </svg>
        </span>
      </button>
    </article>
  );
}

// ─── Dictionary card ─────────────────────────────────────────────

/** Single Living-Dictionary entry — Figma "Form" frame nested inside
 * the section's outer ChamferedFrame. Each card has its own chamfer
 * frame, a 56×64 quote-icon badge (dark wrapper + gold glyph baked
 * in), then a stacked title/body/author block, and an uppercase
 * role row at the bottom. Width caps at 410px on desktop and
 * stretches full-width below sm. */
function DictionaryCard({
  word,
  body,
  author,
  role,
}: {
  word: string;
  body: string;
  author: string;
  role: string;
}) {
  return (
    <article
      className="relative flex w-full flex-col"
      style={{
        maxWidth: "410px",
        padding: "24px 40px",
        gap: "26px",
      }}
    >
      <ChamferedFrame size={24} borderColor="var(--tott-card-border)" />

      <span
        aria-hidden
        className="relative shrink-0"
        style={{ width: "56px", height: "64px" }}
      >
        <Image
          src={QUOTE_ICON}
          alt=""
          fill
          sizes="56px"
          className="select-none"
          draggable={false}
        />
      </span>

      <div
        className="flex flex-col"
        style={{ padding: "12px 0", gap: "8px" }}
      >
        <div
          className="flex flex-col"
          style={{ gap: "4px" }}
        >
          <h3
            style={{
              fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "24px",
              lineHeight: "26px",
              color: "var(--tott-home-text-strong)",
              margin: 0,
            }}
          >
            {word}
          </h3>
          <p
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.005em",
              color: "var(--tott-home-text-muted)",
              margin: 0,
            }}
          >
            {body}
          </p>
          <p
            style={{
              fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "20px",
              lineHeight: "28px",
              color: "var(--tott-home-text-strong)",
              margin: 0,
            }}
          >
            {author}
          </p>
        </div>
        <p
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "12px",
            lineHeight: "26px",
            letterSpacing: "0.04em",
            color: "var(--tott-home-text-muted)",
            margin: 0,
            padding: "8px 0",
            textTransform: "uppercase",
          }}
        >
          {role}
        </p>
      </div>
    </article>
  );
}

// ─── Discover Featured Writing ───────────────────────────────────

// Card geometry for the xl carousel — a 276px-wide silk hex with an
// 8px gap between cards. STEP is the per-click translation distance
// (one card width + one gap), used by the prev/next arrows.
const CAROUSEL_CARD_WIDTH = 276;
const CAROUSEL_GAP = 8;
const CAROUSEL_STEP = CAROUSEL_CARD_WIDTH + CAROUSEL_GAP;
// Width of the central 4-card "window" — used both as the
// reference point for centring the active 4 cards in the
// viewport and as the reach measurement that the ghost gradients
// fade across.
const CARDS_WINDOW_WIDTH =
  4 * CAROUSEL_CARD_WIDTH + 3 * CAROUSEL_GAP;
const CAROUSEL_TRANSITION_MS = 400;
// Width of the "ghost" gradient strips overlaid on each end of the
// carousel — these mask the next/previous hexagon as it peeks in
// from off-screen, fading it out so it reads as a hint rather than
// a fully visible card.
const GHOST_WIDTH = 138;

/** Mirrors the home "Follow our Writers" section (see
 * `MagazineEditorialBoard`): same 18px IBM Plex heading, same
 * Image-2.png silk hex card with Icon-4.svg top glyph + bottom-fade
 * overlay + edition chip. On xl viewports it breaks out of the
 * page's 1280px container to span the full screen and behaves as a
 * circular gallery: 4 hexes are fully visible in the center, two
 * "ghost" hexes peek in from each edge under the gradient masks,
 * and the prev/next arrows rotate the row by one card so a hidden
 * hex slides into view while a new one ghosts in on the other side.
 * Below xl it falls back to a static responsive grid. */
function FeaturedWritingRow({
  items,
  heading,
  viewAll: _viewAll,
  cardTitleFallback,
  cardAuthorFallback,
  wantToEngage,
  visitReadingRoom,
}: {
  items: FeaturedWritingItem[];
  heading: string;
  viewAll: string;
  cardTitleFallback: string;
  cardAuthorFallback: string;
  wantToEngage: string;
  visitReadingRoom: string;
}) {
  // Circular carousel state — same pattern as the home
  // "Recent Collaporations" gallery (see MagazineSupport.tsx).
  // The row renders three identical strips of items: pre-clones,
  // the real strip, and post-clones. `position` indexes the visual
  // position in the real strip and is allowed to briefly take the
  // out-of-range values -1 (trailing pre-clone) or itemCount
  // (leading post-clone) during a wrap so the slide can play out
  // naturally; a setTimeout fires after the transition completes,
  // silently snaps `position` back into [0, itemCount-1] with the
  // transition disabled for one render, and the loop continues —
  // no visible jump at the seam.
  const itemCount = items.length;
  const visible = 4;
  const hasCarousel = itemCount > visible;
  const [position, setPosition] = useState(0);
  const [animate, setAnimate] = useState(true);
  const wrapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state if the items list size changes under us.
  useEffect(() => {
    setPosition((p) => (p >= itemCount || p < 0 ? 0 : p));
  }, [itemCount]);

  // Clean up any pending wrap timer when the component unmounts so
  // we don't fire setState on a dead instance.
  useEffect(() => {
    return () => {
      if (wrapTimer.current) clearTimeout(wrapTimer.current);
    };
  }, []);

  const goNext = () => {
    if (!hasCarousel) return;
    if (wrapTimer.current) return;
    if (position >= itemCount - 1) {
      // Animate forward into the leading post-clone of items[0],
      // then snap back to the canonical position 0 with the
      // transition disabled so the user sees no jump.
      setPosition(itemCount);
      wrapTimer.current = setTimeout(() => {
        setAnimate(false);
        setPosition(0);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setAnimate(true);
            wrapTimer.current = null;
          });
        });
      }, CAROUSEL_TRANSITION_MS);
    } else {
      setPosition((p) => p + 1);
    }
  };

  const goPrev = () => {
    if (!hasCarousel) return;
    if (wrapTimer.current) return;
    if (position <= 0) {
      // Animate backward into the trailing pre-clone of the last
      // item, then snap to itemCount-1 silently.
      setPosition(-1);
      wrapTimer.current = setTimeout(() => {
        setAnimate(false);
        setPosition(itemCount - 1);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setAnimate(true);
            wrapTimer.current = null;
          });
        });
      }, CAROUSEL_TRANSITION_MS);
    } else {
      setPosition((p) => p - 1);
    }
  };

  return (
    <section aria-label={heading} className="mt-12">
      <header className="flex items-center" style={{ gap: "24px" }}>
        <div className="flex flex-col" style={{ gap: "4px" }}>
          <h2
            style={{
              fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "18px",
              lineHeight: "24px",
              color: "var(--tott-home-text-strong)",
              margin: 0,
            }}
          >
            <FirstWordGold raw={heading} />
          </h2>
        </div>
      </header>

      {/* Mobile / tablet / lg — responsive grid (no carousel). */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 xl:hidden">
        {items.slice(0, 4).map((item) => (
          <div key={item.id} className="flex justify-center">
            <FeaturedWritingCard
              item={item}
              cardTitleFallback={cardTitleFallback}
              cardAuthorFallback={cardAuthorFallback}
            />
          </div>
        ))}
      </div>

      {/* xl+ — full-bleed circular gallery. The wrapper breaks out
          of the parent's max-w-[1280px] container so the row spans
          the full viewport (the page <main> already sets
          overflow-x-hidden, so the breakout doesn't introduce a
          horizontal scrollbar). The inner row uses the same
          three-strip pattern as the home "Recent Collaporations"
          carousel: items rendered three times (pre + real + post).
          The translate formula `50% - half-window - (itemCount +
          position) * STEP` keeps real[position] aligned with the
          left edge of the central 4-card window. When position
          briefly enters the post-clone range (== itemCount) or
          pre-clone range (== -1), the slide animates naturally and
          we snap back to the canonical index after the transition
          finishes — the seam is invisible. */}
      <div
        className="relative mt-8 hidden overflow-hidden xl:block"
        style={{
          width: "100vw",
          marginLeft: "calc(50% - 50vw)",
          marginRight: "calc(50% - 50vw)",
        }}
      >
        {/* Inner clipping window — restricts the visible cards to the
            central 4-card window. Cards slide within this box; the
            side areas around it stay completely static so no partial
            hex peeks under the FILLER ghosts. */}
        <div
          className="relative mx-auto overflow-hidden"
          style={{ width: `${CARDS_WINDOW_WIDTH}px` }}
        >
        <div
          className="relative flex items-start"
          style={{
            gap: `${CAROUSEL_GAP}px`,
            transform: hasCarousel
              ? `translateX(-${
                  (itemCount + position) * CAROUSEL_STEP
                }px)`
              : undefined,
            transition: animate
              ? `transform ${CAROUSEL_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
              : "none",
            justifyContent: hasCarousel ? "flex-start" : "center",
          }}
        >
          {hasCarousel ? (
            <>
              {/* Pre-clone strip — items rendered once before the
                  real strip so position can dip to -1 (trailing
                  pre-clone of the last item) without exposing an
                  empty edge. */}
              {items.map((item) => (
                <FeaturedWritingCard
                  key={`pre-${item.id}`}
                  item={item}
                  cardTitleFallback={cardTitleFallback}
                  cardAuthorFallback={cardAuthorFallback}
                />
              ))}
              {/* Real strip — the canonical position 0..itemCount-1
                  lives here. */}
              {items.map((item) => (
                <FeaturedWritingCard
                  key={`real-${item.id}`}
                  item={item}
                  cardTitleFallback={cardTitleFallback}
                  cardAuthorFallback={cardAuthorFallback}
                />
              ))}
              {/* Post-clone strip — lets position climb to
                  itemCount (leading post-clone of items[0]) before
                  the snap back to 0. */}
              {items.map((item) => (
                <FeaturedWritingCard
                  key={`post-${item.id}`}
                  item={item}
                  cardTitleFallback={cardTitleFallback}
                  cardAuthorFallback={cardAuthorFallback}
                />
              ))}
            </>
          ) : (
            items.map((item) => (
              <FeaturedWritingCard
                key={`d-${item.id}`}
                item={item}
                cardTitleFallback={cardTitleFallback}
                cardAuthorFallback={cardAuthorFallback}
              />
            ))
          )}
        </div>
        </div>

        {/* Left ghost gradient — Content Grid Filler.png mirrored
            (scaleX(-1)) so the gradient fades from the screen edge
            inward. Sits above the cards at z-10 so a hex sliding
            under it appears as a ghost. */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 z-10"
          style={{
            left: "26px",
            width: `${GHOST_WIDTH}px`,
            height: "294px",
          }}
        >
          <Image
            src={FILLER}
            alt=""
            fill
            className="select-none object-cover"
            style={{
              transform: "scaleX(-1)",
              filter: "var(--tott-image-invert)",
            }}
            sizes={`${GHOST_WIDTH}px`}
            draggable={false}
          />
        </div>

        {/* Right ghost — same FILLER, no flip. */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 z-10"
          style={{
            right: "26px",
            width: `${GHOST_WIDTH}px`,
            height: "294px",
          }}
        >
          <Image
            src={FILLER}
            alt=""
            fill
            className="select-none object-cover"
            style={{ filter: "var(--tott-image-invert)" }}
            sizes={`${GHOST_WIDTH}px`}
            draggable={false}
          />
        </div>

        {/* Prev / Next nav arrows — only render when there are
            extra items beyond the 4 visible. Sit above the ghost
            gradients at z-20, vertically centered over the 294px
            card row (top: (294-40)/2 = 127). The carousel is
            circular, so neither button is ever disabled — clicking
            past the end loops back to the start. */}
        {hasCarousel ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous"
              className="absolute z-20 flex items-center justify-center transition-opacity hover:opacity-80"
              style={{
                width: "40px",
                height: "40px",
                left: "24px",
                top: "127px",
                borderRadius: "999px",
                backgroundColor: "var(--tott-panel-bg)",
                border: "1px solid var(--tott-card-border)",
                color: "var(--tott-home-text-strong)",
                boxShadow: "0px 1px 3px rgba(23, 23, 23, 0.4)",
              }}
            >
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
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="11 6 5 12 11 18" />
              </svg>
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next"
              className="absolute z-20 flex items-center justify-center transition-opacity hover:opacity-80"
              style={{
                width: "40px",
                height: "40px",
                right: "24px",
                top: "127px",
                borderRadius: "999px",
                backgroundColor: "var(--tott-panel-bg)",
                border: "1px solid var(--tott-card-border)",
                color: "var(--tott-home-text-strong)",
                boxShadow: "0px 1px 3px rgba(23, 23, 23, 0.4)",
              }}
            >
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
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="13 6 19 12 13 18" />
              </svg>
            </button>
          </>
        ) : null}
      </div>

      <div
        className="mt-8 flex flex-wrap items-center justify-center"
        style={{ gap: "12px" }}
      >
        <span
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "20px",
            color: "var(--tott-home-text-muted)",
          }}
        >
          {wantToEngage}
        </span>
        <Link
          href="/reading-room"
          className="inline-flex items-center transition-opacity hover:opacity-90"
          style={{
            gap: "6px",
            color: "var(--tott-accent-gold)",
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "14px",
            lineHeight: "20px",
          }}
        >
          {visitReadingRoom}
          <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}

/** Featured-writing card — identical visual structure to the home
 * `WriterCard`: Image-2.png silk hex frame (silhouette + fill),
 * Icon-4.svg top glyph, bottom-fade overlay with title + author
 * chip, chamfered "Featured" edition chip. Wrapped in a Link so
 * the whole hex routes through to the book detail page. */
function FeaturedWritingCard({
  item,
  cardTitleFallback,
  cardAuthorFallback,
}: {
  item: FeaturedWritingItem;
  cardTitleFallback: string;
  cardAuthorFallback: string;
}) {
  const cardTitle = item.title?.trim() || cardTitleFallback;
  const authorName = item.author?.trim() || cardAuthorFallback;
  const initial = (authorName || cardTitle).slice(0, 1).toUpperCase() || "A";

  return (
    <Link
      href={`/books/${item.slug}`}
      className="relative block w-full transition-opacity hover:opacity-90"
      style={{
        maxWidth: "276px",
        aspectRatio: "276 / 294",
        flexShrink: 0,
      }}
    >
      {item.coverImage ? (
        <Image
          src={item.coverImage}
          alt=""
          fill
          className="absolute inset-0 select-none object-cover opacity-70 mix-blend-luminosity"
          sizes="276px"
          draggable={false}
        />
      ) : null}
      <Image
        src={WRITER_CARD}
        alt=""
        fill
        className="select-none object-contain"
        sizes="276px"
        draggable={false}
      />

      <div
        aria-hidden
        className="absolute z-10"
        style={{
          width: "48px",
          height: "48px",
          left: "calc(50% - 24px)",
          top: "8px",
        }}
      >
        <Image
          src={WRITER_TOP_ICON}
          alt=""
          fill
          sizes="48px"
          className="select-none"
          draggable={false}
        />
      </div>

      <div
        className="absolute bottom-0 left-0 z-10 flex w-full flex-col items-center justify-end"
        style={{
          height: "55.78%",
          padding: "24px 24px 56px",
          gap: "8px",
          background: "var(--tott-writer-card-fade)",
        }}
      >
        <p
          className="line-clamp-2 w-full text-center"
          style={{
            maxWidth: "228px",
            fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "20px",
            lineHeight: "28px",
            color: "var(--tott-home-text-strong)",
            textShadow: "var(--tott-home-text-shadow)",
          }}
        >
          {cardTitle}
        </p>

        <div
          className="flex w-full flex-wrap items-center justify-center"
          style={{ maxWidth: "228px", gap: "4px 8px" }}
        >
          <span className="flex items-center" style={{ gap: "4px" }}>
            <span
              className="flex items-center justify-center"
              style={{
                width: "26px",
                height: "26px",
                background: "var(--tott-dash-gold-text)",
                border: "1px solid var(--tott-card-border)",
                borderRadius: "999px",
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "8.5px",
                lineHeight: "10px",
                color: "var(--tott-auth-btn-text)",
              }}
            >
              {initial}
            </span>
            <span
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "12px",
                lineHeight: "26px",
                color: "var(--tott-home-text-heading)",
                textShadow: "var(--tott-home-text-shadow)",
              }}
            >
              {authorName}
            </span>
          </span>
        </div>
      </div>

      <span
        className="absolute z-20 inline-flex items-center justify-center"
        style={{
          minWidth: "56px",
          height: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "0 10px",
          bottom: "24px",
          backgroundColor: "var(--tott-home-badge-bg)",
          color: "var(--tott-home-text-strong)",
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 500,
          fontSize: "12px",
          lineHeight: "26px",
          clipPath: CHIP_CHAMFER,
          WebkitClipPath: CHIP_CHAMFER,
        }}
      >
        Featured
      </span>
    </Link>
  );
}
