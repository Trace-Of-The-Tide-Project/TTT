"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { FeaturedHexCard } from "@/components/content/related/FeaturedHexCard";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { easeOut } from "@/lib/motion";
import {
  writerAvatar,
  writerDisplayName,
  type WriterProfile,
} from "@/services/writers.service";

const CARD_W = 240;
const GAP = 16;
const VISIBLE = 3;
const INTERVAL_MS = 4000;

/**
 * Auto-advancing writer slider — shows exactly `VISIBLE` hex cards at a
 * time, no scrollbar. Advances on a timer, pauses on hover/focus, and
 * loops back to the start. Static (no motion) when reduced motion or when
 * there aren't enough writers to fill more than one page.
 */
export function CommunityWriters({ writers }: { writers: WriterProfile[] }) {
  const t = useTranslations("Community");
  const reduced = useReducedMotion();
  const pageCount = Math.max(1, writers.length - VISIBLE + 1);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduced || paused || pageCount <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % pageCount);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, [reduced, paused, pageCount]);

  const offset = -(index * (CARD_W + GAP));

  return (
    <RevealOnScroll>
    <section className="mt-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2
            className="font-serif text-3xl font-medium"
            style={{ color: "var(--tott-home-text-strong)" }}
          >
            {t("writersHeading")}
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--tott-home-text-muted)" }}>
            {t("writersSubtitle")}
          </p>
        </div>
        <Link
          href="/writers"
          className="shrink-0 text-sm font-medium transition-opacity hover:opacity-80"
          style={{ color: "var(--tott-accent-gold)" }}
        >
          {t("writersCta")}
        </Link>
      </div>

      <div
        className="relative mx-auto mt-6 overflow-hidden"
        style={{ maxWidth: VISIBLE * CARD_W + (VISIBLE - 1) * GAP }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <motion.div
          className="flex [--carousel-card-w:240px]"
          style={{ gap: GAP }}
          animate={{ x: reduced ? 0 : offset }}
          transition={{ duration: 0.6, ease: easeOut }}
        >
          {writers.map((w) => (
            <FeaturedHexCard
              key={w.id}
              title={writerDisplayName(w) || "Writer"}
              author={w.headline?.trim() || "TTT Writer"}
              coverImage={writerAvatar(w)}
              href={`/writers/${encodeURIComponent(w.id)}`}
            />
          ))}
        </motion.div>
      </div>

      {pageCount > 1 ? (
        <div className="mt-4 flex justify-center gap-1.5">
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === index ? 20 : 8,
                backgroundColor:
                  i === index
                    ? "var(--tott-accent-gold)"
                    : "color-mix(in srgb, var(--tott-accent-gold) 30%, transparent)",
              }}
            />
          ))}
        </div>
      ) : null}
    </section>
    </RevealOnScroll>
  );
}
