"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import { FirstWordGold } from "./FirstWordGold";

// Pre-rendered twin-hex header (Author + Contributor hexes connected
// by the heart-handshake glyph). The labels baked into the SVG are
// the only ones we render — no duplicate text on top.
const FRAME_86 = "/images/home/Frame 86.svg";

// Outer card silhouette — chamfered-hex path lifted from the Figma
// comp (Card-2.svg). Used as both the fill (matching the page
// surface so the card is "invisible") and the stroke (linear
// gradient #333333 → transparent, top-to-bottom — edges visible
// at the top, fading away at the bottom).
const CARD_PATH =
  "M170.032 5.07434C176.643 1.86976 184.357 1.86976 190.968 5.07434L346.968 80.6918C355.244 84.7033 360.5 93.0914 360.5 102.288V283.712C360.5 292.909 355.244 301.297 346.968 305.308L190.968 380.926C184.357 384.13 176.643 384.13 170.032 380.926L14.0316 305.308C5.75566 301.297 0.5 292.909 0.5 283.712V102.288C0.5 93.0915 5.75566 84.7033 14.0316 80.6918L170.032 5.07434Z";

// Octagonal chamfer for the status pill — matches the category
// chip shape on the Latest Published row so the magazine page
// reads as one consistent system.
const CHIP_CHAMFER =
  "polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)";

const BORDER = "var(--tott-card-border)";

// Card width matches the inline `min(85vw, 360px)` rule, plus the 24px
// gap. The translate math uses the same expression so the active card
// stays centred at every viewport width.
const CARD_W_CSS = "min(85vw, 360px)";
const CARD_GAP_PX = 24;
const TRANSITION_MS = 500;

export type CollaborationItem = {
  id: string;
  title: string;
  /** Co-writing / illustration / etc. — short type label. */
  type: string;
  /** Status pill text (e.g. "Completed"). When empty, the pill hides. */
  status?: string | null;
  /** Free-form timeline string (e.g. "Mar 2025"). */
  timeline?: string | null;
  /** Long-form description. */
  description: string;
  /** Optional avatar urls for the twin-hex header. */
  authorAvatar?: string | null;
  contributorAvatar?: string | null;
};

export type MagazineSupportProps = {
  /** Pass an empty array to hide the section. */
  collaborations: CollaborationItem[];
  /** Section heading override. Empty/whitespace falls back to i18n. */
  headingOverride?: string;
  /** Section subheading override. Empty/whitespace falls back to i18n. */
  subheadingOverride?: string;
};

/**
 * Support pane — "Recent Collaporations" gallery (typo intentional,
 * mirrors Figma).
 *
 * The gallery cycles through totalCards in both directions. To make
 * the wraparound seamless without rewinding through every card, we
 * render a leading + trailing clone strip and animate to a clone
 * position when wrapping, then snap (no transition) back to the real
 * position once the animation finishes.
 */
