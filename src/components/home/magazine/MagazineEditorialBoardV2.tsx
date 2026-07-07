"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FollowButton } from "@/components/writers/FollowButton";

// Same silk-hex + top-icon brand assets used by the writing-room
// "Discover Featured Writing" row, so the Editorial Board gallery
// reads as the same component on both pages.
const WRITER_CARD = "/images/home/Image-2.png";
const WRITER_TOP_ICON = "/images/home/Icon-4.svg";

// Mask the bottom 164-px fade overlay to the silk-hex silhouette so
// the rectangular gradient corners don't darken adjacent cards in
// the Our People honeycomb tessellation. Using the silk PNG itself
// as a mask keeps the gradient's edge anti-aliased and pixel-aligned
// with the rendered silk hex (rather than the hard polygon edge a
// clip-path produces).
const HEX_FADE_MASK = {
  WebkitMaskImage: `url(${WRITER_CARD})`,
  maskImage: `url(${WRITER_CARD})`,
  WebkitMaskSize: "100% auto",
  maskSize: "100% auto",
  WebkitMaskPosition: "left bottom",
  maskPosition: "left bottom",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  maskMode: "alpha",
} as React.CSSProperties;

// Clip a real avatar photo to the full silk-hex silhouette using the same PNG
// alpha as a mask, centered to line up with the `object-contain` silk below.
// This lets a portrait fill the hex in full colour instead of ghosting behind
// the silk (which washes real faces into a grey smudge).
const HEX_PHOTO_MASK = {
  WebkitMaskImage: `url(${WRITER_CARD})`,
  maskImage: `url(${WRITER_CARD})`,
  WebkitMaskSize: "100% auto",
  maskSize: "100% auto",
  WebkitMaskPosition: "center center",
  maskPosition: "center center",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  maskMode: "alpha",
} as React.CSSProperties;

// Graduated backdrop-blur mask: the hex silhouette AND a vertical fade
// (transparent at the top → opaque at the bottom), composited together so the
// blur ramps in gradually instead of starting on a hard horizontal edge.
const HEX_BLUR_MASK = {
  WebkitMaskImage: `url(${WRITER_CARD}), linear-gradient(to top, #000 22%, transparent 92%)`,
  maskImage: `url(${WRITER_CARD}), linear-gradient(to top, #000 22%, transparent 92%)`,
  WebkitMaskSize: "100% auto, 100% 100%",
  maskSize: "100% auto, 100% 100%",
  WebkitMaskPosition: "left bottom, left bottom",
  maskPosition: "left bottom, left bottom",
  WebkitMaskRepeat: "no-repeat, no-repeat",
  maskRepeat: "no-repeat, no-repeat",
  WebkitMaskComposite: "source-in",
  maskComposite: "intersect",
} as React.CSSProperties;

/* ─────────────────────────── tokens (Figma) ─────────────────────────── */
// All colors resolve to CSS variables in globals.css so the cards
// swap with the dark/light theme.
const EYEBROW = "var(--tott-home-eyebrow)";
const TEXT_STRONG = "var(--tott-home-text-strong)";
const TEXT_META = "var(--tott-home-text-heading)";
const TEXT_MUTED = "var(--tott-home-text-muted)";
const GOLD_TEXT = "var(--tott-auth-btn-text)";
const AVATAR_BG = "var(--tott-dash-gold-text)";
const CARD_W = 276;
const CARD_H = 294;

/* ─────────────────────────── types ─────────────────────────── */
export type FollowWriterItem = {
  id: string;
  /** User id the follow toggle targets (writer profiles wrap a user). */
  userId?: string | null;
  name: string;
  title?: string | null;
  edition?: string | null;
  avatar?: string | null;
  /** Role pill on the carousel card (Editor / Writer / Translator / …).
   * Falls back to "Editor" when missing. */
  role?: string | null;
};

export type RoleCounts = {
  editors: number;
  writers: number;
  translators: number;
  contributors: number;
  reviewers: number;
};

export type MagazineEditorialBoardProps = {
  writers: FollowWriterItem[];
  /** Counts shown on the "Our People" hex cluster. Defaults match
   *  the Figma sample (6 / 8 / 4 / 5 / 2). */
  roleCounts?: RoleCounts;
};

