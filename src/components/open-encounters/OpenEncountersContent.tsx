"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import { HexPatternBackdrop } from "@/components/home/magazine/HexPatternBackdrop";

// Reuse the writing-room moon glyph (Open Encounters icon in the
// experiences row) so this page stays in the family. Event-row
// thumbnails reuse the home silk image cropped square — when a
// curated set of encounter portraits lands, swap this single ref.
const HERO_ICON = "/images/writing-room/moon-icon.svg";
const EVENT_THUMB = "/images/home/Image-2.png";
const GALLERY_IMAGES: string[] = [
  "/images/workshops/gallery-thumbnail.svg",
  "/images/home/hero-silk.png",
  "/images/trip.png",
];
const GALLERY_PEEK = "/images/workshops/gallery-peek.svg";

type Event = {
  date: string;
  title: string;
  body: string;
  type: string;
};

export function OpenEncountersContent() {
  const t = useTranslations("Home.openEncounters");
  const events = t.raw("events") as Event[];

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

  // Collapse/expand the Upcoming event list via the chevron-down
  // button on the section header. Default open so the page lands
  // with content visible.
  const [upcomingOpen, setUpcomingOpen] = useState(true);

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
        style={{ maxWidth: "min(90vw, 4500px)" }}
      >
        {/* ── Hero ───────────────────────────────────────────── */}
        <header
          className="mx-auto flex flex-col items-center text-center"
          style={{
            width: "100%",
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
                // Figma `#D6D6D6` — theme-aware via color-mix so
                // dark mode lands on the warm light gray and
                // light mode inverts to a dark gray.
                color:
                  "color-mix(in srgb, var(--tott-home-text-strong) 84%, var(--tott-home-surface))",
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
                // Figma `#D6D6D6` — theme-aware via color-mix so
                // dark mode lands on the warm light gray and
                // light mode inverts to a dark gray.
                color:
                  "color-mix(in srgb, var(--tott-home-text-strong) 84%, var(--tott-home-surface))",
                textShadow: "var(--tott-home-text-shadow)",
                margin: 0,
              }}
            >
              {t("heroBody")}
            </p>
          </div>
        </header>

        {/* ── Upcoming events ──────────────────────────────────
            ChamferedFrame wrapper with a header row (heading +
            date-range chip + chevron) and a vertical list of
            event rows. Each row: thumbnail | (date / title /
            body) | (type chip + Join link). */}
        <section
          aria-labelledby="upcoming-heading"
          className="relative"
          style={{
            marginTop: "clamp(48px, 4vw + 0.5rem, 200px)",
            padding:
              "clamp(20px, 1vw + 0.5rem, 56px) clamp(16px, 1.6vw + 0.5rem, 72px)",
          }}
        >
          <ChamferedFrame size={24} borderColor="var(--tott-card-border)" />

          {/* Header — title row stacked above the meta-data row
              (plain calendar+date pairs joined by an arrow), with
              a chevron tucked at the right edge. Matches Figma
              "Header" frame layout. */}
          <header
            className="flex flex-row items-center"
            style={{ gap: "clamp(12px, 0.8vw + 0.3rem, 24px)" }}
          >
            <div
              className="flex flex-1 flex-col"
              style={{ gap: "clamp(6px, 0.3vw + 0.2rem, 16px)" }}
            >
              <h2
                id="upcoming-heading"
                style={{
                  fontFamily: "'Inter', var(--font-sans, sans-serif)",
                  fontWeight: 500,
                  fontSize: "clamp(0.9375rem, 0.4vw + 0.5rem, 1.5rem)",
                  lineHeight: 1.5,
                  letterSpacing: "-0.01em",
                  color: "var(--tott-home-text-strong)",
                  margin: 0,
                }}
              >
                {t("upcomingHeading")}
              </h2>

              <div
                className="flex flex-row items-center flex-wrap"
                style={{ gap: "clamp(6px, 0.3vw + 0.2rem, 16px)" }}
              >
                <DateMeta label={t("dateRangeFrom")} />
                <span
                  aria-hidden
                  style={{
                    fontFamily: "'Inter', var(--font-sans, sans-serif)",
                    fontWeight: 400,
                    fontSize: "clamp(0.75rem, 0.25vw + 0.45rem, 1.125rem)",
                    lineHeight: 1.33,
                    color: "var(--tott-home-text-muted)",
                  }}
                >
                  →
                </span>
                <DateMeta label={t("dateRangeTo")} />
              </div>
            </div>

            <button
              type="button"
              aria-expanded={upcomingOpen}
              aria-controls="upcoming-list"
              aria-label={t("upcomingHeading")}
              onClick={() => setUpcomingOpen((v) => !v)}
              className="inline-flex shrink-0 items-center justify-center transition-opacity hover:opacity-80"
              style={{
                width: "clamp(28px, 0.4vw + 1rem, 40px)",
                height: "clamp(28px, 0.4vw + 1rem, 40px)",
                padding: 0,
                background: "transparent",
                border: "none",
                color: "var(--tott-home-text-muted)",
                cursor: "pointer",
              }}
            >
              <svg
                aria-hidden
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  // Rotate 180° when collapsed so the chevron
                  // points up — same accordion-style affordance
                  // as the Figma comp.
                  transform: upcomingOpen ? "rotate(0deg)" : "rotate(180deg)",
                  transition: "transform 200ms ease",
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </header>

          {/* Collapsible content — divider, event list, and the
              Back to Writing Room button are hidden when the
              chevron is clicked to collapse. `hidden` is enough
              here; we don't animate height because the page can
              jump and the chevron rotation is the affordance. */}
          {upcomingOpen ? (
            <>
          {/* Divider — 1px line of --tott-card-border separating
              the header from the event list. */}
          <div
            aria-hidden
            style={{
              marginTop: "clamp(16px, 0.8vw + 0.3rem, 32px)",
              height: "1px",
              width: "100%",
              backgroundColor: "var(--tott-card-border)",
            }}
          />

          {/* Vertical line connects the leading calendar icons
              through the whole list — absolute-positioned behind
              the rows (z-0) while the EventRows live above (z-10). */}
          <ul
            id="upcoming-list"
            className="relative flex flex-col"
            style={{
              marginTop: "clamp(20px, 1.2vw + 0.4rem, 48px)",
              gap: "clamp(16px, 1vw + 0.4rem, 40px)",
              padding: 0,
              listStyle: "none",
              isolation: "isolate",
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                // Center the 1px line through the calendar-icon
                // column — `left` exactly tracks half the icon's
                // fluid width so the line always passes through
                // the icon center at every viewport. Top/bottom
                // inset = roughly half of row height so the line
                // begins at the first icon's center and ends at
                // the last icon's center.
                left:
                  "calc(clamp(28px, 0.3vw + 1.75rem, 64px) / 2 - 0.5px)",
                top: "clamp(43px, 2.65vw + 1.875rem, 105px)",
                bottom: "clamp(43px, 2.65vw + 1.875rem, 105px)",
                width: "1px",
                backgroundColor: "var(--tott-card-border)",
                zIndex: 0,
              }}
            />
            {events.map((e, i) => (
              <li key={i} className="relative" style={{ zIndex: 1 }}>
                <EventRow event={e} joinLabel={t("join")} />
              </li>
            ))}
          </ul>

          <div
            className="flex justify-center"
            style={{
              marginTop: "clamp(32px, 2vw + 0.5rem, 96px)",
            }}
          >
            <Link
              href="/writing-room"
              className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
              style={{
                height: "clamp(40px, 2vw + 1rem, 96px)",
                padding:
                  "clamp(8px, 0.6vw, 24px) clamp(20px, 1.4vw + 0.5rem, 56px)",
                gap: "clamp(8px, 0.4vw, 18px)",
                borderRadius: "8px",
                backgroundColor: "var(--tott-card-border)",
                boxShadow: "inset 0px 1px 1px rgba(255, 255, 255, 0.08)",
                color: "var(--tott-home-text-strong)",
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "clamp(0.875rem, 0.5vw + 0.5rem, 1.5rem)",
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
                  width="100%"
                  height="100%"
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
            </>
          ) : null}
        </section>

        {/* ── Gallery ───────────────────────────────────────── */}
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
                  maxWidth: "min(82vw, 4000px)",
                  aspectRatio: "1128 / 483",
                  borderRadius: "16px",
                  border:
                    "1px solid color-mix(in srgb, var(--tott-home-text-strong) 8%, transparent)",
                }}
              >
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
          className="relative mt-16 overflow-hidden"
          style={{
            marginTop: "clamp(64px, 5vw + 0.5rem, 240px)",
            padding: "clamp(32px, 2vw + 0.5rem, 120px) clamp(16px, 1.2vw, 64px)",
            // The hex pattern is ~294px tall at standard widths;
            // pin a fluid min-height so overflow-hidden doesn't
            // clip the top/bottom rows of hexes.
            minHeight: "clamp(280px, 18vw + 4rem, 480px)",
          }}
        >
          <HexPatternBackdrop />

          <div
            className="relative z-10 flex flex-col items-center text-center"
            style={{ gap: "clamp(18px, 1.4vw + 0.4rem, 64px)" }}
          >
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
                margin: 0,
              }}
            >
              {t("joinBody")}
            </p>
            <div
              className="mt-2 flex flex-wrap items-center justify-center"
              style={{ gap: "clamp(12px, 0.4vw + 0.3rem, 20px)" }}
            >
              <Link
                href="/writing-room/residency"
                className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
                style={{
                  height: "clamp(40px, 2vw + 1rem, 96px)",
                  padding:
                    "clamp(8px, 0.3vw + 0.3rem, 16px) clamp(20px, 1.4vw + 0.5rem, 56px)",
                  borderRadius: "8px",
                  backgroundColor: "var(--tott-magazine-btn-bg)",
                  boxShadow:
                    "inset 0px 1px 0px color-mix(in srgb, var(--tott-home-text-strong) 40%, transparent)",
                  color: "var(--tott-auth-btn-text)",
                  fontFamily: "'Inter', var(--font-sans, sans-serif)",
                  fontWeight: 500,
                  fontSize: "clamp(0.875rem, 0.5vw + 0.5rem, 2rem)",
                  lineHeight: 1.4,
                  letterSpacing: "-0.005em",
                }}
              >
                {t("applyResidency")}
              </Link>
              <Link
                href="/writing-room/workshops"
                className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
                style={{
                  height: "clamp(40px, 2vw + 1rem, 96px)",
                  padding:
                    "clamp(8px, 0.3vw + 0.3rem, 16px) clamp(20px, 1.4vw + 0.5rem, 56px)",
                  borderRadius: "8px",
                  backgroundColor: "var(--tott-card-border)",
                  boxShadow:
                    "inset 0px 1px 1px color-mix(in srgb, var(--tott-home-text-strong) 8%, transparent)",
                  color: "var(--tott-home-text-strong)",
                  fontFamily: "'Inter', var(--font-sans, sans-serif)",
                  fontWeight: 500,
                  fontSize: "clamp(0.875rem, 0.5vw + 0.5rem, 2rem)",
                  lineHeight: 1.4,
                  letterSpacing: "-0.005em",
                }}
              >
                {t("joinWorkshop")}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

