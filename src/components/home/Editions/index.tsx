import { getLocale, getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { serverGet } from "@/lib/api/isomorphic-fetch";
import { getBooks, type Book } from "@/services/books.service";
import {
  getFeaturedWriters,
  writerDisplayName,
} from "@/services/writers.service";
import {
  isUsableArticleMediaRef,
  resolveArticleMediaSrc,
} from "@/lib/content/article-media-url";
import { dirFor } from "@/i18n/dir";
import { StaggerContainer } from "@/components/motion/StaggerContainer";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { Parallax } from "@/components/motion/Parallax";
import { SectionShell } from "../SectionShell";
import { TestimonyCycler, type Testimony } from "./TestimonyCycler";

/**
 * "Editions & Testimonies" — the amber room. A full-bleed band on its own
 * elevation: multilingual book editions rendered as physical covers (top
 * half) and a slow-cycling writer pull-quote (bottom half).
 *
 * Data notes (Session 5 investigation):
 * - Editions = books. GET /knowledge/books has NO status column — every row
 *   is public; do not pass status=published (silently dropped).
 * - dedupe=group returns one row per translation group WITHOUT its siblings,
 *   so language badges come from GET /knowledge/books/:id/translations
 *   (public) per shown cover — at most 5 parallel calls.
 * - There is no testimony content_type; quotes are WriterProfile.quote
 *   (purpose-built pull-quote field on /writers/featured — user-approved).
 * Either half hides itself when its data is empty; both empty → no section.
 */

type EditionCard = {
  id: string;
  title: string;
  author: string | null;
  genre: string | null;
  /** ISO code of THIS row's language — content dir can differ from UI dir. */
  language: string;
  cover: string;
  /** Language codes of the whole translation group, en→ar→es→fr order. */
  languages: string[];
};

const LANG_ORDER = ["en", "ar", "es", "fr"];

/** Per-cover parallax drift (px) — varied so the shelf reads with depth. */
const PARALLAX_DISTANCES = [18, 34, 24, 40, 28];

type TranslationsEnvelope = {
  data?: { versions?: { language?: string | null }[] };
};

/** Badge codes for one book's translation group; falls back to the row's own
 * language when the endpoint fails (backend down, orphan row). */
async function fetchGroupLanguages(book: Book): Promise<string[]> {
  const raw = await serverGet<TranslationsEnvelope>(
    `/knowledge/books/${encodeURIComponent(book.id)}/translations`,
  );
  const langs = new Set<string>();
  for (const v of raw?.data?.versions ?? []) {
    if (v?.language) langs.add(v.language);
  }
  if (langs.size === 0 && book.language) langs.add(book.language);
  return [
    ...LANG_ORDER.filter((l) => langs.has(l)),
    ...[...langs].filter((l) => !LANG_ORDER.includes(l)).sort(),
  ];
}

/** Strip stray straight/curly quotes some source data ships with — the band
 * renders its own SVG quote motif. (Copied from WritersShowContent.) */
function stripQuotes(s: string): string {
  return s.replace(/^["“]+/, "").replace(/["”]+$/, "").trim();
}

export async function Editions() {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("HomeNext"),
  ]);

  const [books, writers] = await Promise.all([
    getBooks({ dedupe: "group", viewer_lang: locale, limit: 8 }),
    getFeaturedWriters(locale),
  ]);

  const withCovers = books
    .filter((b) => isUsableArticleMediaRef(b.cover_image))
    .slice(0, 5);
  const groupLanguages = await Promise.all(withCovers.map(fetchGroupLanguages));
  const editions: EditionCard[] = withCovers.map((b, i) => ({
    id: b.id,
    title: b.title,
    author: b.author?.trim() || null,
    genre: b.genre?.trim() || null,
    language: b.language ?? locale,
    cover: resolveArticleMediaSrc(b.cover_image as string),
    languages: groupLanguages[i],
  }));

  const testimonies: Testimony[] = writers
    .map((w) => {
      const language = w.language ?? locale;
      return {
        id: w.id,
        quote: stripQuotes(w.quote ?? ""),
        name: writerDisplayName(w),
        headline: w.headline?.trim() || null,
        language,
        dir: dirFor(language),
      };
    })
    .filter((q) => q.quote !== "" && q.name !== "")
    .slice(0, 5);

  // Both halves empty (backend down, drained DB) → no orphan header.
  if (editions.length === 0 && testimonies.length === 0) return null;

  const languagesLabel = t("editions.languagesLabel");

  return (
    <SectionShell
      id="editions"
      eyebrow={t("editions.eyebrow")}
      title={t("editions.title")}
      standfirst={t("editions.standfirst")}
      fullBleed
      className="relative overflow-hidden bg-[color-mix(in_srgb,var(--tott-status-amber)_5%,var(--tott-well-bg))]"
    >
      {/* Watermark: concentric tide rings, anchored to the section's inline
          end (logical offset — flips itself in RTL). 4% amber, decorative. */}
      <svg
        aria-hidden
        viewBox="0 0 400 400"
        fill="none"
        className="pointer-events-none absolute -top-24 -end-32 h-[26rem] w-[26rem] text-[var(--tott-status-amber)] opacity-[0.04] sm:h-[34rem] sm:w-[34rem]"
      >
        {[52, 96, 140, 184, 228, 272].map((r) => (
          <circle
            key={r}
            cx="200"
            cy="200"
            r={r}
            stroke="currentColor"
            strokeWidth="1.5"
          />
        ))}
      </svg>

      <div className="relative mx-auto max-w-6xl px-6 sm:px-10">
        {editions.length >= 3 ? (
          <StaggerContainer className="flex flex-wrap items-end justify-center gap-x-8 gap-y-12 sm:gap-x-12">
            {editions.map((edition, i) => (
              <StaggerItem key={edition.id}>
                <BookCard
                  edition={edition}
                  distance={PARALLAX_DISTANCES[i % PARALLAX_DISTANCES.length]}
                  languagesLabel={languagesLabel}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : editions.length > 0 ? (
          <FeaturedEdition
            edition={editions[0]}
            label={t("editions.featuredEdition")}
            languagesLabel={languagesLabel}
          />
        ) : null}

        {testimonies.length > 0 ? (
          <div
            className={
              editions.length > 0
                ? "mt-20 border-t border-[color-mix(in_srgb,var(--tott-salt)_15%,transparent)] pt-14 sm:mt-28 sm:pt-16"
                : undefined
            }
          >
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--tott-gold-muted)]">
              {t("editions.testimoniesLabel")}
            </span>
            <TestimonyCycler
              testimonies={testimonies}
              pauseLabel={t("editions.pause")}
              playLabel={t("editions.play")}
              dotLabels={testimonies.map((_, i) =>
                t("editions.goTo", { number: i + 1 }),
              )}
            />
          </div>
        ) : null}

        {books.length > 0 ? (
          <div className="mt-14 flex justify-end">
            <Link
              href="/books"
              className="tott-archive-viewall group inline-flex items-center gap-2 text-sm font-medium text-[var(--tott-gold-primary)] transition-colors hover:text-[var(--tott-gold-bright)] focus-visible:text-[var(--tott-gold-bright)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--tott-gold-bright)]"
            >
              {t("editions.viewAll")}
              <svg
                aria-hidden
                className="tott-archive-arrow"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M2 8h11M9 3.5 13.5 8 9 12.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}

/** Cover in a fixed 2:3 frame (zero CLS). The frame carries the physical-book
 * treatment (CSS tilt + spine + shadow in globals.css); Parallax drifts the
 * fill image inside the frame — its designed use as a clipping fill layer. */
function CoverFrame({
  edition,
  distance,
  sizes,
}: {
  edition: EditionCard;
  distance: number;
  sizes: string;
}) {
  return (
    <div className="tott-editions-cover relative aspect-[2/3] overflow-hidden rounded-sm bg-[var(--tott-elevated)]">
      <Parallax className="absolute inset-0" distance={distance}>
        <Image
          src={edition.cover}
          alt={edition.title}
          fill
          unoptimized
          sizes={sizes}
          className="object-cover"
        />
      </Parallax>
    </div>
  );
}

function LanguageBadges({
  languages,
  languagesLabel,
}: {
  languages: string[];
  languagesLabel: string;
}) {
  if (languages.length === 0) return null;
  return (
    <ul aria-label={languagesLabel} className="mt-2 flex flex-wrap gap-1.5">
      {languages.map((l) => (
        <li
          key={l}
          className="rounded-sm border border-[color-mix(in_srgb,var(--tott-salt)_40%,transparent)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--tott-salt)]"
        >
          {l}
        </li>
      ))}
    </ul>
  );
}

function BookCard({
  edition,
  distance,
  languagesLabel,
}: {
  edition: EditionCard;
  distance: number;
  languagesLabel: string;
}) {
  return (
    <Link
      href={`/books/${encodeURIComponent(edition.id)}`}
      className="tott-editions-book group block w-36 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--tott-gold-bright)] sm:w-44 lg:w-52"
    >
      <CoverFrame
        edition={edition}
        distance={distance}
        sizes="(min-width: 1024px) 13rem, (min-width: 640px) 11rem, 9rem"
      />
      <div
        className="mt-4 text-start"
        dir={dirFor(edition.language)}
        lang={edition.language}
      >
        <h3 className="truncate font-display text-sm text-[var(--tott-home-text-warm)]">
          {edition.title}
        </h3>
        {edition.author ? (
          <p className="mt-0.5 truncate text-xs text-[var(--tott-salt)]">
            {edition.author}
          </p>
        ) : null}
      </div>
      <LanguageBadges
        languages={edition.languages}
        languagesLabel={languagesLabel}
      />
    </Link>
  );
}

/** Fewer than 3 covers → one featured edition, never empty shelf slots. */
function FeaturedEdition({
  edition,
  label,
  languagesLabel,
}: {
  edition: EditionCard;
  label: string;
  languagesLabel: string;
}) {
  return (
    <StaggerContainer className="grid items-center gap-10 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
      <StaggerItem>
        <Link
          href={`/books/${encodeURIComponent(edition.id)}`}
          className="tott-editions-book group mx-auto block w-44 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--tott-gold-bright)] sm:mx-0 sm:w-full"
        >
          <CoverFrame
            edition={edition}
            distance={30}
            sizes="(min-width: 640px) 15rem, 11rem"
          />
        </Link>
      </StaggerItem>
      <StaggerItem>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--tott-gold-muted)]">
          {label}
        </span>
        <div
          className="mt-3 text-start"
          dir={dirFor(edition.language)}
          lang={edition.language}
        >
          <h3
            className="font-display text-2xl text-[var(--tott-home-text-warm)] sm:text-3xl"
            style={{
              lineHeight: "var(--tott-display-leading)",
              letterSpacing: "var(--tott-display-tracking)",
            }}
          >
            <Link
              href={`/books/${encodeURIComponent(edition.id)}`}
              className="hover:text-[var(--tott-gold-bright)] focus-visible:text-[var(--tott-gold-bright)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--tott-gold-bright)]"
            >
              {edition.title}
            </Link>
          </h3>
          {edition.author ? (
            <p className="mt-2 text-sm text-[var(--tott-salt)]">
              {edition.author}
              {edition.genre ? ` · ${edition.genre}` : null}
            </p>
          ) : edition.genre ? (
            <p className="mt-2 text-sm text-[var(--tott-salt)]">
              {edition.genre}
            </p>
          ) : null}
        </div>
        <LanguageBadges
          languages={edition.languages}
          languagesLabel={languagesLabel}
        />
      </StaggerItem>
    </StaggerContainer>
  );
}