const DEFAULT_ROLE_COUNTS: RoleCounts = {
  editors: 6,
  writers: 8,
  translators: 4,
  contributors: 5,
  reviewers: 2,
};

// "Our People" shows invented role counts (Editors/Translators/Reviewers) the
// backend has no data for. Hidden until the backend exposes real masthead roles
// — flip to true to re-enable. The carousel below shows only real writers.
const SHOW_OUR_PEOPLE = false;

/* ─────────────────────────── page entry ─────────────────────────── */
export function MagazineEditorialBoardV2({
  writers,
  roleCounts = DEFAULT_ROLE_COUNTS,
}: MagazineEditorialBoardProps) {
  const t = useTranslations("Home.magazine.editorialBoard");
  // All board writers — the carousel scrolls when the row overflows.
  const carouselWriters = writers;

  return (
    <div
      className="mx-auto flex w-full max-w-[1128px] flex-col items-center"
      style={{ gap: 32 }}
    >
      <BoardHeader
        eyebrow={t("mastheadEyebrow")}
        heading={t("mastheadHeading")}
        body={t("mastheadBody")}
      />

      <Carousel
        writers={carouselWriters}
        cardTitlePlaceholder={t("writerCardTitle")}
        authorPlaceholder={t("writerAuthor")}
        rolePlaceholder={t("rolePlaceholder")}
      />

      {SHOW_OUR_PEOPLE ? (
        <OurPeople
          eyebrow={t("peopleEyebrow")}
          heading={t("peopleHeading")}
          counts={roleCounts}
          labels={{
            editors: t("roleEditors"),
            writers: t("roleWriters"),
            translators: t("roleTranslators"),
            contributors: t("roleContributors"),
            reviewers: t("roleReviewers"),
          }}
        />
      ) : null}
    </div>
  );
}

/* ─────────────────────────── Section header ─────────────────────────── */
function BoardHeader({
  eyebrow,
  heading,
  body,
}: {
  eyebrow: string;
  heading: string;
  body: string;
}) {
  return (
    <div className="flex w-full flex-col items-center" style={{ gap: 8 }}>
      <p
        style={{
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 400,
          fontSize: 14,
          lineHeight: "20px",
          letterSpacing: "-0.005em",
          color: EYEBROW,
          textShadow: "var(--tott-home-text-shadow)",
          margin: 0,
          textAlign: "center",
        }}
      >
        {eyebrow}
      </p>
      <h2
        style={{
          fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
          fontWeight: 500,
          fontSize: 32,
          lineHeight: "40px",
          color: TEXT_STRONG,
          margin: 0,
          textAlign: "center",
        }}
      >
        {heading}
      </h2>
      <p
        className="max-w-[442px]"
        style={{
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 400,
          fontSize: 14,
          lineHeight: "20px",
          letterSpacing: "-0.005em",
          color: TEXT_MUTED,
          textShadow: "var(--tott-home-text-shadow)",
          margin: 0,
          textAlign: "center",
        }}
      >
        {body}
      </p>
    </div>
  );
}

/* ─────────────────────────── Grid ─────────────────────────── */
function Carousel({
  writers,
  cardTitlePlaceholder,
  authorPlaceholder,
  rolePlaceholder,
}: {
  writers: FollowWriterItem[];
  cardTitlePlaceholder: string;
  authorPlaceholder: string;
  rolePlaceholder: string;
}) {
  // Responsive grid: cards wrap onto new rows. auto-fit + minmax keeps
  // the CARD_W column width and fills as many columns as fit, centred.
  return (
    <div
      className="flex w-full flex-wrap justify-center"
      style={{ gap: 8 }}
    >
      {writers.map((w) => (
        <div key={w.id} style={{ width: CARD_W }}>
          <CarouselCard
            writer={w}
            cardTitlePlaceholder={cardTitlePlaceholder}
            authorPlaceholder={authorPlaceholder}
            rolePlaceholder={rolePlaceholder}
          />
        </div>
      ))}
    </div>
  );
}

