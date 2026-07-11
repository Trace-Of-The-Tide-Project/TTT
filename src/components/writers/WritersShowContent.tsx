"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  motion,
  animate,
  useInView,
  useMotionValue,
} from "motion/react";
import { Link } from "@/i18n/navigation";
import { staggerParent, staggerChild, springs } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Parallax } from "@/components/motion/Parallax";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { SpringCard } from "@/components/motion/SpringCard";
import HexBackground from "@/components/ui/HexBackground";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { SearchIcon } from "@/components/ui/icons";
import { FirstWordGold } from "@/components/home/magazine/FirstWordGold";
import { FeaturedHexRow } from "@/components/content/related/FeaturedHexRow";
import {
  FeaturedHexCard,
  type FeaturedHexItem,
} from "@/components/content/related/FeaturedHexCard";
import { theme } from "@/lib/theme";
import { useWriters } from "@/hooks/queries/writers";
import {
  writerAvatar,
  writerDisplayName,
  type WriterProfile,
  type WriterProfileFull,
} from "@/services/writers.service";

/** Editorial type system. Plex Serif carries the display moments (masthead
 * title + pull-quote); Plex Sans handles everything utilitarian. These point at
 * the REAL next/font variables set on <body> — the codebase's older
 * `var(--font-sans)` was never defined, so serif went unused until now. */
const SERIF = "var(--font-plex-serif), 'IBM Plex Serif', Georgia, serif";
const SANS = "var(--font-plex-sans), 'IBM Plex Sans', system-ui, sans-serif";

/** Strip stray straight/curly quotes some source data ships with — we add our
 * own curly quotes around the rendered pull-quote. */
function stripQuotes(s: string): string {
  return s.replace(/^["“]+/, "").replace(/["”]+$/, "").trim();
}

function toHexItem(w: WriterProfile): FeaturedHexItem {
  return {
    id: w.id,
    title: writerDisplayName(w) || "Writer",
    author: w.headline?.trim() || "TTT Writer",
    coverImage: writerAvatar(w),
    href: `/writers/${encodeURIComponent(w.id)}`,
  };
}

/** Themes a writer carries — for the client-side pill filter. */
function writerThemes(w: WriterProfile): string[] {
  return Array.isArray(w.themes)
    ? w.themes.filter((t): t is string => Boolean(t?.trim()))
    : [];
}

/** Normalize a raw DB theme tag for display (filter still uses the raw value).
 * Tags are free-text and inconsistently cased ("Human", "human sensitivity").
 * Title-case each word; leave the underlying value untouched for filtering. */
function titleCaseTheme(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}

/** Animated integer that counts up to `value` when scrolled into view. Falls
 * back to the final number with no animation under reduced-motion. */
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

