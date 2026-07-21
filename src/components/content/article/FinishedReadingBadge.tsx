"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";

const ARTICLE_END_SENTINEL_ID = "article-body-end";

/**
 * Inline "finished reading" moment anchored beside the TOC — appears once
 * the end of the article body scrolls into view (mirrors the sentinel
 * IntersectionObserver pattern ArticleTableOfContents uses for headings,
 * not whole-page scroll %, so it fires as soon as the reader is actually
 * done with the text — not after scrolling past the sidebar/footer too).
 * Stays once shown (not a dismissing toast) so scrolling back up to the
 * TOC still shows it was earned.
 */
export function FinishedReadingBadge() {
  const t = useTranslations("Content");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const el = document.getElementById(ARTICLE_END_SENTINEL_ID);
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setDone(true);
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {done ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
          className="relative isolate mt-4 overflow-hidden rounded-2xl p-[1px]"
        >
          <motion.div
            aria-hidden
            className="absolute inset-[-40%]"
            style={{
              background:
                "conic-gradient(from 0deg, transparent 0deg, color-mix(in srgb, var(--tott-status-emerald) 70%, transparent) 90deg, transparent 180deg)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <div
            className="relative flex items-center gap-3 rounded-2xl px-4 py-3.5"
            style={{ backgroundColor: "var(--tott-dash-surface)" }}
          >
            <motion.span
              initial={{ scale: 0.4, rotate: -20, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 18, delay: 0.08 }}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold"
              style={{
                backgroundColor: "var(--tott-status-emerald)",
                color: "var(--tott-well-bg)",
                boxShadow: "0 0 16px color-mix(in srgb, var(--tott-status-emerald) 60%, transparent)",
              }}
              aria-hidden
            >
              ✓
            </motion.span>
            <p className="text-sm font-semibold text-foreground">
              {t("article.finishedReading")}
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
