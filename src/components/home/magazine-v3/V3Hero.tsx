"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { V3BoardCoverflow } from "./V3BoardCoverflow";

export type HeroSlide = {
  id: string;
  name: string;
  avatar: string | null;
  href: string;
  lang: string | null;
};

/**
 * Full-bleed hero: background image, headline block, CTA button. The
 * article slider gets its own section below (V3HeroSlider) instead of
 * overlapping the hero image — Figma shows the cards bleeding across the
 * hero/section boundary, but that only reads as intentional with a full
 * 6-card row; with fewer real articles it looked like debris floating on a
 * dark, mostly-empty image, so the two are visually separated here.
 */
export function V3Hero({
  eyebrow,
  title,
  standfirst,
  ctaLabel,
  ctaHref,
  backgroundImage,
}: {
  eyebrow?: string;
  title: string;
  standfirst: string;
  ctaLabel: string;
  ctaHref: string;
  backgroundImage: string | null;
}) {
  return (
    <section className="relative overflow-hidden bg-[var(--tott-home-surface)]">
      {/* Background image + shadow overlays. */}
      <div className="relative h-[560px] w-full sm:h-[640px]">
        {backgroundImage ? (
          <Image src={backgroundImage} alt="" fill priority className="object-cover" />
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(23,23,23,0.2) 0%, rgba(23,23,23,0.75) 70%, #171717 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(23,23,23,0.6) 0%, rgba(23,23,23,0) 40%)",
          }}
        />

        {/* Headline block. */}
        <div className="absolute start-[156px] top-[200px] w-[456px] max-w-[calc(100%-2rem)]">
          {eyebrow ? (
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--tott-gold-muted)]">
              {eyebrow}
            </p>
          ) : null}
          <h1
            className="font-display text-3xl text-[var(--tott-home-text-strong)] sm:text-[40px]"
            style={{
              lineHeight: "var(--tott-display-leading)",
              letterSpacing: "var(--tott-display-tracking)",
            }}
          >
            {title}
          </h1>
          <p className="mt-4 max-w-[456px] text-[16px] leading-6 text-[var(--tott-text-secondary-soft)]">
            {standfirst}
          </p>
          <Link
            href={ctaHref}
            className="mt-6 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-[var(--tott-gold-chip-ink)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)] transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--tott-accent-gold-focus)" }}
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * The Board writers strip, as its own section below the hero — 3D
 * coverflow (active card centered, others rotated/receded) instead of a
 * drag/scroll row, still hex-clipped per the TTT signature.
 */
export function V3HeroSlider({
  heading,
  slides,
  prevLabel,
  nextLabel,
  isRtl,
}: {
  heading?: string;
  slides: HeroSlide[];
  prevLabel: string;
  nextLabel: string;
  isRtl: boolean;
}) {
  if (slides.length === 0) return null;
  return (
    <section className="bg-[var(--tott-home-surface)] py-10">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        {heading ? (
          <h2 className="mb-6 font-['IBM_Plex_Sans'] text-2xl font-medium text-[var(--tott-home-text-warm)]">
            {heading}
          </h2>
        ) : null}
        <V3BoardCoverflow
          slides={slides}
          prevLabel={prevLabel}
          nextLabel={nextLabel}
          isRtl={isRtl}
        />
      </div>
    </section>
  );
}
