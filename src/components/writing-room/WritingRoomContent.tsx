"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import { FirstWordGold } from "@/components/home/magazine/FirstWordGold";
import { HexPatternBackdrop } from "@/components/home/magazine/HexPatternBackdrop";
import { SubmitNoteModal } from "@/components/writing-room/SubmitNoteModal";

const WRITING_ICON = "/images/writing-room/writing-icon.svg";
const EXPERIENCES_HONEYCOMB = "/images/writing-room/experiences-honeycomb.svg";
const QUOTE_ICON = "/images/writing-room/quote-icon.svg";
const NOTE_ICON = "/images/writing-room/note-icon.svg";
// 80×88 brand-exported hex with the person+ glyph + inner shadow
// baked in (Figma Icon-6). Used as the top badge of the
// "Join the Room" section, matching the home newsletter's Icon-5.
const JOIN_ROOM_ICON = "/images/writing-room/join-room-icon.svg";
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

export type FeaturedWritingItem = {
  id: string;
  slug: string;
  title: string;
  author: string;
  coverImage: string | null;
};

export type DictionaryItem = {
  id: string;
  word: string;
  body: string;
  author: string;
  role: string;
};

type Experience = {
  key: "exp1" | "exp2" | "exp3";
  /** When set, renders this as a full 56×64 SVG asset instead of
   * an inline glyph inside the CSS-built dark square. Lets the
   * brand-exported `Icon Wrapper-*.svg` files (with their baked
   * gradient + inner shadow) drop in directly. */
  iconSrc?: string;
  icon?: React.ReactNode;
  /** When set, the Enter CTA renders as an internal Link instead
   * of a plain button. */
  href?: string;
};

