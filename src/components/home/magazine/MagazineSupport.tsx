"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";

const FRAME_86 = "/images/home/Frame 86.svg";

const BORDER = "#333333";

/**
 * Support pane — "Recent Collaporations" gallery (typo intentional,
 * mirrors Figma).
 *
 * Outer Carousel frame: 1392×620 with corner-decoration borders top
 * and bottom, vertical hairlines on the sides, heading group and
 * horizontally scrollable body in between.
 *
 * Each Card: 360×382 rounded-rect (radius 24) with Frame 86.svg as
 * the twin-image header (Author + Contributor hexes connected by the
 * heart-handshake glyph), a "Completed" pill, and a text block
 * (title / co-writing / timeline / description) underneath.
 */
const TOTAL_CARDS = 7;
// Card width (360) + gap (24) — used for the circular translate math.
const CARD_STEP = 360 + 24;

export function MagazineSupport() {
  const t = useTranslations("Home.magazine.support");
  const [activeIndex, setActiveIndex] = useState(0);

  const goPrev = () =>
    setActiveIndex((i) => (i - 1 + TOTAL_CARDS) % TOTAL_CARDS);
  const goNext = () => setActiveIndex((i) => (i + 1) % TOTAL_CARDS);

  return (
    <section
      className="relative mx-auto w-full max-w-[1392px]"
      aria-labelledby="recent-collabs-heading"
    >
      {/* Outer chamfered frame — replaces the manual top/bottom corner
          decorations + side hairlines with a single component. */}
      <ChamferedFrame size={24} borderColor={BORDER} />

      {/* Heading group */}
      <div
        className="flex flex-col items-center justify-center gap-2 px-4 pt-8 pb-3"
      >
        <h2
          id="recent-collabs-heading"
          style={{
            fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "32px",
            lineHeight: "40px",
            color: "#FFFFFF",
            textAlign: "center",
          }}
        >
          {t("heading")}
        </h2>
        <p
          className="max-w-md"
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "20px",
            letterSpacing: "-0.005em",
            color: "#A3A3A3",
            textShadow: "0px 1px 2px rgba(0, 0, 0, 0.24)",
            textAlign: "center",
          }}
        >
          {t("subheading")}
        </p>
      </div>

      {/* Body — cards row + nav arrows. No horizontal padding so the
          cards row reaches the edge of the chamfered frame. */}
      <div
        className="flex flex-col items-center"
        style={{
          padding: "16px 0 32px",
          gap: "24px",
        }}
      >
        {/* Circular cards gallery — render the cards 3 times in a
            row (clone-before / real / clone-after) so there is always
            content on both sides of the active card. translateX
            centres the active card from the MIDDLE (real) set, which
            means clicking through never reveals an empty edge. */}
        <div
          className="relative w-full overflow-hidden"
          role="region"
          aria-label={t("heading")}
          aria-roledescription="carousel"
        >
          <div
            className="flex justify-start"
            style={{
              gap: "24px",
              // The active card is at index (TOTAL_CARDS + activeIndex)
              // in the tripled array — shift the row so it sits centre.
              transform: `translateX(calc(50% - ${
                (TOTAL_CARDS + activeIndex) * CARD_STEP + 360 / 2
              }px))`,
              transition: "transform 500ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {/* Clones before the real set */}
            {Array.from({ length: TOTAL_CARDS }).map((_, i) => (
              <CollabCard key={`pre-${i}`} isActive={false} />
            ))}
            {/* Real set */}
            {Array.from({ length: TOTAL_CARDS }).map((_, i) => (
              <CollabCard key={`real-${i}`} isActive={i === activeIndex} />
            ))}
            {/* Clones after the real set */}
            {Array.from({ length: TOTAL_CARDS }).map((_, i) => (
              <CollabCard key={`post-${i}`} isActive={false} />
            ))}
          </div>
        </div>

        {/* Nav arrows — Frame 87 (gold ←/→). */}
        <NavArrows
          prevLabel={t("previousCollab")}
          nextLabel={t("nextCollab")}
          onPrev={goPrev}
          onNext={goNext}
        />
      </div>
    </section>
  );
}

/** Single collaboration card — 360×382 with twin-hex header.
 * Clicking the Author or Contributor label cycles the image on that
 * side (gallery-style). The active card is rendered at full opacity;
 * non-active siblings dim down slightly to draw the eye to the centre. */