// ─── Helpers ──────────────────────────────────────────────────

/** Calendar icon + date label pair — Figma "Date" frame inside
 * the header meta-row. Plain inline text in muted gray. */
function DateMeta({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center"
      style={{
        gap: "clamp(4px, 0.2vw + 0.1rem, 10px)",
        color: "var(--tott-home-text-muted)",
        fontFamily: "'Inter', var(--font-sans, sans-serif)",
        fontWeight: 400,
        fontSize: "clamp(0.75rem, 0.25vw + 0.45rem, 1.125rem)",
        lineHeight: 1.33,
      }}
    >
      <svg
        aria-hidden
        width="1em"
        height="1em"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      {label}
    </span>
  );
}

// ─── Event row ────────────────────────────────────────────────

function EventRow({
  event,
  joinLabel,
}: {
  event: Event;
  joinLabel: string;
}) {
  return (
    <article
      className="relative flex flex-row items-center"
      style={{
        gap: "clamp(12px, 0.8vw + 0.3rem, 32px)",
      }}
    >
      {/* Leading calendar icon — 32×32 dark elevated square with
          a 1px border, sits over the vertical line in the list. */}
      <span
        aria-hidden
        className="relative shrink-0 inline-flex items-center justify-center"
        style={{
          width: "clamp(28px, 0.3vw + 1.75rem, 64px)",
          height: "clamp(28px, 0.3vw + 1.75rem, 64px)",
          borderRadius: "8px",
          backgroundColor: "var(--tott-elevated)",
          border: "1px solid var(--tott-card-border)",
          color: "var(--tott-home-text-muted)",
        }}
      >
        <svg
          width="50%"
          height="50%"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </span>

      {/* Event thumbnail — Figma 120×128 with 16px radius. */}
      <div
        className="relative shrink-0 overflow-hidden"
        style={{
          width: "clamp(80px, 5vw + 3.5rem, 200px)",
          height: "clamp(86px, 5.3vw + 3.75rem, 210px)",
          borderRadius: "16px",
        }}
      >
        <Image
          src={EVENT_THUMB}
          alt=""
          fill
          sizes="180px"
          className="select-none object-cover"
          draggable={false}
        />
      </div>

      {/* Date + title + body — flex-1 takes the remaining space
          left of the right-side chip + Join column. */}
      <div className="flex min-w-0 flex-1 flex-col" style={{ gap: "4px" }}>
        <span
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "clamp(0.6875rem, 0.2vw + 0.4rem, 1rem)",
            lineHeight: 1.4,
            letterSpacing: "0.04em",
            color: "var(--tott-home-text-muted)",
            textTransform: "uppercase",
          }}
        >
          {event.date}
        </span>
        <h3
          style={{
            fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "clamp(1rem, 0.6vw + 0.5rem, 2rem)",
            lineHeight: 1.4,
            color: "var(--tott-home-text-strong)",
            margin: 0,
          }}
        >
          {event.title}
        </h3>
        <p
          className="line-clamp-2"
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 400,
            fontSize: "clamp(0.8125rem, 0.3vw + 0.45rem, 1.25rem)",
            lineHeight: 1.45,
            letterSpacing: "-0.005em",
            color: "var(--tott-home-text-muted)",
            margin: 0,
          }}
        >
          {event.body}
        </p>
      </div>

      {/* Right side — chip + Join link inline on one row per
          Figma (chip on the left within this column, Join on the
          right). */}
      <div
        className="flex shrink-0 flex-row items-center"
        style={{ gap: "clamp(8px, 0.5vw + 0.3rem, 24px)" }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: "clamp(24px, 0.5vw + 0.9rem, 40px)",
            padding:
              "clamp(4px, 0.2vw, 12px) clamp(8px, 0.35vw + 0.3rem, 20px)",
            borderRadius: "6px",
            backgroundColor: "var(--tott-card-border)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            color: "var(--tott-home-text-strong)",
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "clamp(12px, 0.55vw + 0.3rem, 1.25rem)",
            lineHeight: 1.4,
          }}
        >
          {event.type}
        </span>
        <button
          type="button"
          className="inline-flex items-center self-end transition-opacity hover:opacity-80"
          style={{
            gap: "clamp(6px, 0.3vw, 12px)",
            color: "var(--tott-magazine-btn-bg)",
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 400,
            fontSize: "clamp(0.875rem, 0.4vw + 0.45rem, 1.5rem)",
            lineHeight: 1.4,
            letterSpacing: "-0.005em",
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
          }}
        >
          {joinLabel}
          <span
            aria-hidden
            className="inline-flex items-center justify-center"
            style={{
              width: "clamp(16px, 0.6vw + 0.3rem, 32px)",
              height: "clamp(16px, 0.6vw + 0.3rem, 32px)",
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
      </div>
    </article>
  );
}
