"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { staggerParent, staggerChild, springs } from "@/lib/motion";
import HexBackground from "@/components/ui/HexBackground";
import { SearchIcon } from "@/components/ui/icons";
import { FeaturedHexCard } from "@/components/content/related/FeaturedHexCard";
import { theme } from "@/lib/theme";
import { useWriters } from "@/hooks/queries/writers";
import {
  writerAvatar,
  writerDisplayName,
  type WriterProfile,
} from "@/services/writers.service";
import { WriterShowCard, type WriterShowCardData } from "./WriterShowCard";

function toCard(w: WriterProfile): WriterShowCardData {
  return {
    id: w.id,
    userId: w.user_id ?? w.user?.id ?? null,
    name: writerDisplayName(w) || "Writer",
    headline: w.headline?.trim() || w.bio?.trim() || null,
    avatar: writerAvatar(w),
    themes: Array.isArray(w.themes)
      ? w.themes.filter((t): t is string => Boolean(t?.trim()))
      : [],
  };
}

export function WritersShowContent({
  initialWriters,
  featuredWriters,
}: {
  initialWriters: WriterProfile[];
  featuredWriters: WriterProfile[];
}) {
  const t = useTranslations("Writers");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [activeTheme, setActiveTheme] = useState<string | null>(null);

  // Debounce the search box before it hits the public list endpoint.
  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  const params = search ? { search } : undefined;
  const { data, isFetching } = useWriters(params);
  // Seed the no-search view with the SSR list so the grid is never empty on
  // first paint; once a search runs react-query owns the data.
  const writers = search ? data ?? [] : data ?? initialWriters;

  // Theme pills — deduped across the loaded writers, sorted for stable order.
  const allThemes = useMemo(() => {
    const set = new Set<string>();
    for (const w of writers) {
      if (Array.isArray(w.themes)) {
        for (const th of w.themes) {
          const v = th?.trim();
          if (v) set.add(v);
        }
      }
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [writers]);

  const cards = useMemo(() => {
    const mapped = writers.map(toCard);
    if (!activeTheme) return mapped;
    return mapped.filter((c) => c.themes.includes(activeTheme));
  }, [writers, activeTheme]);

  const hasFilters = Boolean(search || activeTheme);

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setActiveTheme(null);
  }

  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: theme.homeSurface }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-35 overflow-hidden"
        style={{ opacity: "var(--tott-dash-hex-opacity, 1)" }}
      >
        <HexBackground />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-24 sm:px-10 sm:pt-28">
        {/* Header */}
        <header className="max-w-2xl">
          <h1
            className="text-3xl font-medium sm:text-4xl"
            style={{ color: "var(--tott-home-text-strong)" }}
          >
            {t("show.title")}
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--tott-home-text-muted)" }}>
            {t("show.subtitle")}
          </p>
        </header>

        {/* Featured hero strip */}
        {featuredWriters.length > 0 ? (
          <section className="mt-10">
            <h2
              className="text-lg font-medium"
              style={{ color: "var(--tott-home-text-heading)" }}
            >
              {t("show.featuredHeading")}
            </h2>
            <div
              className="mt-5 flex gap-4 overflow-x-auto pb-2 [--carousel-card-w:240px]"
              style={{ scrollbarWidth: "thin" }}
            >
              {featuredWriters.map((w) => (
                <FeaturedHexCard
                  key={w.id}
                  title={writerDisplayName(w) || "Writer"}
                  author={w.headline?.trim() || "TTT Writer"}
                  coverImage={writerAvatar(w)}
                  href={`/writers/${encodeURIComponent(w.id)}`}
                />
              ))}
            </div>
          </section>
        ) : null}

        {/* Search + theme filter bar */}
        <div className="sticky top-16 z-20 mt-12 -mx-2 px-2 py-3 backdrop-blur">
          <div className="flex flex-col gap-3">
            <label
              className="flex w-full items-center gap-2 rounded-lg border px-4 py-2.5 sm:w-80"
              style={{
                borderColor: theme.cardBorder,
                backgroundColor: "var(--tott-well-bg)",
              }}
            >
              <span style={{ color: "var(--tott-home-text-muted)" }}>
                <SearchIcon />
              </span>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t("show.searchPlaceholder")}
                className="w-full bg-transparent text-sm outline-none"
                style={{ color: "var(--tott-home-text-strong)" }}
              />
            </label>

            {allThemes.length > 0 ? (
              <div className="flex flex-wrap items-center gap-2">
                <ThemePill
                  label={t("show.allThemes")}
                  active={activeTheme === null}
                  onClick={() => setActiveTheme(null)}
                />
                {allThemes.map((th) => (
                  <ThemePill
                    key={th}
                    label={th}
                    active={activeTheme === th}
                    onClick={() => setActiveTheme(activeTheme === th ? null : th)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>

        {/* Grid / states */}
        <div className="mt-8 pb-16">
          {isFetching && cards.length === 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : cards.length === 0 ? (
            <div
              className="flex flex-col items-start gap-3 rounded-2xl border p-8"
              style={{ borderColor: theme.cardBorder }}
            >
              <h3
                className="text-lg font-medium"
                style={{ color: "var(--tott-home-text-strong)" }}
              >
                {t("show.emptyTitle")}
              </h3>
              {hasFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
                  style={{
                    padding: "8px 20px",
                    borderRadius: 8,
                    fontWeight: 500,
                    fontSize: 14,
                    backgroundColor: "var(--tott-magazine-btn-bg)",
                    color: "var(--tott-auth-btn-text)",
                  }}
                >
                  {t("show.clearFilters")}
                </button>
              ) : null}
            </div>
          ) : (
            <motion.ul
              className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
              variants={staggerParent}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {cards.map((c) => (
                <motion.li
                  key={c.id}
                  variants={staggerChild}
                  transition={springs.gentle}
                  className="h-full"
                >
                  <WriterShowCard data={c} />
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>
      </div>
    </main>
  );
}

function ThemePill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="inline-flex items-center transition-colors"
      style={{
        padding: "5px 12px",
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 500,
        border: `1px solid ${active ? "var(--tott-accent-gold)" : theme.cardBorder}`,
        backgroundColor: active ? "var(--tott-magazine-btn-bg)" : "transparent",
        color: active ? "var(--tott-auth-btn-text)" : "var(--tott-home-text-heading)",
      }}
    >
      {label}
    </button>
  );
}

function SkeletonCard() {
  return (
    <div
      className="flex h-full animate-pulse flex-col gap-4 p-5"
      style={{
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: 16,
        backgroundColor: "var(--tott-well-bg)",
      }}
    >
      <div className="flex items-start gap-4">
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 999,
            backgroundColor: theme.cardBorder,
          }}
        />
        <div className="flex-1 space-y-2 pt-1">
          <div style={{ height: 14, width: "60%", borderRadius: 4, backgroundColor: theme.cardBorder }} />
          <div style={{ height: 12, width: "90%", borderRadius: 4, backgroundColor: theme.cardBorder }} />
        </div>
      </div>
      <div className="flex gap-2">
        <div style={{ height: 22, width: 56, borderRadius: 6, backgroundColor: theme.cardBorder }} />
        <div style={{ height: 22, width: 64, borderRadius: 6, backgroundColor: theme.cardBorder }} />
      </div>
      <div
        className="mt-auto"
        style={{ height: 32, width: 88, borderRadius: 8, backgroundColor: theme.cardBorder }}
      />
    </div>
  );
}
