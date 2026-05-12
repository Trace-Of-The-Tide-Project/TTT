"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import { FirstWordGold } from "@/components/home/magazine/FirstWordGold";

// Reuse the workshops' moon glyph (already the Residency icon in
// the writing-room "Experiences" row) and the same gallery SVGs so
// every Writing-Room sub-page reads as one family.
const HERO_ICON = "/images/writing-room/moon-icon.svg";
const GALLERY_IMAGES: string[] = [
  "/images/workshops/gallery-thumbnail.svg",
  "/images/home/hero-silk.png",
  "/images/trip.png",
];
const GALLERY_PEEK = "/images/workshops/gallery-peek.svg";

export function ResidencyContent() {
  const t = useTranslations("Home.residency");
  const getItems = t.raw("getItems") as string[];
  const idealItems = t.raw("idealItems") as string[];

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
                fontSize: "clamp(0.8125rem, 0.9vw + 0.15rem, 3rem)",
                lineHeight: 1.55,
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

        {/* ── Two-card "What You Get" / "Ideal For" grid ───────
            Wrapped in an outer ChamferedFrame per Figma "About
            this event" frame — the inner cards are *also* each
            framed (nested) and carry a thumbnail image above the
            heading + checklist. */}
        <section
          aria-label={`${t("getHeading")}, ${t("idealHeading")}`}
          className="relative"
          style={{
            marginTop: "clamp(48px, 4vw + 0.5rem, 200px)",
            padding:
              "clamp(20px, 1vw + 0.5rem, 56px) clamp(16px, 1.6vw + 0.5rem, 72px)",
          }}
        >
          <ChamferedFrame size={24} borderColor="var(--tott-card-border)" />
          <ul
            className="grid grid-cols-1 md:grid-cols-2"
            style={{
              gap: "clamp(16px, 1vw + 0.3rem, 48px)",
              padding: 0,
              margin: 0,
              listStyle: "none",
            }}
          >
            <li className="flex">
              <ChecklistCard heading={t("getHeading")} items={getItems} />
            </li>
            <li className="flex">
              <ChecklistCard heading={t("idealHeading")} items={idealItems} />
            </li>
          </ul>
        </section>

        {/* ── Ready to Begin? CTA ──────────────────────────────
            Sits inside a softly-bordered rounded box per Figma
            "Group 15" — 1px --tott-elevated outline at radius 8px,
            generous vertical padding so the heading + button feel
            anchored within their own surface. */}
        <section
          aria-labelledby="ready-heading"
          className="relative flex flex-col items-center text-center"
          style={{
            marginTop: "clamp(48px, 4vw + 0.5rem, 200px)",
            gap: "clamp(16px, 0.8vw + 0.4rem, 32px)",
            padding:
              "clamp(48px, 3vw + 0.5rem, 120px) clamp(24px, 2vw + 0.5rem, 80px)",
            border: "1px solid var(--tott-elevated)",
            borderRadius: "8px",
          }}
        >
          <h2
            id="ready-heading"
            style={{
              fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "clamp(1.25rem, 2.6vw - 0.05rem, 8rem)",
              lineHeight: 1.2,
              color: "var(--tott-home-text-strong)",
              margin: 0,
            }}
          >
            {t("readyHeading")}
          </h2>
          <p
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "clamp(0.8125rem, 0.9vw + 0.15rem, 3rem)",
              lineHeight: 1.55,
              letterSpacing: "-0.005em",
              color: "var(--tott-home-text-muted)",
              maxWidth: "clamp(320px, 40vw, 1100px)",
              margin: 0,
            }}
          >
            {t("readyBody")}
          </p>
          <button
            type="button"
            className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
            style={{
              height: "clamp(40px, 2vw + 1rem, 96px)",
              padding: "clamp(8px, 0.6vw, 24px) clamp(20px, 1.4vw + 0.5rem, 56px)",
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
              border: "none",
              cursor: "pointer",
            }}
          >
            {t("applyResidency")}
          </button>
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

        {/* ── Back to Writing Room ───────────────────────────── */}
        <div
          className="flex justify-center"
          style={{ marginTop: "clamp(40px, 3vw + 0.5rem, 144px)" }}
        >
          <Link
            href="/writing-room"
            className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
            style={{
              height: "clamp(40px, 2vw + 1rem, 96px)",
              padding: "clamp(8px, 0.6vw, 24px) clamp(20px, 1.4vw + 0.5rem, 56px)",
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
      </div>
    </main>
  );
}

