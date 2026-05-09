"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import { FirstWordGold } from "./FirstWordGold";

const FRAME_86 = "/images/home/Frame 86.svg";

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
 *
 * Each card has its own author/contributor slide indices. Those live
 * in the parent (one entry per real card index), so the duplicated
 * clone cards stay in sync with the real card and clicks don't
 * scribble onto a clone-only state.
 */
export function MagazineSupport({ collaborations }: MagazineSupportProps) {
  const t = useTranslations("Home.magazine.support");
  const totalCards = collaborations.length;
  // Logical index of the active card — always in [0, totalCards).
  const [active, setActive] = useState(0);
  // Visual position used by the translate. Can briefly hold -1 or
  // totalCards during a wrap before we snap it back into range.
  const [position, setPosition] = useState(0);
  // When false, transition is suppressed for a single render so the
  // snap-back doesn't animate.
  const [animate, setAnimate] = useState(true);
  // Slide indices for each real card. Lifted here so the duplicated
  // clone strips render the same slide as the real card.
  const [authorSlides, setAuthorSlides] = useState<number[]>(() =>
    Array.from({ length: totalCards }, () => 0),
  );
  const [contribSlides, setContribSlides] = useState<number[]>(() =>
    Array.from({ length: totalCards }, () => 0),
  );

  // Resync slide arrays if the collaboration list size changes.
  useEffect(() => {
    setAuthorSlides((s) =>
      s.length === totalCards
        ? s
        : Array.from({ length: totalCards }, (_, i) => s[i] ?? 0),
    );
    setContribSlides((s) =>
      s.length === totalCards
        ? s
        : Array.from({ length: totalCards }, (_, i) => s[i] ?? 0),
    );
    setActive((a) => (a >= totalCards ? 0 : a));
    setPosition((p) => (p >= totalCards || p < 0 ? 0 : p));
  }, [totalCards]);

  const wrapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (wrapTimer.current) clearTimeout(wrapTimer.current);
    };
  }, []);

  const advanceAuthor = (cardIdx: number) =>
    setAuthorSlides((s) => {
      const copy = s.slice();
      copy[cardIdx] = copy[cardIdx] + 1;
      return copy;
    });
  const advanceContrib = (cardIdx: number) =>
    setContribSlides((s) => {
      const copy = s.slice();
      copy[cardIdx] = copy[cardIdx] + 1;
      return copy;
    });

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
          <FirstWordGold raw={t("heading")} />
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
          {t("subheading")}
        </p>
      </div>

      <div
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
            {collaborations.map((c, i) => (
              <CollabCard
                key={`pre-${c.id}`}
                collab={c}
                isActive={false}
                isClone
                authorIndex={authorSlides[i] ?? 0}
                contribIndex={contribSlides[i] ?? 0}
              />
            ))}
            {/* Real set */}
            {collaborations.map((c, i) => (
              <CollabCard
                key={`real-${c.id}`}
                collab={c}
                isActive={i === active}
                authorIndex={authorSlides[i] ?? 0}
                contribIndex={contribSlides[i] ?? 0}
                onAdvanceAuthor={() => advanceAuthor(i)}
                onAdvanceContrib={() => advanceContrib(i)}
              />
            ))}
            {/* Clones after the real set */}
            {collaborations.map((c, i) => (
              <CollabCard
                key={`post-${c.id}`}
                collab={c}
                isActive={false}
                isClone
                authorIndex={authorSlides[i] ?? 0}
                contribIndex={contribSlides[i] ?? 0}
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

/** Single collaboration card — 360×382 with twin-hex header. */
function CollabCard({
  collab,
  isActive = true,
  isClone = false,
  authorIndex,
  contribIndex,
  onAdvanceAuthor,
  onAdvanceContrib,
}: {
  collab: CollaborationItem;
  isActive?: boolean;
  /** Clones are decorative duplicates that flank the real strip; they
   *  echo the active card's slide indices but don't accept input. */
  isClone?: boolean;
  authorIndex: number;
  contribIndex: number;
  onAdvanceAuthor?: () => void;
  onAdvanceContrib?: () => void;
}) {
  const t = useTranslations("Home.magazine.support");

  // Non-active siblings (and all clones) are hidden from AT so the
  // card text isn't announced multiple times in a row.
  const ariaHidden = isClone || !isActive;

  return (
    <article
      className="relative shrink-0"
      aria-hidden={ariaHidden || undefined}
      style={{
        width: "min(85vw, 360px)",
        minHeight: "382px",
        padding: "16px 24px 24px",
        backgroundColor: "var(--tott-panel-bg)",
        borderRadius: "24px",
        // Hairline border + soft drop shadow so the card edge stays
        // visible in light mode, where panel-bg and page surface are
        // nearly the same cream and the card boundary (and the
        // twin-hex / card crossing) would otherwise disappear.
        border: "1px solid var(--tott-card-border)",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        opacity: isActive ? 1 : 0.45,
        transition: "opacity 400ms ease",
      }}
    >
      {/* Frame 86 — pre-rendered twin-hex header. Pulled up so the
          hex straddles the card's top edge — top half outside, bottom
          half (with the "Author" / "Contributor" labels) inside the
          card. Frame 86.svg has transparent corners, so the portion
          above the card paints against the page background and the
          portion below against the card's panel-bg.

          -78px is half of the design-spec hex height (156px). The
          actual rendered height varies a few px on mobile because
          the parent has `maxWidth: 270`, but the visual offset is
          close enough across breakpoints to hold the design. */}
      <div
        className="relative w-full shrink-0"
        style={{
          maxWidth: "270px",
          aspectRatio: "270 / 156",
          marginTop: "-78px",
        }}
      >
        <Image
          src={FRAME_86}
          alt=""
          fill
          sizes="270px"
          className="select-none"
          draggable={false}
          data-author-slide={authorIndex}
          data-contributor-slide={contribIndex}
        />

        {/* Click targets — percentage-based so they stay aligned with
            the labels baked into Frame 86.svg as the image scales.
            Disabled (no onClick) on clones / inactive siblings so
            users can only steer the active card. */}
        <button
          type="button"
          aria-label={t("roleAuthor")}
          onClick={onAdvanceAuthor}
          disabled={!onAdvanceAuthor}
          tabIndex={ariaHidden ? -1 : 0}
          className="absolute cursor-pointer rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--tott-accent-gold)] disabled:cursor-default"
          style={{
            left: "11.85%",
            top: "80.77%",
            width: "23.7%",
            height: "16.67%",
            background: "transparent",
            border: 0,
          }}
        />
        <button
          type="button"
          aria-label={t("roleContributor")}
          onClick={onAdvanceContrib}
          disabled={!onAdvanceContrib}
          tabIndex={ariaHidden ? -1 : 0}
          className="absolute cursor-pointer rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--tott-accent-gold)] disabled:cursor-default"
          style={{
            left: "60%",
            top: "80.77%",
            width: "31.11%",
            height: "16.67%",
            background: "transparent",
            border: 0,
          }}
        />
      </div>

      {/* Text block — title + meta + description. */}
      <div
        className="flex w-full flex-col items-center"
        style={{ maxWidth: "312px", gap: "8px" }}
      >
        <h3
          style={{
            fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "20px",
            lineHeight: "28px",
            color: "var(--tott-home-text-strong)",
            textAlign: "center",
            textShadow: "var(--tott-home-text-shadow)",
          }}
        >
          {collab.title}
        </h3>

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
              <span className="flex items-center" style={{ gap: "2px" }}>
                <span
                  style={{
                    fontFamily: "'Inter', var(--font-sans, sans-serif)",
                    fontWeight: 400,
                    fontSize: "12px",
                    lineHeight: "16px",
                    color: "var(--tott-home-text-muted)",
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
                    color: "var(--tott-home-text-muted)",
                  }}
                >
                  {collab.timeline}
                </span>
              </span>
            </span>
          ) : null}
        </div>

        <p
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

        {/* Status pill — "Completed" / "Pending" / etc. The label
            comes from the contribution's `status` field; we
            title-case it so backend values like "completed" /
            "pending" read naturally. Hidden when no status. */}
        {collab.status?.trim() ? (
          <span
            className="mt-2 inline-flex items-center justify-center"
            style={{
              padding: "6px 16px",
              borderRadius: "999px",
              backgroundColor: "var(--tott-home-badge-bg)",
              color: "var(--tott-home-text-strong)",
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "12px",
              lineHeight: "16px",
              letterSpacing: "-0.005em",
            }}
          >
            {prettifyStatus(collab.status)}
          </span>
        ) : null}
      </div>
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
