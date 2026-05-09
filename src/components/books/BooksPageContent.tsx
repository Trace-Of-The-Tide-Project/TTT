"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import { HexPatternBackdrop } from "@/components/home/magazine/HexPatternBackdrop";
import { StarIcon, ChevronDownIcon } from "@/components/ui/icons";
import { FirstWordGold } from "@/components/home/magazine/FirstWordGold";

// Custom Figma "Leading Icon" SVG used inside the View button on
// each book card.
const VIEW_ICON = "/images/books/leading-icon.svg";

const SHARE_HEX = "/images/home/Icon-5.svg";

// Pre-rendered silk hex card frame (193×288, hex shape + silk fill
// baked in). Same brand visual the Latest Published row uses.
const BOOK_HEX = "/images/home/Book Cover.png";

export type BookItem = {
  id: string;
  title: string;
  author: string;
  coverImage: string | null;
  category: string | null;
  language: string | null;
  price: number;
  rating: number;
  reviewCount: number;
};

type PriceFilter = "all" | "free" | "paid";

const GENRES = [
  "adventure",
  "philosophy",
  "selfHelp",
  "fantasy",
  "scienceFiction",
  "romance",
  "mystery",
  "biography",
  "history",
] as const;
type GenreKey = (typeof GENRES)[number];

const LANGUAGES = ["arabic", "english", "spanish", "french", "german"] as const;
type LanguageKey = (typeof LANGUAGES)[number];

const LANGUAGE_TAG: Record<LanguageKey, string> = {
  arabic: "ar",
  english: "en",
  spanish: "es",
  french: "fr",
  german: "de",
};

/**
 * "Discover amazing books" page — sidebar filters on the left, 4-column
 * book grid on the right, "Share your story" footer at the bottom.
 * Layout follows the supplied Books.png mockup.
 */
