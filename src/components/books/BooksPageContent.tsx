"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { StarIcon, ChevronDownIcon } from "@/components/ui/icons";
import { FirstWordGold } from "@/components/home/magazine/FirstWordGold";

const BOOK_HEX = "/images/home/Book Cover.png";
const SHARE_HEX = "/images/home/Icon-5.svg";

const CHIP_CHAMFER =
  "polygon(6px 0, calc(100% - 6px) 0, 100% 6px, 100% calc(100% - 6px), calc(100% - 6px) 100%, 6px 100%, 0 calc(100% - 6px), 0 6px)";

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
          {/* Sidebar */}
          <aside
            className="rounded-2xl"
            style={{
              backgroundColor: "var(--tott-panel-bg)",
              border: "1px solid var(--tott-card-border)",
              padding: "20px",
              alignSelf: "start",
            }}
          >
            <div className="flex items-center justify-between">
              <h2
                className="text-base font-medium"
                style={{ color: "var(--tott-home-text-strong)" }}
              >
                {t("filtersHeading")}
              </h2>
              <span
                className="text-xs"
                style={{ color: "var(--tott-home-text-muted)" }}
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
      className="mt-6 text-sm font-medium"
      style={{ color: "var(--tott-home-text-strong)" }}
    >
      {children}
    </h3>
  );
}

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
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <span
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
        style={{
          border: `1px solid ${checked ? "var(--tott-accent-gold)" : "var(--tott-card-border)"}`,
          backgroundColor: "transparent",
        }}
      >
        {checked ? (
          <span
            aria-hidden
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: "var(--tott-accent-gold)" }}
          />
        ) : null}
      </span>
      <input
        type="radio"
        className="sr-only"
        checked={checked}
        onChange={onChange}
      />
      <span style={{ color: "var(--tott-home-text-strong)" }}>{label}</span>
    </label>
  );
}

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
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <span
        className="flex h-4 w-4 shrink-0 items-center justify-center rounded-sm"
        style={{
          border: `1px solid ${checked ? "var(--tott-accent-gold)" : "var(--tott-card-border)"}`,
          backgroundColor: checked ? "var(--tott-accent-gold)" : "transparent",
        }}
      >
        {checked ? (
          <svg
            width="10"
            height="10"
            viewBox="0 0 12 12"
            fill="none"
            stroke="var(--tott-auth-btn-text)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
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
      <span style={{ color: "var(--tott-home-text-strong)" }}>{label}</span>
    </label>
  );
}

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
      className="flex h-9 flex-1 items-center gap-1 rounded-md px-2 text-sm"
      style={{
        backgroundColor: "var(--tott-home-surface)",
        border: "1px solid var(--tott-card-border)",
      }}
    >
      <span
        aria-hidden
        style={{ color: "var(--tott-home-text-muted)", fontSize: "12px" }}
      >
        {placeholder}
      </span>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-sm outline-none focus:outline-none"
        style={{ color: "var(--tott-home-text-strong)" }}
      />
    </div>
  );
}

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
      className="relative mt-2 flex h-9 items-center rounded-md px-2 text-sm"
      style={{
        backgroundColor: "var(--tott-home-surface)",
        border: "1px solid var(--tott-card-border)",
      }}
    >
      <select
        value={String(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full appearance-none bg-transparent pr-6 text-sm outline-none"
        style={{ color: "var(--tott-home-text-strong)" }}
      >
        <option value="0">{labels.any}</option>
        <option value="1">{labels.r1}</option>
        <option value="2">{labels.r2}</option>
        <option value="3">{labels.r3}</option>
        <option value="4">{labels.r4}</option>
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute right-2 [&>svg]:h-4 [&>svg]:w-4"
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
      className="flex flex-col items-stretch rounded-2xl"
      style={{
        backgroundColor: "var(--tott-panel-bg)",
        border: "1px solid var(--tott-card-border)",
        padding: "16px",
      }}
    >
      {/* Hex cover */}
      <div
        className="relative mx-auto w-full"
        style={{ maxWidth: "192px", aspectRatio: "193 / 288" }}
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

      {/* Body */}
      <div className="mt-3 flex flex-col items-center gap-2 text-center">
        <p
          className="line-clamp-1 text-sm font-medium"
          style={{ color: "var(--tott-home-text-strong)" }}
        >
          {book.title}
        </p>
        <span className="flex items-center gap-1.5 text-xs">
          <span
            className="flex h-4 w-4 items-center justify-center rounded-full"
            style={{
              backgroundColor: "var(--tott-dash-gold-text)",
              border: "1px solid var(--tott-card-border)",
              fontSize: "8.5px",
              fontWeight: 500,
              color: "var(--tott-auth-btn-text)",
            }}
          >
            {book.author.charAt(0).toUpperCase() || "A"}
          </span>
          <span style={{ color: "var(--tott-home-text-muted)" }}>{book.author}</span>
        </span>
        <span
          className="flex items-center gap-1 text-xs"
          style={{ color: "var(--tott-home-text-muted)" }}
        >
          <span
            aria-hidden
            className="[&>svg]:h-3.5 [&>svg]:w-3.5"
            style={{ color: "var(--tott-accent-gold)" }}
          >
            <StarIcon />
          </span>
          {book.rating.toFixed(1)} {labels.reviews(book.reviewCount)}
        </span>
      </div>

      {/* Bottom row */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <span
          style={{
            color:
              book.price === 0
                ? "var(--tott-accent-gold)"
                : "var(--tott-home-text-strong)",
            fontWeight: 500,
          }}
        >
          {book.price === 0 ? labels.free : `$${book.price.toFixed(2)}`}
        </span>
        <button
          type="button"
          className="inline-flex items-center justify-center"
          style={{
            minWidth: "72px",
            height: "28px",
            padding: "4px 12px",
            backgroundColor: "var(--tott-dark-pill)",
            color: "var(--tott-dark-pill-fg)",
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "12px",
            lineHeight: "16px",
            clipPath: CHIP_CHAMFER,
            WebkitClipPath: CHIP_CHAMFER,
          }}
        >
          {labels.view}
        </button>
      </div>
    </article>
  );
}

// ─── Share Your Story footer ─────────────────────────────────────

function ShareYourStory() {
  const t = useTranslations("Home");
  return (
    <section
      className="relative mt-16 flex flex-col items-center gap-3 rounded-2xl px-6 py-12 text-center"
      style={{
        backgroundColor: "var(--tott-panel-bg)",
        border: "1px solid var(--tott-card-border)",
      }}
    >
      <div
        aria-hidden
        className="relative"
        style={{ width: "64px", height: "70px" }}
      >
        <Image src={SHARE_HEX} alt="" fill sizes="64px" />
      </div>
      <h2
        className="text-xl font-medium tracking-tight sm:text-2xl"
        style={{ color: "var(--tott-home-text-strong)" }}
      >
        {t("shareTitle")}
      </h2>
      <p
        className="max-w-xl text-sm sm:text-base"
        style={{ color: "var(--tott-home-text-muted)" }}
      >
        {t("shareBody")}
      </p>
      <Link
        href="/contribute"
        className="mt-2 inline-flex items-center justify-center rounded-md px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
        style={{
          backgroundColor: "var(--tott-magazine-btn-bg)",
          color: "var(--tott-auth-btn-text)",
        }}
      >
        {t("shareCta")}
      </Link>
    </section>
  );
}