const EXPERIENCES: Experience[] = [
  {
    key: "exp1",
    iconSrc: "/images/writing-room/workshops-icon.svg",
    href: "/writing-room/workshops",
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

export function WritingRoomContent({
  featured,
  dictionary,
}: {
  featured: FeaturedWritingItem[];
  dictionary: DictionaryItem[];
}) {
  const t = useTranslations("Home.writingRoom");
  const [submitOpen, setSubmitOpen] = useState(false);

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

      <div className="relative mx-auto w-full max-w-[1280px] px-4 pb-16 pt-24 sm:px-6 sm:pt-28 md:px-8 md:pt-32 min-[1600px]:max-w-[1500px]">
        {/* ── Hero (Figma "Call To Action" frame) ──────────────
            Self-contained 64×72 writing icon with gradient + gold
            inset shadow baked into Icon-7.svg, then the gold-first
            title and two paragraphs of muted body copy. The frame
            is centered and capped at 552px on desktop, full width
            on small screens. */}
        <header
          className="mx-auto flex flex-col items-center text-center"
          style={{
            width: "100%",
            maxWidth: "552px",
            gap: "clamp(16px, 3vw, 24px)",
          }}
        >
          <span
            aria-hidden
            className="relative shrink-0 min-[1600px]:w-24! min-[1600px]:h-[108px]!"
            style={{
              width: "clamp(48px, 8vw, 64px)",
              height: "clamp(54px, 9vw, 72px)",
            }}
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
              className="min-[1600px]:text-[44px]! min-[1920px]:text-[56px]!"
              style={{
                fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                lineHeight: 1.25,
                margin: 0,
                color: "var(--tott-home-text-strong)",
              }}
            >
              <FirstWordGold raw={t("heroTitle")} />
            </h1>
            <p
              className="min-[1600px]:text-[17px]! min-[1600px]:leading-7!"
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "clamp(0.8125rem, 1.4vw, 0.875rem)",
                lineHeight: 1.5,
                letterSpacing: "-0.005em",
                color: "var(--tott-home-text-heading)",
                textShadow: "var(--tott-home-text-shadow)",
                margin: 0,
              }}
            >
              {t("heroSubtitle")}
            </p>
            <p
              className="min-[1600px]:text-[17px]! min-[1600px]:leading-7!"
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "clamp(0.8125rem, 1.4vw, 0.875rem)",
                lineHeight: 1.5,
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
          style={{
            padding:
              "clamp(12px, 2vw, 16px) clamp(12px, 3vw, 24px) clamp(24px, 4vw, 40px)",
          }}
        >
          <ChamferedFrame size={24} borderColor="var(--tott-card-border)" />
          <h2
            id="experiences-heading"
            className="mt-2 text-center min-[1600px]:text-[44px]!"
            style={{
              fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "clamp(1.25rem, 3vw, 2rem)",
              lineHeight: 1.25,
              color: "var(--tott-home-text-strong)",
              margin: 0,
            }}
          >
            {t("experiencesHeading")}
          </h2>
          <ul
            className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            style={{
              gap: "clamp(16px, 2.5vw, 24px)",
              padding: "clamp(8px, 2vw, 16px) clamp(0px, 2vw, 16px) 0",
            }}
          >
            {EXPERIENCES.map((e) => (
              <li key={e.key} className="flex justify-center">
                <ExperienceCard
                  icon={e.icon}
                  iconSrc={e.iconSrc}
                  href={e.href}
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
          style={{
            padding: "clamp(20px, 4vw, 32px) clamp(12px, 3vw, 24px)",
          }}
        >
          <ChamferedFrame size={24} borderColor="var(--tott-card-border)" />
          <header className="text-center">
            <h2
              id="dictionary-heading"
              className="min-[1600px]:text-[44px]!"
              style={{
                fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "clamp(1.25rem, 3vw, 2rem)",
                lineHeight: 1.25,
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
                fontSize: "clamp(0.75rem, 1.2vw, 0.8125rem)",
                lineHeight: 1.55,
                color: "var(--tott-home-text-muted)",
              }}
            >
              {t("dictionarySubtitle")}
            </p>
          </header>

          {dictionary.length > 0 ? (
            <ul
              className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              style={{
                gap: "clamp(16px, 2.5vw, 24px)",
                padding: "clamp(8px, 2vw, 16px) clamp(0px, 2vw, 16px) 0",
              }}
            >
              {dictionary.map((d) => (
                <li key={d.id} className="flex justify-center">
                  <DictionaryCard
                    word={d.word}
                    body={d.body}
                    author={d.author}
                    role={d.role}
                  />
                </li>
              ))}
            </ul>
          ) : null}

          {/* ── Action row (Figma "Labels") — gold primary first,
              dark secondary with trailing arrow second. ────── */}
          <div
            className="mt-8 flex flex-wrap items-center justify-center"
            style={{ gap: "12px" }}
          >
            {dictionary.length > 0 ? (
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
            ) : null}
            <button
              type="button"
              onClick={() => setSubmitOpen(true)}
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
          className="relative mt-16 overflow-hidden"
          style={{ padding: "32px 16px" }}
        >
          {/* Decorative cell-pattern backdrop — same component
              ("Join our cultural circle" newsletter section) so the
              two recruitment bands read as one consistent system.
              Absolute-positioned elements paint above non-positioned
              in-flow siblings by default, so the content sits inside
              a `relative z-10` wrapper to keep the icon, headline,
              and buttons stacked above the pattern. */}
          <HexPatternBackdrop />

          <div
            className="relative z-10 flex flex-col items-center text-center"
            style={{ gap: "clamp(18px, 2.5vw, 26px)" }}
          >
            {/* Brand-exported 80×88 hex badge (Icon-6) — dark fill +
                inner shadow + gold-tinted person+ glyph baked into
                the SVG. Mirrors the newsletter section's Icon-5
                treatment. */}
            <div
              aria-hidden
              className="relative"
              style={{
                width: "clamp(64px, 9vw, 80px)",
                height: "clamp(70px, 10vw, 88px)",
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
              className="min-[1600px]:text-[36px]!"
              style={{
                fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "clamp(1.125rem, 2.5vw, 1.5rem)",
                lineHeight: 1.25,
                color: "var(--tott-home-text-strong)",
                margin: 0,
              }}
            >
              {t("joinHeading")}
            </h2>
            <p
              className="max-w-xl min-[1600px]:max-w-2xl! min-[1600px]:text-[17px]! min-[1600px]:leading-7!"
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "clamp(0.8125rem, 1.4vw, 0.875rem)",
                lineHeight: 1.5,
                color: "var(--tott-home-text-muted)",
              }}
            >
              {t("joinBody")}
            </p>
            <div
              className="mt-2 flex flex-wrap items-center justify-center"
              style={{ gap: "12px" }}
            >
            {/* Primary — gold "Apply for Residency". */}
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
                letterSpacing: "-0.005em",
                border: "none",
              }}
            >
              {t("applyResidency")}
            </button>
            {/* Secondary — dark pill "Join a Workshop". */}
            <Link
              href="/writing-room/workshops"
              className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
              style={{
                height: "40px",
                padding: "8px 20px",
                borderRadius: "8px",
                backgroundColor: "var(--tott-card-border)",
                boxShadow: "inset 0px 1px 1px rgba(255, 255, 255, 0.08)",
                color: "var(--tott-home-text-strong)",
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "-0.005em",
              }}
            >
              {t("joinWorkshop")}
            </Link>
          </div>
          </div>
        </section>
      </div>

      <SubmitNoteModal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
      />
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
  href,
  title,
  body,
  ctaLabel,
}: {
  icon?: React.ReactNode;
  iconSrc?: string;
  href?: string;
  title: string;
  body: string;
  ctaLabel: string;
}) {
  const ctaStyle = {
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
  } as const;

  const ctaInner = (
    <>
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
    </>
  );
  return (
    <article
      className="relative flex w-full flex-col items-center min-[1600px]:max-w-[400px]! min-[1600px]:gap-9!"
      style={{
        maxWidth: "322px",
        padding: "clamp(20px, 3vw, 24px) clamp(20px, 4vw, 40px)",
        gap: "clamp(18px, 2.5vw, 26px)",
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
          className="min-[1600px]:text-[28px]!"
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "clamp(1.25rem, 2.4vw, 1.625rem)",
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
            color: "var(--tott-home-text-strong)",
            textAlign: "center",
            margin: 0,
          }}
        >
          {title}
        </h3>
        <p
          className="min-[1600px]:text-[17px]! min-[1600px]:leading-7!"
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 400,
            fontSize: "clamp(0.8125rem, 1.4vw, 0.875rem)",
            lineHeight: 1.45,
            letterSpacing: "-0.005em",
            color: "var(--tott-home-text-muted)",
            textAlign: "center",
            margin: 0,
          }}
        >
          {body}
        </p>
      </div>

      {/* Gold "Enter" pill with trailing arrow — Link when an
          href is supplied, plain button otherwise. */}
      {href ? (
        <Link
          href={href}
          className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
          style={ctaStyle}
        >
          {ctaInner}
        </Link>
      ) : (
        <button
          type="button"
          className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
          style={ctaStyle}
        >
          {ctaInner}
        </button>
      )}
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
      className="relative flex w-full flex-col min-[1600px]:max-w-[500px]!"
      style={{
        maxWidth: "410px",
        padding: "clamp(20px, 3vw, 24px) clamp(20px, 4vw, 40px)",
        gap: "clamp(18px, 2.5vw, 26px)",
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
            className="min-[1600px]:text-[28px]!"
            style={{
              fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "clamp(1.125rem, 2.2vw, 1.5rem)",
              lineHeight: 1.15,
              color: "var(--tott-home-text-strong)",
              margin: 0,
            }}
          >
            {word}
          </h3>
          <p
            className="min-[1600px]:text-[17px]! min-[1600px]:leading-7!"
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "clamp(0.8125rem, 1.4vw, 0.875rem)",
              lineHeight: 1.45,
              letterSpacing: "-0.005em",
              color: "var(--tott-home-text-muted)",
              margin: 0,
            }}
          >
            {body}
          </p>
          {author ? (
            <p
              className="min-[1600px]:text-[20px]!"
              style={{
                fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "clamp(1rem, 1.8vw, 1.25rem)",
                lineHeight: 1.35,
                color: "var(--tott-home-text-strong)",
                margin: 0,
              }}
            >
              {author}
            </p>
          ) : null}
        </div>
        {role ? (
          <p
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "clamp(0.6875rem, 1vw, 0.75rem)",
              lineHeight: 1.6,
              letterSpacing: "0.04em",
              color: "var(--tott-home-text-muted)",
              margin: 0,
              padding: "8px 0",
              textTransform: "uppercase",
            }}
          >
            {role}
          </p>
        ) : null}
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