export function BooksPageContent({ items }: { items: BookItem[] }) {
  const t = useTranslations("Home.books");

  const [price, setPrice] = useState<PriceFilter>("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [minRating, setMinRating] = useState<number>(0);
  const [genres, setGenres] = useState<Set<GenreKey>>(new Set());
  const [languages, setLanguages] = useState<Set<LanguageKey>>(new Set());

  const toggleGenre = (g: GenreKey) =>
    setGenres((s) => {
      const next = new Set(s);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  const toggleLanguage = (l: LanguageKey) =>
    setLanguages((s) => {
      const next = new Set(s);
      if (next.has(l)) next.delete(l);
      else next.add(l);
      return next;
    });

  const filtered = useMemo(() => {
    const minN = priceMin.trim() ? Number(priceMin) : null;
    const maxN = priceMax.trim() ? Number(priceMax) : null;
    const allowedLangTags = new Set(
      Array.from(languages, (l) => LANGUAGE_TAG[l]),
    );
    return items.filter((b) => {
      if (price === "free" && b.price !== 0) return false;
      if (price === "paid" && b.price === 0) return false;
      if (minN !== null && Number.isFinite(minN) && b.price < minN) return false;
      if (maxN !== null && Number.isFinite(maxN) && b.price > maxN) return false;
      if (minRating > 0 && b.rating < minRating) return false;
      if (allowedLangTags.size > 0 && (!b.language || !allowedLangTags.has(b.language))) {
        return false;
      }
      // Genres aren't backed by the API — when any genre is selected,
      // we keep all items so the UI is responsive but doesn't filter
      // away every book. Replace once the API exposes genre/category
      // taxonomy that maps to these labels.
      if (genres.size > 0 && b.category) {
        // tolerant match by lowercased category prefix
        const cat = b.category.toLowerCase();
        const hit = Array.from(genres).some((g) =>
          cat.includes(g.replace(/[A-Z]/g, (c) => " " + c.toLowerCase()).trim()),
        );
        if (!hit) return false;
      }
      return true;
    });
  }, [items, price, priceMin, priceMax, minRating, genres, languages]);

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

      <div className="relative mx-auto w-full max-w-[1392px] px-4 pb-16 pt-24 sm:px-6 sm:pt-28 md:px-8 md:pt-32">
        {/* ── Header ─────────────────────────────────────────────── */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h1
              className="text-2xl font-semibold tracking-tight sm:text-3xl"
              style={{ color: "var(--tott-home-text-strong)" }}
            >
              <FirstWordGold raw={t("heading")} />
            </h1>
            <p
              className="mt-2 max-w-xl text-sm sm:text-base"
              style={{ color: "var(--tott-home-text-muted)" }}
            >
              {t("subtitle")}
            </p>
          </div>
          <Link
            href="/contribute"
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              backgroundColor: "var(--tott-magazine-btn-bg)",
              color: "var(--tott-auth-btn-text)",
            }}
          >
            <span aria-hidden>+</span>
            {t("contributeCta")}
          </Link>
        </header>

        {/* ── Body: sidebar + grid ──────────────────────────────── */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* Sidebar — Figma "Sidebar Container": ChamferedFrame
              (chamfered corner brackets + edge hairlines) around
              the filter content, no solid card bg, padding 24px,
              gap 16px between groups. Border color #333333 matches
              the Figma stroke spec. */}
          <aside
            className="relative self-start"
            style={{
              padding: "24px",
            }}
          >
            <ChamferedFrame size={24} borderColor="var(--tott-card-border)" />
            <div className="flex items-center justify-between">
              <h2
                style={{
                  fontFamily: "'Inter', var(--font-sans, sans-serif)",
                  fontWeight: 500,
                  fontSize: "16px",
                  lineHeight: "24px",
                  letterSpacing: "-0.01em",
                  color: "var(--tott-home-text-strong)",
                }}
              >
                {t("filtersHeading")}
              </h2>
              <span
                style={{
                  fontFamily: "'Inter', var(--font-sans, sans-serif)",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "20px",
                  letterSpacing: "-0.005em",
                  color: "var(--tott-home-text-muted)",
                }}
              >
                {t("resultsCount", { count: filtered.length })}
              </span>
            </div>

            {/* Price preset */}
            <div className="mt-4 flex flex-col gap-2">
              {(["all", "free", "paid"] as const).map((id) => (
                <RadioRow
                  key={id}
                  label={
                    id === "all"
                      ? t("filterAll")
                      : id === "free"
                        ? t("filterFree")
                        : t("filterPaid")
                  }
                  checked={price === id}
                  onChange={() => setPrice(id)}
                />
              ))}
            </div>

            {/* Price range */}
            <SidebarHeading>{t("priceRange")}</SidebarHeading>
            <div className="mt-2 flex items-center gap-2">
              <PriceInput
                placeholder={t("priceMin")}
                value={priceMin}
                onChange={setPriceMin}
              />
              <PriceInput
                placeholder={t("priceMax")}
                value={priceMax}
                onChange={setPriceMax}
              />
            </div>

            {/* Minimum rating */}
            <SidebarHeading>{t("minimumRating")}</SidebarHeading>
            <RatingSelect
              value={minRating}
              onChange={setMinRating}
              labels={{
                any: t("ratingAny"),
                r1: t("rating1"),
                r2: t("rating2"),
                r3: t("rating3"),
                r4: t("rating4"),
              }}
            />

            {/* Genres */}
            <SidebarHeading>{t("genresHeading")}</SidebarHeading>
            <div className="mt-2 flex flex-col gap-2">
              {GENRES.map((g) => (
                <CheckboxRow
                  key={g}
                  label={t(`genre.${g}`)}
                  checked={genres.has(g)}
                  onChange={() => toggleGenre(g)}
                />
              ))}
            </div>

            {/* Languages */}
            <SidebarHeading>{t("languagesHeading")}</SidebarHeading>
            <div className="mt-2 flex flex-col gap-2">
              {LANGUAGES.map((l) => (
                <CheckboxRow
                  key={l}
                  label={t(`language.${l}`)}
                  checked={languages.has(l)}
                  onChange={() => toggleLanguage(l)}
                />
              ))}
            </div>
          </aside>

          {/* Grid */}
          <section>
            {filtered.length === 0 ? (
              <p
                className="rounded-2xl border p-8 text-center text-sm"
                style={{
                  borderColor: "var(--tott-card-border)",
                  backgroundColor: "var(--tott-panel-bg)",
                  color: "var(--tott-home-text-muted)",
                }}
              >
                {t("noResults")}
              </p>
            ) : (
              <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {filtered.map((b) => (
                  <li key={b.id}>
                    <BookCard
                      book={b}
                      labels={{
                        author: t("author"),
                        free: t("free"),
                        view: t("view"),
                        reviews: (n: number) => t("reviews", { count: n }),
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* ── Share Your Story footer ───────────────────────────── */}
        <ShareYourStory />
      </div>
    </main>
  );
}

// ─── Sidebar primitives ──────────────────────────────────────────

function SidebarHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="mt-6"
      style={{
        fontFamily: "'Inter', var(--font-sans, sans-serif)",
        fontWeight: 500,
        fontSize: "14px",
        lineHeight: "20px",
        letterSpacing: "-0.005em",
        color: "var(--tott-home-text-strong)",
      }}
    >
      {children}
    </h3>
  );
}

const ROW_TEXT_STYLE = {
  fontFamily: "'Inter', var(--font-sans, sans-serif)",
  fontWeight: 400,
  fontSize: "14px",
  lineHeight: "20px",
  letterSpacing: "-0.005em",
  color: "var(--tott-home-text-strong)",
} as const;

/** Radio: 20×20 wrapper, 16×16 ring with 1.5px border. Selected gets
 * a gold ring + 6×6 gold dot in the center; unselected gets a grey
 * #333333 ring with no dot. Standard radio visuals — the Figma's
 * "square inside circle" export was a Figma autolayout artifact. */
function RadioRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center" style={{ gap: "8px" }}>
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
        aria-hidden
        style={{
          border: `1.5px solid ${checked ? "var(--tott-accent-gold)" : "var(--tott-card-border)"}`,
        }}
      >
        {checked ? (
          <span
            className="rounded-full"
            style={{
              width: "8px",
              height: "8px",
              backgroundColor: "var(--tott-accent-gold)",
            }}
          />
        ) : null}
      </span>
      <input
        type="radio"
        className="sr-only"
        checked={checked}
        onChange={onChange}
      />
      <span style={ROW_TEXT_STYLE}>{label}</span>
    </label>
  );
}

/** Checkbox: 20×20 wrapper, 16×16 box with 1.5px border + 4px
 * radius. Selected gets a gold fill with a dark check; unselected
 * gets a grey #333333 border, transparent fill. */
function CheckboxRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center" style={{ gap: "8px" }}>
      <span
        className="flex h-5 w-5 shrink-0 items-center justify-center"
        aria-hidden
        style={{
          border: `1.5px solid ${checked ? "var(--tott-accent-gold)" : "var(--tott-card-border)"}`,
          backgroundColor: checked ? "var(--tott-accent-gold)" : "transparent",
          borderRadius: "4px",
          // Drive the inner check via currentColor so SVG's `stroke`
          // attribute, which doesn't accept CSS vars, picks the
          // theme-aware foreground (`auth-btn-text` = dark brown
          // that reads on gold in both themes).
          color: "var(--tott-auth-btn-text)",
        }}
      >
        {checked ? (
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="2 6 5 9 10 3" />
          </svg>
        ) : null}
      </span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
      />
      <span style={ROW_TEXT_STYLE}>{label}</span>
    </label>
  );
}

/** Text input per Figma: #262626 bg, #333333 border, 8px radius,
 * 40px tall, 8px padding. */
function PriceInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div
      className="flex h-10 min-w-0 flex-1 items-center"
      style={{
        backgroundColor: "var(--tott-panel-bg)",
        border: "1px solid var(--tott-card-border)",
        borderRadius: "8px",
        padding: "8px",
        gap: "4px",
      }}
    >
      <span
        aria-hidden
        style={{ color: "var(--tott-home-text-muted)", fontSize: "14px" }}
      >
        {placeholder}
      </span>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent outline-none focus:outline-none focus:ring-0"
        style={{
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "20px",
          letterSpacing: "-0.005em",
          color: "var(--tott-home-text-strong)",
          minWidth: 0,
          border: "none",
          boxShadow: "none",
          padding: 0,
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "textfield",
        }}
      />
    </div>
  );
}

