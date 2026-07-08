"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const maxThemeCount = allThemes[0]?.count ?? 1;

  const items = useMemo(() => {
    const filtered = activeTheme
      ? writers.filter((w) => writerThemes(w).includes(activeTheme))
      : writers;
    return filtered.map(toHexItem);
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
            <motion.span
              variants={staggerChild}
              transition={springs.gentle}
              className="inline-block text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: theme.accentGold }}
            >
              {t("show.heroKicker")}
            </motion.span>

            <div className="mt-4 grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
              <div className="max-w-xl">
                <motion.h1
                  variants={staggerChild}
                  transition={springs.gentle}
                  className="text-4xl font-medium leading-[1.1] tracking-tight sm:text-5xl"
                  style={{
                    fontFamily:
                      "'IBM Plex Sans', var(--font-sans, sans-serif)",
                  }}
                >
                  <FirstWordGold raw={t("show.title")} />
                </motion.h1>
                <motion.p
                  variants={staggerChild}
                  transition={springs.gentle}
                  className="mt-5 text-base leading-relaxed"
                  style={{ color: "var(--tott-home-text-muted)" }}
                >
                  {t("show.subtitle")}
                </motion.p>
                {writers.length > 0 ? (
                  <motion.p
                    variants={staggerChild}
                    transition={springs.gentle}
                    className="mt-6 text-sm"
                    style={{ color: "var(--tott-home-text-heading)" }}
                  >
                    {t("show.voiceCount", { count: writers.length })}
                  </motion.p>
                ) : null}
              </div>

              {spotlightWriter ? (
                <SpotlightHero
                  writer={spotlightWriter}
                  profile={spotlightProfile}
                  label={t("show.spotlightLabel")}
                  followersLabel={t("show.followersLabel")}
                  worksLabel={t("show.worksLabel")}
                  basedInLabel={t("show.basedIn")}
                  viewProfileLabel={t("show.viewProfile")}
                />
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
                        className="text-3xl font-semibold tabular-nums sm:text-4xl"
                        style={{ color: theme.accentGold }}
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
          {/* Theme galaxy — weighted, clickable data-viz of the roster's themes */}
          {allThemes.length > 0 ? (
            <div className="mb-16">
              <h2
                className="text-2xl font-medium sm:text-3xl"
                style={{
                  fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                }}
              >
                <FirstWordGold raw={t("show.themeGalaxyHeading")} />
              </h2>
              <StaggerGalaxy
                themes={allThemes}
                maxCount={maxThemeCount}
                activeTheme={activeTheme}
                onToggle={(v) =>
                  setActiveTheme((cur) => (cur === v ? null : v))
                }
              />
            </div>
          ) : null}

          <h2
            className="text-2xl font-medium sm:text-3xl"
            style={{ fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)" }}
          >
            <FirstWordGold raw={t("show.allHeading")} />
          </h2>

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
                className="relative flex w-full items-center gap-2 px-4 py-2.5 sm:w-80"
                style={{ backgroundColor: "var(--tott-well-bg)" }}
              >
                <ChamferedFrame size={10} />
                <span style={{ color: "var(--tott-home-text-muted)" }}>
                  <SearchIcon />
                </span>
                <input
                  type="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t("show.searchPlaceholder")}
                  aria-label={t("show.searchPlaceholder")}
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
              <div className="grid justify-items-center gap-6 [--carousel-card-w:240px] [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
                {Array.from({ length: 6 }).map((_, i) => (
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
                className="grid justify-items-center gap-6 [--carousel-card-w:240px] [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]"
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
                    <SpringCard className="w-full">
                      <FeaturedHexCard
                        title={it.title}
                        author={it.author}
                        coverImage={it.coverImage}
                        href={it.href}
                        strongOverlay
                      />
                    </SpringCard>
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
 * Weighted "theme galaxy" — each theme rendered as a pill whose text size and
 * emphasis scale with how many writers carry it. Clicking a pill toggles it as
 * the active grid filter (shares state with the toolbar pills below).
 */
function StaggerGalaxy({
  themes,
  maxCount,
  activeTheme,
  onToggle,
}: {
  themes: { value: string; count: number }[];
  maxCount: number;
  activeTheme: string | null;
  onToggle: (value: string) => void;
}) {
  return (
    <motion.div
      className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-2"
      variants={staggerParent}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
    >
      {themes.map((th) => {
        const active = activeTheme === th.value;
        // Map frequency → font size (13px…30px) so heavier themes read larger.
        const weight = maxCount > 1 ? th.count / maxCount : 1;
        const fontSize = 13 + Math.round(weight * 17);
        return (
          <motion.button
            key={th.value}
            type="button"
            variants={staggerChild}
            transition={springs.gentle}
            onClick={() => onToggle(th.value)}
            aria-pressed={active}
            whileHover={{ y: -2 }}
            className="inline-flex items-center leading-tight transition-colors"
            style={{
              fontSize,
              fontWeight: active ? 700 : 500,
              color: active
                ? theme.accentGold
                : "var(--tott-home-text-heading)",
              opacity: active ? 1 : 0.55 + weight * 0.45,
            }}
          >
            {titleCaseTheme(th.value)}
          </motion.button>
        );
      })}
    </motion.div>
  );
}

/**
 * Editorial hero portrait — one featured writer rendered rich beside a large
 * silk-hex portrait. Prefers the SSR'd `profile-full` (quote, based_in,
 * follower/work counts); degrades to the thin featured-list record when that
 * call returned null.
 */
function SpotlightHero({
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
    <div className="group grid grid-cols-[auto_1fr] items-center gap-5">
      {/* Large silk-hex portrait — the card carries its own link. */}
      <SpringCard className="shrink-0 [--carousel-card-w:200px] sm:[--carousel-card-w:220px]">
        <FeaturedHexCard
          title={name}
          author={headline ?? "TTT Writer"}
          coverImage={writerAvatar(writer)}
          chipLabel={label}
          href={href}
          strongOverlay
        />
      </SpringCard>

      <div className="min-w-0">
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: theme.accentGold }}
        >
          {label}
        </span>
        <p
          className="mt-1 line-clamp-2 text-xl font-medium"
          title={name}
          style={{ color: "var(--tott-home-text-strong)", overflowWrap: "anywhere" }}
        >
          {name}
        </p>
        {headline ? (
          <p
            className="mt-1 line-clamp-2 text-sm"
            style={{ color: "var(--tott-home-text-muted)" }}
          >
            {headline}
          </p>
        ) : null}

        {quote ? (
          <p
            className="mt-4 line-clamp-3 border-s-2 ps-3 text-sm italic"
            style={{
              borderColor: theme.accentGold,
              color: "var(--tott-home-text-heading)",
            }}
          >
            “{quote}”
          </p>
        ) : null}

        {followers !== null || works !== null ? (
          <div className="mt-4 flex gap-6">
            {followers !== null ? (
              <Stat value={followers} label={followersLabel} />
            ) : null}
            {works !== null ? <Stat value={works} label={worksLabel} /> : null}
          </div>
        ) : null}

        {basedIn ? (
          <p
            className="mt-3 text-xs"
            style={{ color: "var(--tott-home-text-muted)" }}
          >
            {basedInLabel}{" "}
            <span style={{ color: "var(--tott-home-text-heading)" }}>{basedIn}</span>
          </p>
        ) : null}

        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold"
          style={{ color: theme.accentGold }}
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
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span
        className="text-lg font-semibold tabular-nums"
        style={{ color: "var(--tott-home-text-strong)" }}
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

/** Loading placeholder matching the silk-hex card silhouette. */
function SilkSkeleton() {
  return (
    <div
      className="w-full animate-pulse"
      style={{
        maxWidth: "var(--carousel-card-w, 240px)",
        aspectRatio: "276 / 294",
        backgroundColor: "var(--tott-well-bg)",
        clipPath:
          "polygon(50% 5%, 89.6% 30%, 89.6% 70%, 50% 95%, 10.4% 70%, 10.4% 30%)",
      }}
    />
  );
}
