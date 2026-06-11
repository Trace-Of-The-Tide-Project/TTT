"use client";

import { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FollowButton } from "@/components/writers/FollowButton";

// Same silk-hex + top-icon brand assets used by the writing-room
// "Discover Featured Writing" row, so the Editorial Board gallery
// reads as the same component on both pages.
const WRITER_CARD = "/images/home/Image-2.png";
const WRITER_TOP_ICON = "/images/home/Icon-4.svg";
const FILLER = "/images/home/Content Grid Filler.png";
const GHOST_WIDTH = 138;

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

const FALLBACK_WRITERS: FollowWriterItem[] = Array.from({ length: 4 }, (_, i) => ({
  id: `pf-writer-${i}`,
  name: "Author",
  title: null,
  edition: "12.05",
  avatar: null,
  role: "Editors",
}));

/* ─────────────────────────── page entry ─────────────────────────── */
export function MagazineEditorialBoardV2({
  writers,
  roleCounts = DEFAULT_ROLE_COUNTS,
}: MagazineEditorialBoardProps) {
  const t = useTranslations("Home.magazine.editorialBoard");
  const carouselWriters = [...writers, ...FALLBACK_WRITERS].slice(0, 4);

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
        previousLabel={t("previousSlide")}
        nextLabel={t("nextSlide")}
      />

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

/* ─────────────────────────── Carousel ─────────────────────────── */
function Carousel({
  writers,
  cardTitlePlaceholder,
  authorPlaceholder,
  rolePlaceholder,
  previousLabel,
  nextLabel,
}: {
  writers: FollowWriterItem[];
  cardTitlePlaceholder: string;
  authorPlaceholder: string;
  rolePlaceholder: string;
  previousLabel: string;
  nextLabel: string;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (dx: number) => {
    scrollRef.current?.scrollBy({ left: dx, behavior: "smooth" });
  };

  return (
    // Carousel mechanics are pinned to LTR: the row is scrolled with
    // scrollBy({ left }) and the prev/next arrows + ghost gradients are
    // positioned with physical left/right offsets. Under RTL the flex
    // row reverses and scrollLeft inverts, so the arrows scroll the
    // wrong way and cards shift. dir="ltr" keeps the scroll + arrows
    // consistent; the card content is centre-aligned so Arabic still
    // renders correctly. No-op on LTR locales.
    <div dir="ltr" className="relative w-full">
      {/* Side ghost gradients — same `Content Grid Filler.png` strip
          the writing-room "Discover Featured Writing" row uses, so
          the next/previous hexagon peeks in under a matching fade. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 z-10 hidden sm:block"
        style={{
          left: -GHOST_WIDTH - 16,
          width: GHOST_WIDTH,
          height: CARD_H,
        }}
      >
        <Image
          src={FILLER}
          alt=""
          fill
          className="select-none object-cover"
          style={{ transform: "scaleX(-1)" }}
          sizes={`${GHOST_WIDTH}px`}
          draggable={false}
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 z-10 hidden sm:block"
        style={{
          right: -GHOST_WIDTH - 16,
          width: GHOST_WIDTH,
          height: CARD_H,
        }}
      >
        <Image
          src={FILLER}
          alt=""
          fill
          className="select-none object-cover"
          sizes={`${GHOST_WIDTH}px`}
          draggable={false}
        />
      </div>

      {/* Scrollable card row. Snap helps the arrow buttons feel
          responsive when the row overflows on narrow viewports. */}
      <div
        ref={scrollRef}
        className="flex w-full overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          gap: 8,
          padding: "0 4px",
          scrollSnapType: "x mandatory",
        }}
      >
        {writers.map((w) => (
          <div
            key={w.id}
            className="shrink-0"
            style={{ width: CARD_W, scrollSnapAlign: "start" }}
          >
            <CarouselCard
              writer={w}
              cardTitlePlaceholder={cardTitlePlaceholder}
              authorPlaceholder={authorPlaceholder}
              rolePlaceholder={rolePlaceholder}
            />
          </div>
        ))}
      </div>

      {/* Slide-navigator buttons. Same panel-bg + card-border outline
          + soft drop shadow the writing-room arrows use, positioned
          outside the card row in the fade strip. */}
      <button
        type="button"
        aria-label={previousLabel}
        onClick={() => scrollBy(-(CARD_W + 8))}
        className="absolute z-20 hidden h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-80 sm:flex"
        style={{
          left: -72,
          top: (CARD_H - 40) / 2,
          backgroundColor: "var(--tott-panel-bg)",
          border: "1px solid var(--tott-card-border)",
          color: "var(--tott-home-text-strong)",
          boxShadow: "var(--tott-home-text-shadow)",
        }}
      >
        <ArrowIcon direction="left" />
      </button>
      <button
        type="button"
        aria-label={nextLabel}
        onClick={() => scrollBy(CARD_W + 8)}
        className="absolute z-20 hidden h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-80 sm:flex"
        style={{
          right: -72,
          top: (CARD_H - 40) / 2,
          backgroundColor: "var(--tott-panel-bg)",
          border: "1px solid var(--tott-card-border)",
          color: "var(--tott-home-text-strong)",
          boxShadow: "var(--tott-home-text-shadow)",
        }}
      >
        <ArrowIcon direction="right" />
      </button>
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
  // Card links to the writer's profile when we have an id; the
  // follow button sits above the stretched link as an interactive
  // island so clicking it doesn't navigate.
  const profileHref = writer.id
    ? `/writers/${encodeURIComponent(writer.id)}`
    : "/writing-room";

  return (
    <div
      className="relative block w-full transition-opacity hover:opacity-90"
      style={{ height: CARD_H, width: CARD_W }}
    >
      {/* Stretched navigation link — covers the whole card (z-25, above
          the silk + text overlay but below the follow island at z-30). */}
      <Link
        href={profileHref}
        aria-label={author}
        className="absolute inset-0 z-[25]"
      />

      {/* Follow island — independent interactive control above the
          stretched link. */}
      {writer.userId ? (
        <div className="absolute right-2 top-2 z-30">
          <FollowButton targetUserId={writer.userId} size="sm" />
        </div>
      ) : null}

      {/* Optional cover image — sits behind the silk hex so the
          writer's photo reads through the silk silhouette. */}
      {writer.avatar ? (
        <Image
          src={writer.avatar}
          alt=""
          fill
          className="absolute inset-0 select-none object-cover opacity-70 mix-blend-luminosity"
          sizes="276px"
          draggable={false}
        />
      ) : null}

      {/* Silk hex card — Image-2.png provides both the silhouette and
          the silk fill (transparent outside the hex). Same brand asset
          used by the writing-room "Discover Featured Writing" gallery. */}
      <Image
        src={WRITER_CARD}
        alt=""
        fill
        className="select-none object-contain"
        sizes="276px"
        draggable={false}
      />

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

      {/* Bottom text overlay — Figma "Text" frame (276×164, padding
          24/24/56, gap 8, justify-end). Background is the shared
          --tott-writer-card-fade gradient + 4px backdrop blur so the
          title and meta read cleanly over the silk hex. */}
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
function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d={direction === "left"
          ? "M15 6l-6 6 6 6"
          : "M9 6l6 6-6 6"}
        stroke={TEXT_STRONG}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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