/** Select per Figma: full-width 40px tall, #262626 bg, #333333
 * border, 8px radius. Trailing chevron at the right edge. */
function RatingSelect({
  value,
  onChange,
  labels,
}: {
  value: number;
  onChange: (v: number) => void;
  labels: { any: string; r1: string; r2: string; r3: string; r4: string };
}) {
  return (
    <div
      className="relative mt-2 flex h-10 items-center"
      style={{
        backgroundColor: "var(--tott-panel-bg)",
        border: "1px solid var(--tott-card-border)",
        borderRadius: "8px",
        padding: "8px",
      }}
    >
      <select
        value={String(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-transparent pr-7 outline-none focus:outline-none focus:ring-0"
        style={{
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "20px",
          letterSpacing: "-0.005em",
          color: "var(--tott-home-text-strong)",
          border: "none",
          boxShadow: "none",
          padding: 0,
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
          backgroundImage: "none",
        }}
      >
        <option value="0">{labels.any}</option>
        <option value="1">{labels.r1}</option>
        <option value="2">{labels.r2}</option>
        <option value="3">{labels.r3}</option>
        <option value="4">{labels.r4}</option>
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute right-2 [&>svg]:h-5 [&>svg]:w-5"
        style={{ color: "var(--tott-home-text-muted)" }}
      >
        <ChevronDownIcon />
      </span>
    </div>
  );
}

// ─── Book card ───────────────────────────────────────────────────

function BookCard({
  book,
  labels,
}: {
  book: BookItem;
  labels: {
    author: string;
    free: string;
    view: string;
    reviews: (n: number) => string;
  };
}) {
  return (
    <article
      className="flex w-full flex-col items-stretch"
      style={{ maxWidth: "192px", margin: "0 auto" }}
    >
      {/* Cover — pre-rendered silk hex frame (Book Cover.png, hex
          shape baked in). When the article has a real cover image
          we layer it behind the silk so the cover fills the visible
          hex; otherwise the silk shows on its own. */}
      <div
        className="relative w-full"
        style={{ aspectRatio: "193 / 288" }}
      >
        {book.coverImage ? (
          <Image
            src={book.coverImage}
            alt=""
            fill
            className="absolute inset-0 object-cover opacity-70 mix-blend-luminosity"
            sizes="192px"
          />
        ) : null}
        <Image
          src={BOOK_HEX}
          alt=""
          fill
          className="object-contain"
          sizes="192px"
        />
      </div>

      {/* Body — 16px horizontal padding, gap 16, no outer card. */}
      <div
        className="flex w-full flex-col items-center"
        style={{ padding: "16px 16px 0", gap: "16px" }}
      >
        {/* Book Info — title + author + reviews, gap 8. */}
        <div
          className="flex w-full flex-col items-center"
          style={{ gap: "8px" }}
        >
          <p
            className="line-clamp-1 w-full text-center"
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "16px",
              lineHeight: "24px",
              letterSpacing: "-0.01em",
              color: "var(--tott-home-text-strong)",
              margin: 0,
            }}
          >
            {book.title}
          </p>

          {/* Author row */}
          <span
            className="flex items-center"
            style={{ gap: "4px" }}
          >
            <span
              aria-hidden
              className="flex shrink-0 items-center justify-center rounded-full"
              style={{
                width: "16px",
                height: "16px",
                backgroundColor: "var(--tott-dash-gold-text)",
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "8.5px",
                lineHeight: "10px",
                color: "var(--tott-auth-btn-text)",
              }}
            >
              {book.author.charAt(0).toUpperCase() || "A"}
            </span>
            <span
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "12px",
                lineHeight: "16px",
                color: "var(--tott-home-text-muted)",
                textShadow: "0px 1px 2px rgba(0, 0, 0, 0.24)",
              }}
            >
              {book.author}
            </span>
          </span>

          {/* Reviews row — star, rating, "(N reviews)" */}
          <span
            className="flex items-center"
            style={{ gap: "4px" }}
          >
            <span
              aria-hidden
              className="[&>svg]:h-4 [&>svg]:w-4"
              style={{ color: "var(--tott-dash-gold-label)" }}
            >
              <StarIcon />
            </span>
            <span
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "12px",
                lineHeight: "16px",
                color: "var(--tott-home-text-strong)",
              }}
            >
              {book.rating.toFixed(1)}
            </span>
            <span
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "12px",
                lineHeight: "16px",
                color: "var(--tott-home-text-muted)",
              }}
            >
              {labels.reviews(book.reviewCount)}
            </span>
          </span>
        </div>

        {/* Price & Action — gold "Free" / price on the left,
            #333333 View button on the right with book icon. */}
        <div
          className="flex w-full items-center"
          style={{ gap: "16px", height: "32px" }}
        >
          <span
            className="flex-1"
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "16px",
              lineHeight: "24px",
              letterSpacing: "-0.01em",
              color: "var(--tott-dash-gold-label)",
            }}
          >
            {book.price === 0 ? labels.free : `$${book.price.toFixed(2)}`}
          </span>
          <button
            type="button"
            className="inline-flex shrink-0 items-center justify-center"
            style={{
              height: "32px",
              padding: "4px",
              gap: "0",
              backgroundColor: "var(--tott-card-border)",
              boxShadow: "inset 0px 1px 1px rgba(255, 255, 255, 0.08)",
              borderRadius: "6px",
              border: "none",
              color: "var(--tott-home-text-strong)",
            }}
          >
            <span
              aria-hidden
              className="relative flex h-6 shrink-0"
              style={{ width: "28px" }}
            >
              <Image
                src={VIEW_ICON}
                alt=""
                fill
                sizes="28px"
                className="select-none"
                draggable={false}
              />
            </span>
            <span
              className="flex items-center justify-center"
              style={{
                padding: "2px 4px",
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "-0.005em",
              }}
            >
              {labels.view}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}