// Small-screen single-card carousel — same pattern as the home
// "Recent Collaporations" gallery (see MagazineSupport.tsx). The
// active hex is centred and its neighbours peek in from either
// side, dimmed to 0.45 opacity.
const SMALL_CARD_W_CSS = "min(85vw, 276px)";
const SMALL_CARD_GAP = 24;

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
  // Visible-card count scales with viewport so big screens stop
  // pretending cards are hidden when they would actually fit. The
  // ghost-fade gradients and arrow buttons exist to hint at scroll —
  // when every item already fits in the row, both become misleading
  // and are suppressed. SSR starts at 4 (the conservative small
  // default) and hydrates to 5/6 client-side once we can measure the
  // viewport.
  const [visible, setVisible] = useState(4);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setVisible(w >= 1920 ? 6 : w >= 1600 ? 5 : 4);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const hasCarousel = itemCount > visible;
  // Small (sub-xl) gallery runs a single-card centred carousel
  // whenever there is more than one item — mirrors Recent
  // Collaporations on the home page.
  const hasSmallCarousel = itemCount > 1;
  const [position, setPosition] = useState(0);
  // `active` tracks the logical index of the focused card and is
  // kept in [0, itemCount). Used by the small carousel to dim
  // non-active cards (opacity 0.45) while keeping the active hex
  // at full opacity. Position can briefly fall outside that range
  // during a wrap-around slide before snapping back.
  const [active, setActive] = useState(0);
  const [animate, setAnimate] = useState(true);
  const wrapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state if the items list size changes under us.
  useEffect(() => {
    setPosition((p) => (p >= itemCount || p < 0 ? 0 : p));
    setActive((a) => (a >= itemCount || a < 0 ? 0 : a));
  }, [itemCount]);

  // Clean up any pending wrap timer when the component unmounts so
  // we don't fire setState on a dead instance.
  useEffect(() => {
    return () => {
      if (wrapTimer.current) clearTimeout(wrapTimer.current);
    };
  }, []);

  const goNext = () => {
    if (itemCount <= 1) return;
    if (wrapTimer.current) return;
    if (position >= itemCount - 1) {
      // Animate forward into the leading post-clone of items[0],
      // then snap back to the canonical position 0 with the
      // transition disabled so the user sees no jump.
      setPosition(itemCount);
      setActive(0);
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
      setActive((a) => a + 1);
    }
  };

  const goPrev = () => {
    if (itemCount <= 1) return;
    if (wrapTimer.current) return;
    if (position <= 0) {
      // Animate backward into the trailing pre-clone of the last
      // item, then snap to itemCount-1 silently.
      setPosition(-1);
      setActive(itemCount - 1);
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
      setActive((a) => a - 1);
    }
  };

  return (
    <section aria-label={heading} className="mt-12">
      <header className="flex items-center" style={{ gap: "24px" }}>
        <div className="flex flex-col" style={{ gap: "4px" }}>
          <h2
            className="min-[1600px]:text-[28px]! min-[1920px]:text-[32px]!"
            style={{
              fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "clamp(1rem, 2vw, 1.125rem)",
              lineHeight: 1.35,
              color: "var(--tott-home-text-strong)",
              margin: 0,
            }}
          >
            <FirstWordGold raw={heading} />
          </h2>
        </div>
      </header>

      {/* Mobile / tablet / lg — single-card centred carousel that
          mirrors the home "Recent Collaporations" gallery (see
          MagazineSupport). The active hex is centred at every
          viewport width and its neighbours peek in from each side,
          dimmed to 0.45 opacity. The translate formula
          `50% - (itemCount + position) * (cardW + gap) - cardW/2`
          keeps real[position] centred regardless of card width.
          Pre + real + post clone strips let position briefly take
          -1 / itemCount during a wrap so the slide animates
          naturally before snapping back to the canonical index. */}
      <div className="mt-8 xl:hidden">
        <div
          className="flex flex-col items-center"
          style={{ padding: "16px 0 8px", gap: "24px" }}
        >
          <div
            className="relative w-full overflow-hidden"
            role="region"
            aria-label={heading}
            aria-roledescription="carousel"
          >
            <div
              className="flex"
              style={{
                gap: `${SMALL_CARD_GAP}px`,
                justifyContent: hasSmallCarousel ? "flex-start" : "center",
                transform: hasSmallCarousel
                  ? `translateX(calc(50% - ${
                      itemCount + position
                    } * (${SMALL_CARD_W_CSS} + ${SMALL_CARD_GAP}px) - ${SMALL_CARD_W_CSS} / 2))`
                  : undefined,
                transition: animate
                  ? `transform ${CAROUSEL_TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
                  : "none",
              }}
            >
              {hasSmallCarousel ? (
                <>
                  {items.map((item) => (
                    <SmallCardSlot
                      key={`s-pre-${item.id}`}
                      item={item}
                      isActive={false}
                      cardTitleFallback={cardTitleFallback}
                      cardAuthorFallback={cardAuthorFallback}
                    />
                  ))}
                  {items.map((item, i) => (
                    <SmallCardSlot
                      key={`s-real-${item.id}`}
                      item={item}
                      isActive={i === active}
                      cardTitleFallback={cardTitleFallback}
                      cardAuthorFallback={cardAuthorFallback}
                    />
                  ))}
                  {items.map((item) => (
                    <SmallCardSlot
                      key={`s-post-${item.id}`}
                      item={item}
                      isActive={false}
                      cardTitleFallback={cardTitleFallback}
                      cardAuthorFallback={cardAuthorFallback}
                    />
                  ))}
                </>
              ) : (
                items.map((item) => (
                  <SmallCardSlot
                    key={`s-${item.id}`}
                    item={item}
                    isActive
                    cardTitleFallback={cardTitleFallback}
                    cardAuthorFallback={cardAuthorFallback}
                  />
                ))
              )}
            </div>
          </div>

          {hasSmallCarousel ? (
            <SmallNavArrows onPrev={goPrev} onNext={goNext} />
          ) : null}
        </div>
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
        className="relative mt-8 hidden overflow-hidden xl:block [--carousel-card-w:276px] [--carousel-gap:8px] min-[1600px]:[--carousel-card-w:320px] min-[1600px]:[--carousel-gap:12px] min-[1920px]:[--carousel-card-w:360px] min-[1920px]:[--carousel-gap:16px]"
        style={{
          width: "100vw",
          marginLeft: "calc(50% - 50vw)",
          marginRight: "calc(50% - 50vw)",
        }}
      >
        {/* Cards-window stage — sized to exactly min(visible,
            itemCount) cards wide. Acts as the positioning context
            for the inner clipping mask AND for the ghost gradients
            and arrow buttons, so those always sit at the visible
            edges of the cards row regardless of viewport width. */}
        <div
          className="relative mx-auto"
          style={{
            width: `calc(${Math.min(visible, itemCount)} * var(--carousel-card-w) + ${Math.max(0, Math.min(visible, itemCount) - 1)} * var(--carousel-gap))`,
          }}
        >
        <div className="relative overflow-hidden">
        <div
          className="relative flex items-start"
          style={{
            gap: "var(--carousel-gap)",
            transform: hasCarousel
              ? `translateX(calc(-1 * ${
                  itemCount + position
                } * (var(--carousel-card-w) + var(--carousel-gap))))`
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

        {/* Left + right ghost gradients — only rendered when there
            are enough items to trigger the carousel. With ≤4 items
            the row centres without scroll, so no edge fades are
            needed (and the arrow buttons are also suppressed). */}
        {hasCarousel ? (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 z-10 min-[1600px]:w-40! min-[1600px]:h-[341px]! min-[1600px]:-left-[176px]! min-[1920px]:w-[180px]! min-[1920px]:h-[384px]! min-[1920px]:-left-[196px]!"
              style={{
                left: `-${GHOST_WIDTH + 16}px`,
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
                sizes="(min-width: 1920px) 180px, (min-width: 1600px) 160px, 138px"
                draggable={false}
              />
            </div>

            <div
              aria-hidden
              className="pointer-events-none absolute top-0 z-10 min-[1600px]:w-40! min-[1600px]:h-[341px]! min-[1600px]:-right-[176px]! min-[1920px]:w-[180px]! min-[1920px]:h-[384px]! min-[1920px]:-right-[196px]!"
              style={{
                right: `-${GHOST_WIDTH + 16}px`,
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
                sizes="(min-width: 1920px) 180px, (min-width: 1600px) 160px, 138px"
                draggable={false}
              />
            </div>
          </>
        ) : null}

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
              className="absolute z-20 flex items-center justify-center transition-opacity hover:opacity-80 min-[1600px]:w-12! min-[1600px]:h-12! min-[1600px]:top-[148px]! min-[1600px]:-left-24! min-[1920px]:w-14! min-[1920px]:h-14! min-[1920px]:top-[165px]! min-[1920px]:-left-28!"
              style={{
                width: "40px",
                height: "40px",
                left: "-72px",
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
              className="absolute z-20 flex items-center justify-center transition-opacity hover:opacity-80 min-[1600px]:w-12! min-[1600px]:h-12! min-[1600px]:top-[148px]! min-[1600px]:-right-24! min-[1920px]:w-14! min-[1920px]:h-14! min-[1920px]:top-[165px]! min-[1920px]:-right-28!"
              style={{
                width: "40px",
                height: "40px",
                right: "-72px",
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
      </div>

      <div
        className="mt-8 flex flex-col items-center justify-center"
        style={{ gap: "12px" }}
      >
        <span
          className="min-[1600px]:text-[17px]! min-[1600px]:leading-7!"
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 400,
            fontSize: "clamp(0.8125rem, 1.4vw, 0.875rem)",
            lineHeight: 1.45,
            color: "var(--tott-home-text-muted)",
            textAlign: "center",
          }}
        >
          {wantToEngage}
        </span>
        <Link
          href="/reading-room"
          className="inline-flex items-center justify-center transition-opacity hover:opacity-90 min-[1600px]:h-14! min-[1600px]:text-base!"
          style={{
            height: "40px",
            padding: "8px 16px",
            gap: "8px",
            borderRadius: "8px",
            backgroundColor: "var(--tott-card-border)",
            boxShadow: "inset 0px 1px 1px rgba(255, 255, 255, 0.08)",
            color: "var(--tott-home-text-strong)",
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "14px",
            lineHeight: "20px",
            letterSpacing: "-0.005em",
          }}
        >
          {visitReadingRoom}
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
        maxWidth: "var(--carousel-card-w, 276px)",
        width: "var(--carousel-card-w, 276px)",
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
          sizes="(min-width: 1920px) 360px, (min-width: 1600px) 320px, 276px"
          draggable={false}
        />
      ) : null}
      <Image
        src={WRITER_CARD}
        alt=""
        fill
        className="select-none object-contain"
        sizes="(min-width: 1920px) 360px, (min-width: 1600px) 320px, 276px"
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

// ─── Small-screen carousel pieces ────────────────────────────────

/** One slot in the small-screen carousel — fixed width
 * `min(85vw, 276px)` so neighbours can peek in from either side,
 * with opacity dimming for non-active cards. Mirrors the dimming
 * behaviour of the Recent Collaporations card on the home page. */
function SmallCardSlot({
  item,
  isActive,
  cardTitleFallback,
  cardAuthorFallback,
}: {
  item: FeaturedWritingItem;
  isActive: boolean;
  cardTitleFallback: string;
  cardAuthorFallback: string;
}) {
  return (
    <div
      className="shrink-0"
      style={{
        width: SMALL_CARD_W_CSS,
        opacity: isActive ? 1 : 0.45,
        transition: "opacity 400ms ease",
      }}
      aria-hidden={isActive ? undefined : true}
    >
      <FeaturedWritingCard
        item={item}
        cardTitleFallback={cardTitleFallback}
        cardAuthorFallback={cardAuthorFallback}
      />
    </div>
  );
}

/** Round gold ← / → arrow pair — matches the NavArrows used by
 * the home "Recent Collaporations" gallery (MagazineSupport). */
function SmallNavArrows({
  onPrev,
  onNext,
}: {
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center" style={{ gap: "80px" }}>
      <button
        type="button"
        aria-label="Previous"
        onClick={onPrev}
        className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tott-accent-gold)]"
        style={{
          border: "2px solid var(--tott-accent-gold)",
          color: "var(--tott-accent-gold)",
        }}
      >
        <span aria-hidden className="text-xl">
          ←
        </span>
      </button>
      <button
        type="button"
        aria-label="Next"
        onClick={onNext}
        className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--tott-accent-gold)]"
        style={{
          border: "2px solid var(--tott-accent-gold)",
          color: "var(--tott-accent-gold)",
        }}
      >
        <span aria-hidden className="text-xl">
          →
        </span>
      </button>
    </div>
  );
}