export function WritersShowContent({
  initialWriters,
  featuredWriters,
  spotlightProfile,
}: {
  initialWriters: WriterProfile[];
  featuredWriters: WriterProfile[];
  spotlightProfile: WriterProfileFull | null;
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
  const writers = useMemo(
    () => (search ? data ?? [] : data ?? initialWriters),
    [search, data, initialWriters],
  );

  // The first featured writer leads the hero; drop it from the carousel.
  const spotlightWriter = featuredWriters[0] ?? null;
  const railWriters = featuredWriters.slice(1);
  // Only show the "Featured" carousel when featured is a TRUE subset of the
  // roster — otherwise it just duplicates the grid below (the small-dataset
  // case where every writer is featured). Baseline off the unfiltered SSR list
  // so searching doesn't flip the rail on/off.
  const showFeaturedRail =
    railWriters.length > 0 && featuredWriters.length < initialWriters.length;

  // Roster-wide aggregates for the hero stat tiles — computed once off the
  // unfiltered SSR list so the numbers stay stable while searching/filtering.
  const rosterStats = useMemo(() => {
    const themes = new Set<string>();
    const places = new Set<string>();
    let board = 0;
    for (const w of initialWriters) {
      for (const th of writerThemes(w)) themes.add(th.toLowerCase());
      const loc = w.location?.trim();
      if (loc) places.add(loc.toLowerCase());
      if (w.editorial_board) board += 1;
    }
    return {
      voices: initialWriters.length,
      themes: themes.size,
      places: places.size,
      board,
    };
  }, [initialWriters]);

  // Theme pills — deduped across the loaded writers, sorted for stable order.
  // `count` weights the galaxy pill size; the raw value drives filtering.
  const allThemes = useMemo(() => {
    const counts = new Map<string, number>();
    for (const w of writers) {
      for (const th of writerThemes(w)) {
        counts.set(th, (counts.get(th) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
  }, [writers]);

  const items = useMemo(() => {
    const filtered = activeTheme
      ? writers.filter((w) => writerThemes(w).includes(activeTheme))
      : writers;
    return filtered.map((w) => ({ ...toHexItem(w), themes: writerThemes(w) }));
  }, [writers, activeTheme]);

  const hasFilters = Boolean(search || activeTheme);

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setActiveTheme(null);
  }

  const statTiles = [
    { value: rosterStats.voices, label: t("show.statsVoices") },
    { value: rosterStats.themes, label: t("show.statsThemes") },
    { value: rosterStats.places, label: t("show.statsLocations") },
    { value: rosterStats.board, label: t("show.statsBoard") },
  ].filter((s) => s.value > 0);

  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: theme.homeSurface }}
    >
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

      <div className="relative z-10 pt-24 sm:pt-28">
        {/* ── 1. Cinematic editorial hero ─────────────────────────── */}
        <section className="mx-auto max-w-6xl px-6 sm:px-10">
          <motion.div
            variants={staggerParent}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={staggerChild}
              transition={springs.gentle}
              className="flex items-center gap-3"
            >
              <span
                aria-hidden
                className="h-px w-8"
                style={{ backgroundColor: theme.accentGold }}
              />
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.28em]"
                style={{ color: theme.accentGold, fontFamily: SANS }}
              >
                {t("show.heroKicker")}
              </span>
            </motion.div>

            <div className="mt-6 max-w-3xl">
              <motion.h1
                variants={staggerChild}
                transition={springs.gentle}
                className="text-[2.75rem] font-medium leading-[1.02] tracking-[-0.02em] sm:text-6xl lg:text-7xl"
                style={{ fontFamily: SERIF }}
              >
                <FirstWordGold raw={t("show.title")} />
              </motion.h1>
              <motion.p
                variants={staggerChild}
                transition={springs.gentle}
                className="mt-6 max-w-xl text-base leading-relaxed sm:text-lg"
                style={{ color: "var(--tott-home-text-muted)", fontFamily: SANS }}
              >
                {t("show.subtitle")}
              </motion.p>
              {writers.length > 0 ? (
                <motion.div
                  variants={staggerChild}
                  transition={springs.gentle}
                  className="mt-8 flex items-center gap-3"
                >
                  <span
                    aria-hidden
                    className="h-px w-6"
                    style={{ backgroundColor: "var(--tott-card-border)" }}
                  />
                  <span
                    className="text-xs uppercase tracking-[0.18em]"
                    style={{ color: "var(--tott-home-text-heading)", fontFamily: SANS }}
                  >
                    {t("show.voiceCount", { count: writers.length })}
                  </span>
                </motion.div>
              ) : null}
            </div>
          </motion.div>

          {/* Live roster stat tiles */}
          {statTiles.length > 0 ? (
            <motion.div
              className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4"
              variants={staggerParent}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {statTiles.map((s) => (
                <motion.div
                  key={s.label}
                  variants={staggerChild}
                  transition={springs.gentle}
                >
                  <ChamferedPanel size={12}>
                    <div className="flex flex-col items-start gap-1 px-5 py-4">
                      <span
                        className="text-4xl font-medium tabular-nums sm:text-5xl"
                        style={{ color: theme.accentGold, fontFamily: SERIF }}
                      >
                        <CountUp value={s.value} />
                      </span>
                      <span
                        className="text-xs uppercase tracking-wide"
                        style={{ color: "var(--tott-home-text-muted)" }}
                      >
                        {s.label}
                      </span>
                    </div>
                  </ChamferedPanel>
                </motion.div>
              ))}
            </motion.div>
          ) : null}
        </section>

        {/* ── Featured Voice — full-width spotlight band ──────────── */}
        {spotlightWriter ? (
          <FeaturedVoiceBand
            writer={spotlightWriter}
            profile={spotlightProfile}
            label={t("show.spotlightLabel")}
            followersLabel={t("show.followersLabel")}
            worksLabel={t("show.worksLabel")}
            basedInLabel={t("show.basedIn")}
            viewProfileLabel={t("show.viewProfile")}
          />
        ) : null}

        {/* ── 2. Featured silk-hex carousel ───────────────────────── */}
        {showFeaturedRail ? (
          <RevealOnScroll className="mt-20">
            <FeaturedHexRow
              items={railWriters.map(toHexItem)}
              heading={t("show.featuredHeading")}
              prevLabel={t("show.carouselPrev")}
              nextLabel={t("show.carouselNext")}
            />
          </RevealOnScroll>
        ) : null}

        {/* ── 3 + 4. Filter bar + all-voices grid ─────────────────── */}
        <section className="mx-auto mt-20 max-w-6xl px-6 pb-20 sm:px-10">
          <div
            className="flex items-center gap-3 border-b pb-4"
            style={{ borderColor: "var(--tott-card-border)" }}
          >
            <span
              aria-hidden
              className="inline-block shrink-0"
              style={{
                width: 11,
                height: 12,
                backgroundColor: theme.accentGold,
                clipPath:
                  "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
              }}
            />
            <h2
              className="text-2xl font-medium tracking-tight sm:text-3xl"
              style={{ fontFamily: SERIF }}
            >
              <FirstWordGold raw={t("show.allHeading")} />
            </h2>
          </div>

          {/* Filter toolbar */}
          <div
            className="sticky top-16 z-20 mt-6 -mx-2 px-2 py-4 backdrop-blur"
            style={{
              backgroundColor:
                "color-mix(in srgb, var(--tott-home-surface) 88%, transparent)",
            }}
          >
            <div className="flex flex-col gap-3">
              <label
                className="flex w-full items-center gap-2.5 rounded-lg border px-4 py-2.5 sm:w-96"
                style={{
                  backgroundColor: "var(--tott-well-bg)",
                  borderColor: "var(--tott-card-border)",
                }}
              >
                <span style={{ color: "var(--tott-home-text-muted)" }}>
                  <SearchIcon />
                </span>
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t("show.searchPlaceholder")}
                  aria-label={t("show.searchPlaceholder")}
                  className="w-full border-0 bg-transparent p-0 text-sm outline-none focus:ring-0"
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
                      key={th.value}
                      label={titleCaseTheme(th.value)}
                      active={activeTheme === th.value}
                      onClick={() =>
                        setActiveTheme(
                          activeTheme === th.value ? null : th.value,
                        )
                      }
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* Grid / states */}
          <div className="mt-8">
            {isFetching && items.length === 0 ? (
              <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 [--carousel-card-w:100%]">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SilkSkeleton key={i} />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="relative flex flex-col items-start gap-3 p-8">
                <ChamferedFrame />
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
                className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-4"
                variants={staggerParent}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
              >
                {items.map((it) => (
                  <motion.li
                    key={it.id}
                    variants={staggerChild}
                    transition={springs.gentle}
                    className="w-full"
                  >
                    <WriterGridCard item={it} />
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

/**
 * Featured Voice — a full-width editorial band spotlighting one writer: a large
 * silk-hex portrait beside their pull-quote set in serif. Prefers the SSR'd
 * `profile-full` (quote, based_in, follower/work counts); degrades to the thin
 * featured-list record when that call returned null.
 */
function FeaturedVoiceBand({
  writer,
  profile,
  label,
  followersLabel,
  worksLabel,
  basedInLabel,
  viewProfileLabel,
}: {
  writer: WriterProfile;
  profile: WriterProfileFull | null;
  label: string;
  followersLabel: string;
  worksLabel: string;
  basedInLabel: string;
  viewProfileLabel: string;
}) {
  const name = writerDisplayName(writer) || "Writer";
  const headlineRaw = profile?.headline?.trim() || writer.headline?.trim() || null;
  const headline = headlineRaw ? stripQuotes(headlineRaw) : null;
  const quoteRaw = profile?.quote?.trim() || writer.quote?.trim() || null;
  const quote = quoteRaw ? stripQuotes(quoteRaw) : null;
  const basedIn = profile?.based_in?.trim() || writer.location?.trim() || null;
  // Never surface raw zeros — a spotlight writer with no linked account
  // legitimately returns 0/0 from the backend. Show a stat only when positive.
  const followers = profile?.follower_count && profile.follower_count > 0
    ? profile.follower_count
    : null;
  const works = profile?.work_count && profile.work_count > 0
    ? profile.work_count
    : null;

  const href = `/writers/${encodeURIComponent(writer.id)}`;

  return (
    <RevealOnScroll className="mt-24">
      <section className="mx-auto max-w-6xl px-6 sm:px-10">
        <div
          className="flex items-center gap-3 border-b pb-4"
          style={{ borderColor: "var(--tott-card-border)" }}
        >
          <span
            aria-hidden
            className="inline-block shrink-0"
            style={{
              width: 11,
              height: 12,
              backgroundColor: theme.accentGold,
              clipPath:
                "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
            }}
          />
          <h2
            className="text-xs font-semibold uppercase tracking-[0.24em]"
            style={{ color: theme.accentGold, fontFamily: SANS }}
          >
            {label}
          </h2>
        </div>

        <div className="group mt-10 grid items-start gap-8 sm:gap-14 lg:grid-cols-[minmax(0,300px)_1fr]">
          {/* Large silk-hex portrait — the card carries its own link + name. */}
          <SpringCard className="mx-auto w-full max-w-[300px] [--carousel-card-w:300px]">
            <FeaturedHexCard
              title={name}
              author={headline ?? "TTT Writer"}
              coverImage={writerAvatar(writer)}
              href={href}
              strongOverlay
            />
          </SpringCard>

          <div className="min-w-0">
            {quote ? (
              <blockquote>
                <p
                  className="text-2xl leading-snug sm:text-[2rem] sm:leading-[1.28]"
                  style={{ fontFamily: SERIF, color: "var(--tott-home-text-strong)" }}
                >
                  <span aria-hidden style={{ color: theme.accentGold }}>
                    “
                  </span>
                  {quote}
                  <span aria-hidden style={{ color: theme.accentGold }}>
                    ”
                  </span>
                </p>
                <footer
                  className="mt-5 text-sm font-semibold uppercase tracking-[0.14em]"
                  style={{ color: "var(--tott-home-text-heading)", fontFamily: SANS }}
                >
                  <span aria-hidden style={{ color: theme.accentGold }}>
                    —{" "}
                  </span>
                  {name}
                </footer>
              </blockquote>
            ) : (
              <>
                <p
                  className="text-2xl font-medium leading-tight sm:text-3xl"
                  title={name}
                  style={{
                    fontFamily: SERIF,
                    color: "var(--tott-home-text-strong)",
                    overflowWrap: "anywhere",
                  }}
                >
                  {name}
                </p>
                {headline ? (
                  <p
                    className="mt-2 text-base"
                    style={{ color: "var(--tott-home-text-muted)", fontFamily: SANS }}
                  >
                    {headline}
                  </p>
                ) : null}
              </>
            )}

            {followers !== null || works !== null ? (
              <div className="mt-6 flex gap-10">
                {followers !== null ? (
                  <Stat value={followers} label={followersLabel} />
                ) : null}
                {works !== null ? <Stat value={works} label={worksLabel} /> : null}
              </div>
            ) : null}

            {basedIn ? (
              <p
                className="mt-5 text-xs uppercase tracking-[0.14em]"
                style={{ color: "var(--tott-home-text-muted)", fontFamily: SANS }}
              >
                {basedInLabel}{" "}
                <span style={{ color: "var(--tott-home-text-heading)" }}>{basedIn}</span>
              </p>
            ) : null}

            <Link
              href={href}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: theme.accentGold, fontFamily: SANS }}
            >
              {viewProfileLabel}
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
        </div>
      </section>
    </RevealOnScroll>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="text-xl font-medium tabular-nums"
        style={{ color: "var(--tott-home-text-strong)", fontFamily: SERIF }}
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

/** Chamfer used by the contributor cards + their skeleton. */
const CARD_CHAMFER =
  "polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px)";

type WriterCardItem = FeaturedHexItem & { themes: string[] };

/**
 * Editorial contributor card for the "All voices" index — a chamfered portrait
 * with the writer's name (serif), role, and up to two themes. Rectangular cards
 * tessellate cleanly in the grid, where the silk-hex reads sparse; the silk-hex
 * stays the signature in the hero spotlight and the featured rail.
 */
function WriterGridCard({ item }: { item: WriterCardItem }) {
  const [imgOk, setImgOk] = useState(true);
  const showPhoto = Boolean(item.coverImage) && imgOk;
  const initial = (item.title || "W").trim().slice(0, 1).toUpperCase() || "W";

  return (
    <Link href={item.href ?? "#"} className="group block focus-visible:outline-none">
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: "4 / 5",
          clipPath: CARD_CHAMFER,
          backgroundColor: "var(--tott-well-bg)",
        }}
      >
        {showPhoto ? (
          <Image
            src={item.coverImage as string}
            alt={item.title}
            fill
            unoptimized
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 33vw, 45vw"
            className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.06]"
            onError={() => setImgOk(false)}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background:
                "color-mix(in srgb, var(--tott-dash-gold-text) 20%, transparent)",
            }}
          >
            <span
              style={{
                fontFamily: SERIF,
                fontSize: 46,
                color: "var(--tott-home-text-strong)",
                opacity: 0.8,
              }}
            >
              {initial}
            </span>
          </div>
        )}

        {/* Gold hairline traces the chamfer on hover. */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            clipPath: CARD_CHAMFER,
            boxShadow: "inset 0 0 0 1.5px var(--tott-accent-gold)",
          }}
        />
      </div>

      <div className="mt-3.5">
        <p
          className="text-lg font-medium leading-snug text-[var(--tott-home-text-strong)] transition-colors group-hover:text-[var(--tott-accent-gold)]"
          style={{ fontFamily: SERIF }}
        >
          {item.title}
        </p>
        {item.author ? (
          <p
            className="mt-0.5 line-clamp-1 text-sm"
            style={{ color: "var(--tott-home-text-muted)", fontFamily: SANS }}
          >
            {item.author}
          </p>
        ) : null}
        {item.themes.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {item.themes.slice(0, 2).map((th) => (
              <span
                key={th}
                className="rounded-full border px-2.5 py-0.5 text-[11px] leading-tight"
                style={{
                  borderColor: "var(--tott-card-border)",
                  color: "var(--tott-home-text-heading)",
                  fontFamily: SANS,
                }}
              >
                {titleCaseTheme(th)}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}

/** Loading placeholder matching the chamfered contributor card. */
function SilkSkeleton() {
  return (
    <div className="w-full">
      <div
        className="animate-pulse"
        style={{
          aspectRatio: "4 / 5",
          backgroundColor: "var(--tott-well-bg)",
          clipPath: CARD_CHAMFER,
        }}
      />
      <div
        className="mt-3.5 h-4 w-2/3 animate-pulse rounded"
        style={{ backgroundColor: "var(--tott-well-bg)" }}
      />
    </div>
  );
}
