"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import { HexPatternBackdrop } from "@/components/home/magazine/HexPatternBackdrop";

const HERO_ICON = "/images/writing-room/workshops-icon.svg";
const JOIN_ROOM_ICON = "/images/writing-room/join-room-icon.svg";
// The hero silk on /home is the closest match to the soft, draped
// fabric photograph shown in the Workshops mock. Using it directly
// keeps the visual language consistent and avoids shipping another
// near-identical asset.
const GALLERY_IMAGE = "/images/home/hero-silk.png";

export function WorkshopsContent() {
  const t = useTranslations("Home.workshops");

  // The mock shows a single hero image with prev/next arrows on
  // either side. We don't yet have a curated gallery, so the
  // arrows iterate against a one-image array (no-op clicks) — when
  // real assets land the array becomes the carousel source and the
  // rest of the markup needs no changes.
  const gallery: string[] = [GALLERY_IMAGE];
  const [galleryIndex, setGalleryIndex] = useState(0);
  const goPrev = () => {
    if (gallery.length <= 1) return;
    setGalleryIndex((i) => (i === 0 ? gallery.length - 1 : i - 1));
  };
  const goNext = () => {
    if (gallery.length <= 1) return;
    setGalleryIndex((i) => (i + 1) % gallery.length);
  };

  // Until real workshop data lands the mock shows the same card
  // copy four times — render four placeholder slots with the same
  // localized strings so the layout matches the Figma exactly.
  const cards = [0, 1, 2, 3];

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
              className="min-[1600px]:text-[44px]! min-[1920px]:text-[56px]!"
              style={{
                fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "clamp(1.5rem, 4vw, 2rem)",
                lineHeight: 1.25,
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

        {/* ── Current & Upcoming ─────────────────────────────── */}
        <section
          aria-labelledby="current-heading"
          className="relative mt-12"
          style={{
            padding:
              "clamp(20px, 4vw, 40px) clamp(12px, 3vw, 24px) clamp(24px, 4vw, 40px)",
          }}
        >
          <ChamferedFrame size={24} borderColor="var(--tott-card-border)" />
          <h2
            id="current-heading"
            className="text-center min-[1600px]:text-[44px]!"
            style={{
              fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "clamp(1.25rem, 3vw, 2rem)",
              lineHeight: 1.25,
              color: "var(--tott-home-text-strong)",
              margin: 0,
            }}
          >
            {t("currentHeading")}
          </h2>
          <ul
            className="mt-8 grid grid-cols-1 md:grid-cols-2"
            style={{
              gap: "clamp(16px, 2.5vw, 24px)",
              padding: "clamp(0px, 1vw, 8px) clamp(0px, 2vw, 16px) 0",
            }}
          >
            {cards.map((i) => (
              <li key={i} className="flex">
                <WorkshopCard
                  title={t("cardTitle")}
                  body={t("cardBody")}
                  chips={[t("chipDuration"), t("chipFormat")]}
                  ctaLabel={t("explore")}
                />
              </li>
            ))}
          </ul>

          <div className="mt-10 flex justify-center">
            <Link
              href="/writing-room"
              className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
              style={{
                height: "40px",
                padding: "8px 20px",
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
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="11 6 5 12 11 18" />
                </svg>
              </span>
              {t("backToWritingRoom")}
            </Link>
          </div>
        </section>

        {/* ── Gallery / hero image carousel ──────────────────── */}
        <section
          aria-label={t("galleryAlt")}
          className="relative mt-12"
        >
          <div
            className="relative mx-auto w-full overflow-hidden"
            style={{
              maxWidth: "1100px",
              aspectRatio: "1100 / 480",
              borderRadius: "12px",
              backgroundColor: "var(--tott-panel-bg)",
              border: "1px solid var(--tott-card-border)",
            }}
          >
            <Image
              key={galleryIndex}
              src={gallery[galleryIndex]}
              alt={t("galleryAlt")}
              fill
              sizes="(min-width: 1100px) 1100px, 100vw"
              className="select-none object-cover"
              draggable={false}
            />
          </div>

          {gallery.length > 1 ? (
            <>
              <button
                type="button"
                onClick={goPrev}
                aria-label={t("prev")}
                className="absolute z-10 flex items-center justify-center transition-opacity hover:opacity-80"
                style={{
                  width: "40px",
                  height: "40px",
                  left: "clamp(8px, 2vw, 24px)",
                  top: "50%",
                  transform: "translateY(-50%)",
                  borderRadius: "999px",
                  backgroundColor: "var(--tott-panel-bg)",
                  border: "1px solid var(--tott-card-border)",
                  color: "var(--tott-home-text-strong)",
                  boxShadow: "0px 1px 3px rgba(23, 23, 23, 0.4)",
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
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label={t("next")}
                className="absolute z-10 flex items-center justify-center transition-opacity hover:opacity-80"
                style={{
                  width: "40px",
                  height: "40px",
                  right: "clamp(8px, 2vw, 24px)",
                  top: "50%",
                  transform: "translateY(-50%)",
                  borderRadius: "999px",
                  backgroundColor: "var(--tott-panel-bg)",
                  border: "1px solid var(--tott-card-border)",
                  color: "var(--tott-home-text-strong)",
                  boxShadow: "0px 1px 3px rgba(23, 23, 23, 0.4)",
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
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="13 6 19 12 13 18" />
                </svg>
              </button>
            </>
          ) : null}
        </section>

        {/* ── Join the Room ─────────────────────────────────── */}
        <section
          aria-labelledby="join-room-heading"
          className="relative mt-16 overflow-hidden"
          style={{ padding: "32px 16px" }}
        >
          <HexPatternBackdrop />

          <div
            className="relative z-10 flex flex-col items-center text-center"
            style={{ gap: "clamp(18px, 2.5vw, 26px)" }}
          >
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
              <button
                type="button"
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
                  border: "none",
                }}
              >
                {t("joinWorkshop")}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

// ─── Workshop card ──────────────────────────────────────────────

function WorkshopCard({
  title,
  body,
  chips,
  ctaLabel,
}: {
  title: string;
  body: string;
  chips: string[];
  ctaLabel: string;
}) {
  return (
    <article
      className="relative flex w-full flex-col"
      style={{
        // Figma body padding: 0 40px (horizontal) with 16px vertical
        // gap from the corner brackets. Clamped so the card stays
        // breathable on narrow viewports.
        padding:
          "clamp(20px, 2.5vw, 24px) clamp(20px, 3vw, 40px) clamp(24px, 3vw, 32px)",
        gap: "16px",
      }}
    >
      <ChamferedFrame size={24} borderColor="var(--tott-card-border)" />

      <div className="flex flex-col" style={{ gap: "4px" }}>
        <h3
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 500,
            // Figma 16/24 Label/Medium. Scales modestly on big screens.
            fontSize: "clamp(0.9375rem, 1.2vw, 1rem)",
            lineHeight: "24px",
            letterSpacing: "-0.01em",
            color: "var(--tott-home-text-strong)",
            margin: 0,
          }}
          className="min-[1600px]:text-[17px]! min-[1920px]:text-[18px]!"
        >
          {title}
        </h3>

        <p
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 400,
            // Figma 14/20 Paragraph/Small.
            fontSize: "clamp(0.8125rem, 1.1vw, 0.875rem)",
            lineHeight: "20px",
            letterSpacing: "-0.005em",
            color: "var(--tott-home-text-muted)",
            margin: 0,
          }}
          className="min-[1600px]:text-[15px]! min-[1600px]:leading-6!"
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
                height: "24px",
                padding: "4px 8px",
                borderRadius: "6px",
                backgroundColor: "var(--tott-card-border)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
                color: "var(--tott-home-text-strong)",
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "12px",
                lineHeight: "16px",
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

      {/* Gold "Explore →" text link per Figma — color from the
          brand gold var, no button background. */}
      <button
        type="button"
        className="inline-flex items-center self-start transition-opacity hover:opacity-80"
        style={{
          gap: "8px",
          color: "var(--tott-magazine-btn-bg)",
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "20px",
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