function CollabCard({ isActive = true }: { isActive?: boolean }) {
  const t = useTranslations("Home.magazine.support");

  // Each side is a small slideshow — clicking the label advances the
  // image. For now we just track an index; the visible image is
  // baked into Frame 86.svg, but the indices are wired so a real
  // image swap can drop in later.
  const [authorIndex, setAuthorIndex] = useState(0);
  const [contribIndex, setContribIndex] = useState(0);

  return (
    <article
      className="relative shrink-0"
      style={{
        width: "360px",
        height: "382px",
        padding: "16px 24px",
        backgroundColor: "#171717",
        borderRadius: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        opacity: isActive ? 1 : 0.45,
        transition: "opacity 400ms ease",
      }}
    >
      {/* Frame 86 — pre-rendered twin-hex header (Author + Contributor
          hexes connected by the heart-handshake glyph). The labels
          baked into the SVG are the only ones we render — no
          duplicates on top. */}
      <div
        className="relative shrink-0"
        style={{ width: "270px", height: "156px" }}
      >
        <Image
          src={FRAME_86}
          alt=""
          fill
          sizes="270px"
          className="select-none"
          draggable={false}
          // Hint for screen-readers + a debug data attr that lets us
          // tell which slide is active.
          data-author-slide={authorIndex}
          data-contributor-slide={contribIndex}
        />

        {/* Invisible click targets sitting over each label — clicking
            advances that side's slide. Cursor is a pointer so users
            see it's interactive. */}
        <button
          type="button"
          aria-label={t("roleAuthor")}
          onClick={() => setAuthorIndex((i) => i + 1)}
          className="absolute cursor-pointer"
          style={{
            left: "32px",
            top: "126px",
            width: "64px",
            height: "26px",
            background: "transparent",
            border: 0,
          }}
        />
        <button
          type="button"
          aria-label={t("roleContributor")}
          onClick={() => setContribIndex((i) => i + 1)}
          className="absolute cursor-pointer"
          style={{
            left: "162px",
            top: "126px",
            width: "84px",
            height: "26px",
            background: "transparent",
            border: 0,
          }}
        />
      </div>

      {/* Text block — title + meta + description. */}
      <div
        className="flex flex-col items-center"
        style={{ width: "312px", gap: "8px" }}
      >
        {/* Title */}
        <h3
          style={{
            fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "20px",
            lineHeight: "28px",
            color: "#FFFFFF",
            textAlign: "center",
            textShadow: "0px 1px 2px rgba(0, 0, 0, 0.24)",
          }}
        >
          {t("collabTitle")}
        </h3>

        {/* Meta data — Co-writing + Timeline */}
        <div
          className="flex items-center justify-center"
          style={{ gap: "12px" }}
        >
          <span
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "12px",
              lineHeight: "16px",
              color: "#C9A96E",
              textAlign: "center",
            }}
          >
            {t("collabType")}
          </span>
          <span
            className="flex items-center"
            style={{ gap: "6px" }}
          >
            <AlarmIcon />
            <span
              className="flex items-center"
              style={{ gap: "2px" }}
            >
              <span
                style={{
                  fontFamily: "'Inter', var(--font-sans, sans-serif)",
                  fontWeight: 400,
                  fontSize: "12px",
                  lineHeight: "16px",
                  color: "#A3A3A3",
                }}
              >
                {t("collabTimelineLabel")}
              </span>
              <span
                style={{
                  fontFamily: "'Inter', var(--font-sans, sans-serif)",
                  fontWeight: 400,
                  fontSize: "12px",
                  lineHeight: "16px",
                  color: "#A3A3A3",
                }}
              >
                {t("collabTimeline")}
              </span>
            </span>
          </span>
        </div>

        {/* Description */}
        <p
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "16px",
            color: "#A3A3A3",
            textAlign: "center",
            margin: 0,
          }}
        >
          {t("collabBody")}
        </p>
      </div>
    </article>
  );
}

/** Carousel nav — pair of round gold ←/→ buttons that advance the
 * circular gallery one card at a time. */
function NavArrows({
  prevLabel,
  nextLabel,
  onPrev,
  onNext,
}: {
  prevLabel: string;
  nextLabel: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center" style={{ gap: "80px" }}>
      <button
        type="button"
        aria-label={prevLabel}
        onClick={onPrev}
        className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-80"
        style={{
          border: "2px solid #BD9352",
          color: "#BD9352",
        }}
      >
        <span aria-hidden className="text-xl">
          ←
        </span>
      </button>
      <button
        type="button"
        aria-label={nextLabel}
        onClick={onNext}
        className="flex h-10 w-10 items-center justify-center rounded-full transition-opacity hover:opacity-80"
        style={{
          border: "2px solid #BD9352",
          color: "#BD9352",
        }}
      >
        <span aria-hidden className="text-xl">
          →
        </span>
      </button>
    </div>
  );
}

/** Alarm/clock icon — 16×16 with #A3A3A3 stroke. */
function AlarmIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="#A3A3A3"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="9" r="5" />
      <path d="M8 6.5v2.5l1.5 1" />
      <path d="M5 2l-2 1.5" />
      <path d="M11 2l2 1.5" />
    </svg>
  );
}