function CarouselCard({
  writer,
  cardTitlePlaceholder,
  authorPlaceholder,
  rolePlaceholder,
}: {
  writer: FollowWriterItem;
  cardTitlePlaceholder: string;
  authorPlaceholder: string;
  rolePlaceholder: string;
}) {
  const title = writer.title?.trim() || writer.name?.trim() || cardTitlePlaceholder;
  const author = writer.name?.trim() || authorPlaceholder;
  const date = writer.edition?.trim() || "";
  const role = writer.role?.trim() || rolePlaceholder;
  // Card links to the writer's profile when we have an id.
  const profileHref = writer.id
    ? `/writers/${encodeURIComponent(writer.id)}`
    : "/writing-room";

  // Cursor-follow 3D tilt. Map pointer position within the card to a
  // rotateX/Y (max ±MAX_TILT deg); reset to flat on leave. CSS can't read
  // cursor coords, so this is the minimum JS needed.
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const MAX_TILT = 8;
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5; // -0.5..0.5
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: -py * 2 * MAX_TILT, y: px * 2 * MAX_TILT });
  };
  const onLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div className="flex flex-col items-center" style={{ width: CARD_W }}>
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="relative block w-full transition-[transform,opacity] duration-150 ease-out hover:opacity-90"
      style={{
        height: CARD_H,
        width: CARD_W,
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Stretched navigation link — covers the whole card. */}
      <Link
        href={profileHref}
        aria-label={author}
        className="absolute inset-0 z-[25]"
      />

      {/* Silk hex card — Image-2.png provides both the silhouette and
          the silk fill (transparent outside the hex). Drawn first so it's
          the fallback fill behind a real avatar (and the whole card when
          there's no photo). Same brand asset used by the writing-room
          "Discover Featured Writing" gallery. */}
      <Image
        src={WRITER_CARD}
        alt=""
        fill
        className="select-none object-contain"
        sizes="276px"
        draggable={false}
      />

      {/* Real avatar photo — clipped to the hex silhouette and shown in full
          colour on top of the silk (not ghosted behind it). External signed
          GCS URL, so `unoptimized` to dodge the Next optimizer 502. */}
      {writer.avatar ? (
        <Image
          src={writer.avatar}
          alt=""
          fill
          unoptimized
          className="absolute inset-0 select-none object-cover"
          style={HEX_PHOTO_MASK}
          sizes="276px"
          draggable={false}
        />
      ) : null}

      {/* Top icon — Icon-4.svg, the 48×48 brand-exported hex glyph that
          sits above the card. */}
      <div
        aria-hidden
        className="absolute z-10"
        style={{
          width: 48,
          height: 48,
          left: "calc(50% - 24px)",
          top: 8,
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

      {/* Graduated backdrop blur — a dedicated layer behind the text so the
          blur fades in from the top instead of a hard edge. Kept separate from
          the text overlay so the gradient mask doesn't fade the title/meta. */}
      <div
        aria-hidden
        className="pointer-events-none absolute z-10"
        style={{
          left: 0,
          right: 0,
          bottom: 0,
          height: 164,
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          ...HEX_BLUR_MASK,
        }}
      />

      {/* Bottom text overlay — Figma "Text" frame (276×164, padding
          24/24/56, gap 8, justify-end). Background is the shared
          --tott-writer-card-fade gradient so the title and meta read
          cleanly over the silk hex (blur handled by the layer above). */}
      <div
        className="absolute z-10"
        style={{
          left: 0,
          right: 0,
          bottom: 0,
          height: 164,
          padding: "24px 24px 56px",
          gap: 8,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "center",
          background: "var(--tott-writer-card-fade)",
          ...HEX_FADE_MASK,
        }}
      >
        <h3
          style={{
            fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: 20,
            lineHeight: "28px",
            color: TEXT_STRONG,
            textShadow: "var(--tott-home-text-shadow)",
            margin: 0,
            textAlign: "center",
            width: 228,
          }}
        >
          {title}
        </h3>

        <div
          className="flex flex-wrap items-center justify-center"
          style={{ gap: "4px 8px", maxWidth: 228 }}
        >
          {title !== author ? (
            <span className="inline-flex items-center" style={{ gap: 4 }}>
              <Avatar name={author} />
              <span
                style={{
                  fontFamily: "'Inter', var(--font-sans, sans-serif)",
                  fontWeight: 400,
                  fontSize: 12,
                  lineHeight: "16px",
                  color: TEXT_META,
                  textShadow: "var(--tott-home-text-shadow)",
                }}
              >
                {author}
              </span>
            </span>
          ) : null}

          {date ? (
            <span className="inline-flex items-center" style={{ gap: 4 }}>
              <CalendarIcon />
              <span
                style={{
                  fontFamily: "'Inter', var(--font-sans, sans-serif)",
                  fontWeight: 400,
                  fontSize: 12,
                  lineHeight: "16px",
                  color: TEXT_META,
                  textShadow: "var(--tott-home-text-shadow)",
                }}
              >
                {date}
              </span>
            </span>
          ) : null}
        </div>
      </div>

      {/* Role pill — sits over the bottom fade, centered, with the
          dark chevron caps from the Figma comp. */}
      <RolePill label={role} />
    </div>

      {/* Follow button — centered beneath the hex card so it reads as a
          tidy action for the profile rather than floating over the photo. */}
      {writer.userId ? (
        <div className="mt-3">
          <FollowButton targetUserId={writer.userId} size="sm" />
        </div>
      ) : null}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <span
      className="relative inline-flex items-center justify-center"
      style={{
        width: 16,
        height: 16,
        borderRadius: 999,
        backgroundColor: AVATAR_BG,
        border: "1px solid var(--tott-card-border)",
      }}
    >
      <span
        style={{
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 500,
          fontSize: 8.5,
          lineHeight: "10px",
          color: GOLD_TEXT,
        }}
      >
        {initial}
      </span>
    </span>
  );
}

function RolePill({ label }: { label: string }) {
  // z-20 sits above the bottom gradient overlay (z-10) so the pill
  // stays visible over the fade-to-#171717 area at the bottom of the
  // silk hex.
  return (
    <div
      className="absolute z-20"
      style={{
        left: "50%",
        bottom: 24,
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "stretch",
        height: 24,
      }}
    >
      <span style={chevronStyle("left")} />
      <span
        style={{
          backgroundColor: "var(--tott-home-badge-bg)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          padding: "4px 0",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minWidth: 40,
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: 12,
            lineHeight: "16px",
            color: TEXT_STRONG,
            padding: "0 4px",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
      </span>
      <span style={chevronStyle("right")} />
    </div>
  );
}

function chevronStyle(direction: "left" | "right"): React.CSSProperties {
  return {
    width: 8,
    height: 24,
    backgroundColor: "var(--tott-home-badge-bg)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    clipPath:
      direction === "left"
        ? "polygon(100% 0, 100% 100%, 0 50%)"
        : "polygon(0 0, 0 100%, 100% 50%)",
  };
}

/* ─────────────────────────── Our People honeycomb ─────────────────────────── */
function OurPeople({
  eyebrow,
  heading,
  counts,
  labels,
}: {
  eyebrow: string;
  heading: string;
  counts: RoleCounts;
  labels: Record<keyof RoleCounts, string>;
}) {
  // 5 cards in a 3-row honeycomb pattern matching Figma Group 11:
  //   row 0 (y=84):  ─ Editors      Writers      ─
  //   row 1 (y=322): Translators  Contributors  Reviewers
  // Coordinates inside the 860×532 box.
  const cells: Array<{ key: keyof RoleCounts; x: number; y: number }> = [
    { key: "editors",      x: 274, y: 84 },
    { key: "writers",      x: 566, y: 84 },
    { key: "translators",  x: 134, y: 322 },
    { key: "contributors", x: 426, y: 322 },
    { key: "reviewers",    x: 718, y: 322 },
  ];

  return (
    <div className="flex w-full flex-col items-center" style={{ gap: 16 }}>
      <SectionHeader eyebrow={eyebrow} heading={heading} />

      {/* Desktop — Figma Group 11 (860×532) with absolute-positioned
          hex cards in a honeycomb tessellation. Cards' x/y come from
          the Figma comp; we subtract the left/top of the bounding box
          (134/84) so the cluster's leftmost+topmost edges sit at 0,0. */}
      <div
        className="relative hidden min-[896px]:block"
        style={{ width: 860, height: 532 }}
      >
        {cells.map((c) => (
          <div
            key={c.key}
            className="absolute"
            style={{
              left: c.x - 134,
              top: c.y - 84,
              width: CARD_W,
              height: CARD_H,
            }}
          >
            <PeopleHexCard label={labels[c.key]} count={counts[c.key]} />
          </div>
        ))}
      </div>

      {/* Mobile / tablet — flex wrap, cards scale with the container
          so they don't overflow on narrow viewports. */}
      <div
        className="grid w-full grid-cols-2 place-items-center gap-4 px-4 sm:grid-cols-3 min-[896px]:hidden"
        style={{ maxWidth: 860 }}
      >
        {cells.map((c) => (
          <PeopleHexCard
            key={c.key}
            label={labels[c.key]}
            count={counts[c.key]}
          />
        ))}
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  heading,
}: {
  eyebrow: string;
  heading: string;
}) {
  return (
    <div className="flex w-full flex-col items-center" style={{ gap: 8 }}>
      <p
        style={{
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 400,
          fontSize: 14,
          lineHeight: "20px",
          letterSpacing: "-0.005em",
          color: EYEBROW,
          textShadow: "var(--tott-home-text-shadow)",
          margin: 0,
          textAlign: "center",
        }}
      >
        {eyebrow}
      </p>
      <h2
        style={{
          fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
          fontWeight: 500,
          fontSize: 32,
          lineHeight: "40px",
          color: TEXT_STRONG,
          margin: 0,
          textAlign: "center",
        }}
      >
        {heading}
      </h2>
    </div>
  );
}

function PeopleHexCard({ label, count }: { label: string; count: number }) {
  // Fills its parent's box; the parent (desktop honeycomb absolute
  // wrapper / mobile responsive grid cell) sets the size so this card
  // works in both layouts without breaking at narrow viewports.
  return (
    <article
      className="relative w-full"
      style={{ maxWidth: CARD_W, aspectRatio: `${CARD_W} / ${CARD_H}` }}
    >
      {/* Same silk-hex + top-icon pair the carousel uses, for a
          consistent "gallery shape" with the writing-room Discover
          Featured Writing row. */}
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
          width: 48,
          height: 48,
          left: "calc(50% - 24px)",
          top: 8,
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

      {/* Role title at the bottom — same gradient overlay + blur as
          the carousel card so the label reads cleanly over the silk. */}
      <div
        className="absolute z-10"
        style={{
          left: 0,
          right: 0,
          bottom: 0,
          height: 164,
          padding: "24px 24px 56px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          alignItems: "center",
          textAlign: "center",
          background: "var(--tott-writer-card-fade)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          ...HEX_FADE_MASK,
        }}
      >
        <h3
          style={{
            fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: 20,
            lineHeight: "28px",
            color: TEXT_STRONG,
            textShadow: "var(--tott-home-text-shadow)",
            margin: 0,
          }}
        >
          {label} ({count})
        </h3>
      </div>
    </article>
  );
}

/* ─────────────────────────── inline icons ─────────────────────────── */
function CalendarIcon() {
  // Figma "Vector": 1.25px white-80% stroke + 0px 1px 2px black-32%
  // drop shadow. Applied via filter so the shadow follows the icon's
  // outline rather than the surrounding box.
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      style={{
        // Stroke follows the theme via `currentColor`, set by the
        // wrapping span/h3's `color` style. Drop-shadow stays as a
        // raw rgba — it's a decorative depth cue, theme-agnostic.
        color: TEXT_META,
        filter: "drop-shadow(var(--tott-home-text-shadow))",
      }}
    >
      <rect
        x="2.67"
        y="3.33"
        width="10.67"
        height="10.67"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M5.33 1.83v3.33M10.67 1.83v3.33M2.67 7h10.67"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}