// ─── Helpers ──────────────────────────────────────────────────

// Brand-exported 437×181 card thumbnail (Thumbnail-4 from Figma).
// SVG bakes in the silk image, chamfered shape, and white-8%
// border so the asset drops in with no extra styling.
const CARD_THUMB = "/images/workshops/card-thumbnail.svg";

function ChecklistCard({
  heading,
  items,
}: {
  heading: string;
  items: string[];
}) {
  return (
    <article
      className="relative flex w-full flex-col"
      style={{
        padding:
          "clamp(20px, 1.5vw + 0.4rem, 56px) clamp(24px, 2vw + 0.5rem, 64px) clamp(24px, 1.8vw + 0.4rem, 56px)",
        gap: "clamp(16px, 1vw + 0.3rem, 32px)",
      }}
    >
      <ChamferedFrame size={24} borderColor="var(--tott-card-border)" />

      {/* Card thumbnail — Figma 437×181, ~2.41:1 aspect. We reuse
          the workshops gallery thumbnail SVG so both pages share
          imagery while a curated residency thumbnail is sourced. */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: "437 / 181",
          borderRadius: "8px",
          border:
            "1px solid color-mix(in srgb, var(--tott-home-text-strong) 8%, transparent)",
        }}
      >
        <Image
          src={CARD_THUMB}
          alt=""
          fill
          sizes="(min-width: 1280px) 437px, 90vw"
          className="select-none object-cover"
          draggable={false}
        />
      </div>

      <h3
        style={{
          fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
          fontWeight: 500,
          // Figma Title/H5: 18px/24px IBM Plex 500. Two-anchor
          // clamp — 18px at laptop, scales to ~36px on 5000px.
          fontSize: "clamp(1rem, 0.48vw + 0.74rem, 3rem)",
          lineHeight: 1.33,
          margin: 0,
        }}
      >
        {/* Same gold-radial → strong-text gradient as the home
            page's "Latest Published" heading. Theme-aware via the
            shared FirstWordGold component. */}
        <FirstWordGold raw={heading} />
      </h3>

      <ul
        className="flex flex-col"
        style={{
          // Figma 16px vertical gap between bullets — clamp routes
          // the line through 16px at laptop and scales up.
          gap: "clamp(12px, 0.5vw + 0.6rem, 32px)",
          margin: 0,
          padding: 0,
          listStyle: "none",
        }}
      >
        {items.map((it) => (
          <li
            key={it}
            className="flex flex-row items-center"
            style={{ gap: "clamp(8px, 0.4vw + 0.2rem, 16px)" }}
          >
            <span
              aria-hidden
              className="inline-flex shrink-0 items-center justify-center"
              style={{
                width: "clamp(20px, 0.5vw + 0.85rem, 32px)",
                height: "clamp(20px, 0.5vw + 0.85rem, 32px)",
                color: "var(--tott-magazine-btn-bg)",
                // Figma "Vector" drop-shadow rgba(0,0,0,0.32) on
                // the check glyph.
                filter:
                  "drop-shadow(0px 1px 2px color-mix(in srgb, var(--tott-panel-bg) 32%, transparent))",
              }}
            >
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
            <span
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "clamp(0.9375rem, 0.4vw + 0.5rem, 1.5rem)",
                lineHeight: 1.4,
                letterSpacing: "-0.01em",
                color: "var(--tott-home-text-strong)",
                // Figma label text-shadow 0px 1px 2px rgba(0,0,0,0.24).
                textShadow: "var(--tott-home-text-shadow)",
              }}
            >
              {it}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}