export function MagazineSupport({
  collaborations,
  headingOverride,
  subheadingOverride,
}: MagazineSupportProps) {
  const t = useTranslations("Home.magazine.support");
  const headingText = headingOverride?.trim() || t("heading");
  const subheadingText = subheadingOverride?.trim() || t("subheading");
  const totalCards = collaborations.length;
  // Logical index of the active card — always in [0, totalCards).
  const [active, setActive] = useState(0);
  // Visual position used by the translate. Can briefly hold -1 or
  // totalCards during a wrap before we snap it back into range.
  const [position, setPosition] = useState(0);
  // When false, transition is suppressed for a single render so the
  // snap-back doesn't animate.
  const [animate, setAnimate] = useState(true);

  // Reset active/position if the list size changes. React 19 prefers
  // adjusting state during render (with a previous-value tracker) over
  // doing it in an effect — the effect path triggers a cascading render
  // and lints under react-hooks/set-state-in-effect.
  const [prevTotal, setPrevTotal] = useState(totalCards);
  if (prevTotal !== totalCards) {
    setPrevTotal(totalCards);
    setActive((a) => (a >= totalCards ? 0 : a));
    setPosition((p) => (p >= totalCards || p < 0 ? 0 : p));
  }

  const wrapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (wrapTimer.current) clearTimeout(wrapTimer.current);
    };
  }, []);

  const goNext = () => {
    if (wrapTimer.current) return;
    if (active === totalCards - 1) {
      // Animate forward to the leading clone of card 0, then snap.
      setPosition(totalCards);
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
      }, TRANSITION_MS);
    } else {
      const next = active + 1;
      setActive(next);
      setPosition(next);
    }
  };

  const goPrev = () => {
    if (wrapTimer.current) return;
    if (active === 0) {
      // Animate backward to the trailing clone of card last, then snap.
      setPosition(-1);
      setActive(totalCards - 1);
      wrapTimer.current = setTimeout(() => {
        setAnimate(false);
        setPosition(totalCards - 1);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setAnimate(true);
            wrapTimer.current = null;
          });
        });
      }, TRANSITION_MS);
    } else {
      const prev = active - 1;
      setActive(prev);
      setPosition(prev);
    }
  };

  if (totalCards === 0) return null;

  return (
    <section
      className="relative mx-auto w-full max-w-[1392px]"
      aria-labelledby="recent-collabs-heading"
    >
      <ChamferedFrame size={24} borderColor={BORDER} />

      {/* Heading group */}
      <div className="flex flex-col items-center justify-center gap-2 px-4 pt-8 pb-3">
        <h2
          id="recent-collabs-heading"
          style={{
            fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "32px",
            lineHeight: "40px",
            color: "var(--tott-home-text-strong)",
            textAlign: "center",
          }}
        >
          <FirstWordGold raw={headingText} />
        </h2>
        <p
          className="max-w-md"
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "20px",
            letterSpacing: "-0.005em",
            color: "var(--tott-home-text-muted)",
            textShadow: "var(--tott-home-text-shadow)",
            textAlign: "center",
          }}
        >
          {subheadingText}
        </p>
      </div>

      {/* Carousel mechanics are pinned to LTR: the track is positioned
          with a translateX(calc(50% - …)) that assumes left-to-right
          flow. Under RTL the flex main axis flips while the transform
          does not, so the active card lands off-centre / off-screen.
          dir="ltr" keeps the math (and the ←/→ arrow pairing) intact;
          the card content is centre-aligned so Arabic still renders
          correctly. This is a no-op on LTR locales. */}
      <div
        dir="ltr"
        className="flex flex-col items-center"
        style={{
          padding: "16px 0 32px",
          gap: "24px",
        }}
      >
        <div
          className="relative w-full overflow-hidden"
          role="region"
          aria-label={t("heading")}
          aria-roledescription="carousel"
        >
          <div
            className="flex justify-start"
            style={{
              gap: `${CARD_GAP_PX}px`,
              // Centre the card at `position` in the middle (real)
              // strip. The pre-clones at indices [0, totalCards) let
              // position go to -1 (last trailing clone), and the
              // post-clones let it go to totalCards (first leading
              // clone) without exposing an empty edge.
              transform: `translateX(calc(50% - ${
                totalCards + position
              } * (${CARD_W_CSS} + ${CARD_GAP_PX}px) - ${CARD_W_CSS} / 2))`,
              transition: animate
                ? `transform ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`
                : "none",
            }}
          >
            {/* Clones before the real set */}
            {collaborations.map((c) => (
              <CollabCard
                key={`pre-${c.id}`}
                collab={c}
                isActive={false}
                isClone
              />
            ))}
            {/* Real set */}
            {collaborations.map((c, i) => (
              <CollabCard
                key={`real-${c.id}`}
                collab={c}
                isActive={i === active}
              />
            ))}
            {/* Clones after the real set */}
            {collaborations.map((c) => (
              <CollabCard
                key={`post-${c.id}`}
                collab={c}
                isActive={false}
                isClone
              />
            ))}
          </div>
        </div>

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

/** Single collaboration card.
 *
 * Mirrors the Figma autolayout: outer flex column with padding
 * 16×24 and gap 16, holding (1) Frame 86 twin-hex header, (2) Title
 * + Meta + Description text block, (3) status pill. Behind everything
 * the card silhouette is painted on an absolute layer using a
 * chamfered-hex clip-path filled with the theme-aware `panel-bg`
 * token so the same shape adapts to light/dark.
 *
 * Figma typography mapping:
 *   Title         IBM Plex Sans 500 20/28  white  text-shadow
 *   Type          Inter 400        12/16  --tott-dash-gold-label (=#C9A96E)
 *   Timeline      Inter 400        12/16  --tott-home-text-muted (#A3A3A3-ish)
 *   Description   Inter 400        12/16  --tott-home-text-muted
 *   Status pill   Inter 500        12/16  --tott-dark-pill-fg on --tott-dark-pill bg
 */
