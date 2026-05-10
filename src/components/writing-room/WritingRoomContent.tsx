"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import { PersonIcon } from "@/components/ui/icons";
import { FirstWordGold } from "@/components/home/magazine/FirstWordGold";

const SILK_HEX = "/images/home/Book Cover.png";
const WRITING_ICON = "/images/writing-room/writing-icon.svg";
const EXPERIENCES_HONEYCOMB = "/images/writing-room/experiences-honeycomb.svg";
const QUOTE_ICON = "/images/writing-room/quote-icon.svg";
const NOTE_ICON = "/images/writing-room/note-icon.svg";
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
          style={{ gap: "16px" }}
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
              lineHeight: "32px",
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
        gap: "16px",
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
            fontSize: "16px",
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
        gap: "16px",
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
              lineHeight: "32px",
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
            lineHeight: "16px",
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

// ─── Featured Writing carousel-ish row ───────────────────────────

function FeaturedWritingRow({
  items,
  heading,
  viewAll,
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
  const [index, setIndex] = useState(0);
  const visible = 4;
  const max = Math.max(0, items.length - visible);
  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(max, i + 1));

  return (
    <section
      aria-label={heading}
      className="mt-12"
    >
      <div className="flex items-end justify-between">
        <h2
          style={{
            fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "20px",
            lineHeight: "28px",
            color: "var(--tott-home-text-strong)",
            margin: 0,
          }}
        >
          <FirstWordGold raw={heading} />
        </h2>
        <button
          type="button"
          className="text-sm font-medium transition-opacity hover:opacity-90"
          style={{ color: "var(--tott-accent-gold)" }}
        >
          {viewAll}
          <span aria-hidden> →</span>
        </button>
      </div>

      <div className="relative mt-6">
        <button
          type="button"
          onClick={goPrev}
          disabled={index === 0}
          aria-label="Previous"
          className="absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 -translate-x-2 items-center justify-center rounded-full transition-opacity hover:opacity-80 disabled:opacity-30 sm:flex"
          style={{
            width: "36px",
            height: "36px",
            border: "1px solid var(--tott-card-border)",
            backgroundColor: "var(--tott-panel-bg)",
            color: "var(--tott-home-text-strong)",
          }}
        >
          ←
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={index >= max}
          aria-label="Next"
          className="absolute right-0 top-1/2 z-10 hidden translate-x-2 -translate-y-1/2 items-center justify-center rounded-full transition-opacity hover:opacity-80 disabled:opacity-30 sm:flex"
          style={{
            width: "36px",
            height: "36px",
            border: "1px solid var(--tott-card-border)",
            backgroundColor: "var(--tott-panel-bg)",
            color: "var(--tott-home-text-strong)",
          }}
        >
          →
        </button>

        <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul
            className="flex"
            style={{
              gap: "16px",
              // Responsive scroll: shows 1.5 cards on mobile, ~2.5
              // on sm, 3 on md, 4 on lg+. Drag/scroll on touch.
              transform: `translateX(calc(${index} * -1 * (var(--card-w, 25%) + 16px)))`,
              transition: "transform 400ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {items.map((item) => (
              <li
                key={item.id}
                className="basis-[60%] shrink-0 sm:basis-[40%] md:basis-[calc((100%-32px)/3)] lg:basis-[calc((100%-48px)/4)]"
                style={{
                  minWidth: "160px",
                  maxWidth: "240px",
                }}
              >
                <Link
                  href={`/books/${item.slug}`}
                  className="flex flex-col items-center text-center transition-opacity hover:opacity-90"
                  style={{ gap: "12px" }}
                >
                  <span
                    className="relative w-full"
                    style={{ aspectRatio: "193 / 220" }}
                  >
                    {item.coverImage ? (
                      <Image
                        src={item.coverImage}
                        alt=""
                        fill
                        className="absolute inset-0 object-cover opacity-70 mix-blend-luminosity"
                        sizes="220px"
                      />
                    ) : null}
                    <Image
                      src={SILK_HEX}
                      alt=""
                      fill
                      sizes="220px"
                      className="object-contain"
                    />
                  </span>
                  <p
                    className="line-clamp-1"
                    style={{
                      fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                      fontWeight: 500,
                      fontSize: "14px",
                      lineHeight: "20px",
                      color: "var(--tott-home-text-strong)",
                      margin: 0,
                    }}
                  >
                    {item.title || cardTitleFallback}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Inter', var(--font-sans, sans-serif)",
                      fontWeight: 400,
                      fontSize: "12px",
                      lineHeight: "16px",
                      color: "var(--tott-home-text-muted)",
                      margin: 0,
                    }}
                  >
                    {item.author || cardAuthorFallback}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
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
