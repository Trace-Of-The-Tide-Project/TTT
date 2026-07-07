"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import { theme } from "@/lib/theme";
import HexBackground from "@/components/ui/HexBackground";
import { Parallax } from "@/components/motion/Parallax";
import { ScrollFadeOut } from "@/components/motion/ScrollFadeOut";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const ROTATE_MS = 7000;

/**
 * "Where storytellers gather" — full-viewport cinematic hero, ported from
 * the hub AtriumHero: a full-bleed cover with a slow Ken Burns drift +
 * scroll parallax, scrims for navbar/copy legibility, an oversized serif
 * headline that lifts and fades on scroll, hex micro-motif, and an animated
 * tideline cutting the image into the page surface.
 *
 * `coverImages` is the admin-managed rotation (Community admin tab); with
 * more than one image the hero crossfades between them on a timer. With
 * none it falls back to the on-brand textured plate — never a void.
 */
export function CommunityHero({ coverImages = [] }: { coverImages?: string[] }) {
  const t = useTranslations("Community");
  const reduced = useReducedMotion();
  const images = coverImages.filter((s) => s.trim());
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || images.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, [reduced, images.length]);

  const cover = images[index] ?? null;

  return (
    <section className="relative min-h-[100svh] w-full overflow-hidden">
      {/* Cover layer — Ken Burns animates this wrapper, parallax drifts it. */}
      <Parallax distance={28} className="absolute inset-0">
        <div aria-hidden className="tott-kenburns absolute inset-0">
          {cover ? (
            <AnimatePresence mode="sync">
              <motion.div
                key={cover}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease: "easeInOut" }}
              >
                <Image
                  src={cover}
                  alt=""
                  fill
                  priority
                  sizes="100vw"
                  className="select-none object-cover"
                  draggable={false}
                  unoptimized
                />
              </motion.div>
            </AnimatePresence>
          ) : (
            <TexturedPlate />
          )}
        </div>
      </Parallax>

      {/* Hex micro-motif band echoing the page chrome. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-56 overflow-hidden opacity-60"
      >
        <HexBackground />
      </div>

      {/* Scrims: bottom-up for the copy, top strip for the overlaid navbar. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.42) 34%, rgba(0,0,0,0) 62%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-48"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.55), transparent)",
        }}
      />

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[1392px] flex-col justify-end px-6 pb-36 pt-28 sm:px-10 sm:pb-40">
        <ScrollFadeOut className="flex flex-col items-start text-start">
          <span
            className="font-mono text-xs font-semibold uppercase tracking-[0.22em]"
            style={{ color: theme.accentGold }}
          >
            {t("heroEyebrow")}
          </span>
          <h1
            className="mt-5 max-w-4xl font-serif font-medium text-white"
            style={{ fontSize: "clamp(2.75rem, 7vw, 6rem)", lineHeight: 1.05 }}
          >
            {t("heroTitle")}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            {t("heroSubtitle")}
          </p>
        </ScrollFadeOut>
      </div>

      {images.length > 1 ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-24 flex justify-center gap-1.5 sm:bottom-28">
          {images.map((_, i) => (
            <span
              key={i}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === index ? 20 : 8,
                backgroundColor:
                  i === index ? "#fff" : "rgba(255,255,255,0.35)",
              }}
            />
          ))}
        </div>
      ) : null}

      <TidelineDivider />
    </section>
  );
}

/** No cover — on-brand silk + hex plate with a tide gradient wash. */
function TexturedPlate() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--tott-accent-tide) 28%, var(--tott-home-surface)) 0%, var(--tott-home-surface) 100%)",
      }}
    >
      <Image
        src="/images/home/hero-silk.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="select-none object-cover opacity-40 mix-blend-overlay"
        draggable={false}
      />
      <div className="absolute inset-0 opacity-70">
        <HexBackground />
      </div>
    </div>
  );
}

/**
 * Animated tideline cutting the hero into the page surface. Inner strip is
 * 200% wide with a two-period wave so the -50% translateX loop is seamless.
 */
function TidelineDivider() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 h-20 overflow-hidden sm:h-28"
    >
      <div className="tott-tide-drift absolute inset-y-0 left-0 w-[200%]">
        <svg
          className="h-full w-full"
          viewBox="0 0 2880 120"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M0,64 C240,96 480,32 720,64 C960,96 1200,32 1440,64 C1680,96 1920,32 2160,64 C2400,96 2640,32 2880,64 L2880,120 L0,120 Z"
            fill="var(--tott-home-surface)"
          />
          <path
            d="M0,64 C240,96 480,32 720,64 C960,96 1200,32 1440,64 C1680,96 1920,32 2160,64 C2400,96 2640,32 2880,64"
            stroke="color-mix(in srgb, var(--tott-accent-tide) 70%, transparent)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
    </div>
  );
}