function CollabCard({
  collab,
  isActive = true,
  isClone = false,
}: {
  collab: CollaborationItem;
  isActive?: boolean;
  /** Clones are decorative duplicates that flank the real strip. */
  isClone?: boolean;
}) {
  const t = useTranslations("Home.magazine.support");
  // Non-active siblings (and all clones) are hidden from AT so the
  // card text isn't announced multiple times in a row.
  const ariaHidden = isClone || !isActive;

  return (
    <article
      className="relative flex shrink-0 flex-col items-center justify-center"
      aria-hidden={ariaHidden || undefined}
      style={{
        width: "min(85vw, 360px)",
        aspectRatio: "360 / 382",
        padding: "16px 24px",
        gap: "16px",
        opacity: isActive ? 1 : 0.45,
        transition: "opacity 400ms ease",
        // isolate so the card's z-index stack stays self-contained
        // (same as Figma `isolation: isolate`).
        isolation: "isolate",
      }}
    >
      {/* BG layer — inline SVG so we can paint the chamfered-hex
          fill (matched to the page surface) AND the stroke (linear
          gradient #333333 fading to transparent toward the bottom)
          in one path. preserveAspectRatio="none" lets the path
          stretch to whatever dimensions the card ends up at. */}
      <svg
        aria-hidden
        viewBox="0 0 361 384"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        style={{ zIndex: 0, overflow: "visible" }}
      >
        <defs>
          <linearGradient
            id="collab-card-stroke"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor="#333333" stopOpacity="1" />
            <stop offset="80%" stopColor="#333333" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={CARD_PATH}
          fill="var(--tott-home-surface)"
          stroke="url(#collab-card-stroke)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Frame 86 — twin-hex header in flow. z=1 */}
      <div
        className="relative w-full shrink-0"
        style={{ maxWidth: "270px", aspectRatio: "270 / 156", zIndex: 1 }}
      >
        <Image
          src={FRAME_86}
          alt=""
          fill
          sizes="270px"
          className="pointer-events-none select-none"
          draggable={false}
        />
      </div>

      {/* Text block — Title + Meta + Description, in flow. z=2 */}
      <div
        className="relative flex w-full flex-col items-center"
        style={{ maxWidth: "312px", gap: "8px", zIndex: 2 }}
      >
        <h3
          className="line-clamp-1"
          style={{
            width: "100%",
            fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "20px",
            lineHeight: "28px",
            color: "var(--tott-home-text-strong)",
            textAlign: "center",
            textShadow: "var(--tott-home-text-shadow)",
            margin: 0,
          }}
        >
          {collab.title}
        </h3>

        {/* Meta row — Type (gold) · Alarm + Timeline */}
        <div
          className="flex flex-wrap items-center justify-center"
          style={{ gap: "12px" }}
        >
          <span
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "12px",
              lineHeight: "16px",
              color: "var(--tott-dash-gold-label)",
              textAlign: "center",
            }}
          >
            {collab.type}
          </span>
          {collab.timeline ? (
            <span
              className="flex items-center"
              style={{ gap: "6px", color: "var(--tott-home-text-muted)" }}
            >
              <AlarmIcon />
              <span
                style={{
                  fontFamily: "'Inter', var(--font-sans, sans-serif)",
                  fontWeight: 400,
                  fontSize: "12px",
                  lineHeight: "16px",
                  color: "var(--tott-home-text-muted)",
                }}
              >
                {t("collabTimelineLabel")} {collab.timeline}
              </span>
            </span>
          ) : null}
        </div>

        <p
          className="line-clamp-2"
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 400,
            fontSize: "12px",
            lineHeight: "16px",
            color: "var(--tott-home-text-muted)",
            textAlign: "center",
            margin: 0,
          }}
        >
          {collab.description}
        </p>
      </div>

      {/* Status pill — Figma "Label" spec: 80×24, #333333 bg with
          backdrop blur, Inter 500 12/16 white text. Uses the same
          octagonal chamfer (CHIP_CHAMFER) as the Latest Published
          category chip so the page reads as one consistent system.
          min-width 80 lets longer status strings ("Archived" etc.)
          grow naturally without breaking the layout. z=3 */}
      {collab.status?.trim() ? (
        <span
          className="relative inline-flex items-center justify-center"
          style={{
            zIndex: 3,
            minWidth: "80px",
            height: "24px",
            padding: "4px 12px",
            backgroundColor: "#333333",
            color: "#FFFFFF",
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "12px",
            lineHeight: "16px",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            clipPath: CHIP_CHAMFER,
            WebkitClipPath: CHIP_CHAMFER,
          }}
        >
          {prettifyStatus(collab.status)}
        </span>
      ) : null}
    </article>
  );
}

function prettifyStatus(s: string): string {
  const v = s.trim();
  if (!v) return "";
  return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
}

/** Carousel nav — pair of round gold ←/→ buttons that advance the
 * gallery one card at a time. */
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
        aria-label={nextLabel}
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

/** Alarm/clock icon — 16×16 with currentColor stroke. */
function AlarmIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
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