// ─── Share Your Story footer ─────────────────────────────────────

/**
 * Footer band — same visual treatment as the magazine
 * "Join our cultural circle" newsletter section: HexPatternBackdrop
 * behind, centered column with the pen-hex icon, gold-first-word
 * heading, body text, and gold CTA. Uses Home.share* translations
 * (the existing home-page copy).
 */
function ShareYourStory() {
  const t = useTranslations("Home");
  return (
    <section
      aria-labelledby="books-share-heading"
      className="relative mt-16 w-full overflow-hidden px-4 py-16 sm:px-12 sm:py-28 md:py-32"
      style={{ minHeight: "420px" }}
    >
      <HexPatternBackdrop />

      <div className="relative mx-auto flex w-full max-w-[560px] flex-col items-center text-center">
        <div
          aria-hidden
          className="relative"
          style={{ width: "80px", height: "88px" }}
        >
          <Image
            src={SHARE_HEX}
            alt=""
            fill
            sizes="80px"
            className="select-none"
            draggable={false}
          />
        </div>
        {/* Heading group — Figma "Heading" frame: gap 8 between title
            and body, both centered, fixed to the type-system specs. */}
        <div className="mt-6 flex w-full flex-col items-center" style={{ gap: "8px" }}>
          <h2
            id="books-share-heading"
            style={{
              width: "100%",
              fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "24px",
              lineHeight: "32px",
              color: "var(--tott-home-text-strong)",
              textAlign: "center",
              margin: 0,
            }}
          >
            {t("shareTitle")}
          </h2>
          <p
            style={{
              width: "100%",
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.005em",
              color: "var(--tott-home-text-muted)",
              textAlign: "center",
              margin: 0,
            }}
          >
            {t("shareBody")}
          </p>
        </div>
        <Link
          href="/contribute"
          className="mt-6 inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium transition-colors hover:opacity-90"
          style={{
            backgroundColor: "var(--tott-magazine-btn-bg)",
            color: "var(--tott-auth-btn-text)",
          }}
        >
          {t("shareCta")}
        </Link>
      </div>
    </section>
  );
}
