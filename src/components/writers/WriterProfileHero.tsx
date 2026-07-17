"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { motion, animate, useInView, useMotionValue } from "motion/react";
import { staggerParent, staggerChild, springs } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Parallax } from "@/components/motion/Parallax";
import HexBackground from "@/components/ui/HexBackground";
import { ChamferedSurface } from "@/components/ui/ChamferedSurface";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { FirstWordGold } from "@/components/home/magazine/FirstWordGold";
import { FollowButton } from "@/components/writers/FollowButton";
import type { WriterDetailView } from "@/components/writers/WriterDetailContent";

/** Editorial type system — Plex Serif for the display moments (name + quote),
 * Plex Sans for everything utilitarian. Mirrors WritersShowContent. */
const SERIF = "var(--font-plex-serif), 'IBM Plex Serif', Georgia, serif";
const SANS = "var(--font-plex-sans), 'IBM Plex Sans', system-ui, sans-serif";

const CARD_BORDER = "var(--tott-card-border)";
const ACCENT = "var(--tott-accent-gold)";

/** Strip stray leading/trailing quotes — we render our own curly quotes. */
function stripQuotes(s: string): string {
  return s.replace(/^["“]+/, "").replace(/["”]+$/, "").trim();
}

/** Animated integer that counts up when scrolled into view. Falls back to the
 * final number with no animation under reduced-motion. */
function CountUp({ value }: { value: number }) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced || !inView) return;
    const controls = animate(mv, value, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduced, value, mv]);

  return <span ref={ref}>{display}</span>;
}

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <ChamferedPanel size={12}>
      <div className="flex flex-col items-start gap-1 px-5 py-4">
        <span
          className="text-4xl font-medium tabular-nums sm:text-5xl"
          style={{ color: ACCENT, fontFamily: SERIF }}
        >
          <CountUp value={value} />
        </span>
        <span
          className="text-xs uppercase tracking-wide"
          style={{ color: "var(--tott-home-text-muted)" }}
        >
          {label}
        </span>
      </div>
    </ChamferedPanel>
  );
}

export function WriterProfileHero({ writer }: { writer: WriterDetailView }) {
  const t = useTranslations("Writers");
  const initial = (writer.name || "?").trim().charAt(0).toUpperCase();
  const quote = writer.quote ? stripQuotes(writer.quote) : null;
  const hasStats = writer.followerCount > 0 || writer.workCount > 0;

  return (
    <section className="relative">
      {/* Decorative hex band, drifting on scroll (self-gates reduced-motion). */}
      <Parallax
        distance={40}
        className="pointer-events-none absolute inset-x-0 top-0 h-96"
      >
        <div
          aria-hidden
          className="h-full w-full"
          style={{ opacity: "var(--tott-dash-hex-opacity, 1)" }}
        >
          <HexBackground />
        </div>
      </Parallax>

      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-24 sm:px-10 sm:pt-28">
        <motion.div
          variants={staggerParent}
          initial="hidden"
          animate="visible"
          className="grid items-start gap-10 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-14"
        >
          {/* Portrait — chamfered surface, image or gold-wash initial. */}
          <motion.div
            variants={staggerChild}
            transition={springs.gentle}
            className="mx-auto w-full max-w-[320px] lg:mx-0"
          >
            <ChamferedSurface
              chamfer={20}
              borderColor={CARD_BORDER}
              className="aspect-[4/5] w-full"
            >
              {writer.avatar ? (
                <Image
                  src={writer.avatar}
                  alt=""
                  fill
                  sizes="320px"
                  // External signed GCS URL — bypass the Next optimizer (it
                  // 502s on these); load directly.
                  unoptimized
                  className="select-none object-cover"
                  draggable={false}
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{
                    background:
                      "color-mix(in srgb, var(--tott-accent-gold) 14%, var(--tott-home-surface))",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      fontFamily: SERIF,
                      fontWeight: 500,
                      fontSize: 96,
                      lineHeight: 1,
                      color: "var(--tott-home-text-strong)",
                      opacity: 0.8,
                    }}
                  >
                    {initial}
                  </span>
                </div>
              )}
            </ChamferedSurface>
          </motion.div>

          {/* Editorial block */}
          <div className="min-w-0">
            <motion.h1
              variants={staggerChild}
              transition={springs.gentle}
              className="text-[2.75rem] font-medium leading-[1.02] tracking-[-0.02em] sm:text-6xl lg:text-7xl"
              style={{ fontFamily: SERIF, overflowWrap: "anywhere" }}
            >
              <FirstWordGold raw={writer.name} />
            </motion.h1>

            {writer.headline ? (
              <motion.p
                variants={staggerChild}
                transition={springs.gentle}
                className="mt-4 max-w-xl text-base leading-relaxed sm:text-lg"
                style={{ color: "var(--tott-home-text-muted)", fontFamily: SANS }}
              >
                {writer.headline}
              </motion.p>
            ) : null}

            {quote ? (
              <motion.blockquote
                variants={staggerChild}
                transition={springs.gentle}
                className="mt-8 max-w-2xl"
              >
                <p
                  className="text-2xl leading-snug sm:text-[2rem] sm:leading-[1.28]"
                  style={{
                    fontFamily: SERIF,
                    color: "var(--tott-home-text-strong)",
                  }}
                >
                  <span aria-hidden style={{ color: ACCENT }}>
                    “
                  </span>
                  {quote}
                  <span aria-hidden style={{ color: ACCENT }}>
                    ”
                  </span>
                </p>
              </motion.blockquote>
            ) : null}

            {writer.userId ? (
              <motion.div
                variants={staggerChild}
                transition={springs.gentle}
                className="mt-8"
              >
                <FollowButton targetUserId={writer.userId} />
              </motion.div>
            ) : null}

            {hasStats ? (
              <motion.div
                className="mt-8 grid max-w-xs grid-cols-2 gap-4"
                variants={staggerParent}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                <motion.div variants={staggerChild} transition={springs.gentle}>
                  <StatTile
                    value={writer.followerCount}
                    label={t("stats.followers")}
                  />
                </motion.div>
                <motion.div variants={staggerChild} transition={springs.gentle}>
                  <StatTile value={writer.workCount} label={t("stats.works")} />
                </motion.div>
              </motion.div>
            ) : null}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
