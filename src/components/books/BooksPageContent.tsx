"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import { FirstWordGold } from "@/components/home/magazine/FirstWordGold";
import { BookCard } from "./listing/BookCard";
import { SidebarHeading, RadioRow, CheckboxRow, PriceInput, RatingSelect } from "./listing/BooksFilters";
import { BookDetailBanner } from "./detail/BookDetailBanner";

export type BookItem = {
  id: string;
  slug: string;
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
  "adventure", "philosophy", "selfHelp", "fantasy", "scienceFiction",
  "romance", "mystery", "biography", "history",
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

export function BooksPageContent({ items }: { items: BookItem[] }) {
  const t = useTranslations("Home.books");

  const [price, setPrice] = useState<PriceFilter>("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [minRating, setMinRating] = useState<number>(0);
  const [genres, setGenres] = useState<Set<GenreKey>>(new Set());
  const [languages, setLanguages] = useState<Set<LanguageKey>>(new Set());

  const toggleGenre = (g: GenreKey) =>
    setGenres((s) => { const next = new Set(s); if (next.has(g)) next.delete(g); else next.add(g); return next; });
  const toggleLanguage = (l: LanguageKey) =>
    setLanguages((s) => { const next = new Set(s); if (next.has(l)) next.delete(l); else next.add(l); return next; });

  const filtered = useMemo(() => {
    const minN = priceMin.trim() ? Number(priceMin) : null;
    const maxN = priceMax.trim() ? Number(priceMax) : null;
    const allowedLangTags = new Set(Array.from(languages, (l) => LANGUAGE_TAG[l]));
    return items.filter((b) => {
      if (price === "free" && b.price !== 0) return false;
      if (price === "paid" && b.price === 0) return false;
      if (minN !== null && Number.isFinite(minN) && b.price < minN) return false;
      if (maxN !== null && Number.isFinite(maxN) && b.price > maxN) return false;
      if (minRating > 0 && b.rating < minRating) return false;
      if (allowedLangTags.size > 0 && (!b.language || !allowedLangTags.has(b.language))) return false;
      if (genres.size > 0 && b.category) {
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
    <main className="relative min-h-screen w-full overflow-x-hidden" style={{ backgroundColor: "var(--tott-home-surface)" }}>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-35 overflow-hidden" style={{ opacity: "var(--tott-dash-hex-opacity, 1)" }}>
        <HexBackground />
      </div>

      <div className="relative mx-auto w-full max-w-[1392px] px-4 pb-16 pt-24 sm:px-6 sm:pt-28 md:px-8 md:pt-32">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl" style={{ color: "var(--tott-home-text-strong)" }}>
              <FirstWordGold raw={t("heading")} />
            </h1>
            <p className="mt-2 max-w-xl text-sm sm:text-base" style={{ color: "var(--tott-home-text-muted)" }}>
              {t("subtitle")}
            </p>
          </div>
          <Link
            href="/contribute"
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--tott-magazine-btn-bg)", color: "var(--tott-auth-btn-text)" }}
          >
            <span aria-hidden>+</span>
            {t("contributeCta")}
          </Link>
        </header>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="relative self-start" style={{ padding: "24px" }}>
            <ChamferedFrame size={24} borderColor="var(--tott-card-border)" />
            <div className="flex items-center justify-between">
              <h2 style={{ fontFamily: "'Inter', var(--font-sans, sans-serif)", fontWeight: 500, fontSize: "16px", lineHeight: "24px", letterSpacing: "-0.01em", color: "var(--tott-home-text-strong)" }}>
                {t("filtersHeading")}
              </h2>
              <span style={{ fontFamily: "'Inter', var(--font-sans, sans-serif)", fontWeight: 400, fontSize: "14px", lineHeight: "20px", letterSpacing: "-0.005em", color: "var(--tott-home-text-muted)" }}>
                {t("resultsCount", { count: filtered.length })}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {(["all", "free", "paid"] as const).map((id) => (
                <RadioRow
                  key={id}
                  label={id === "all" ? t("filterAll") : id === "free" ? t("filterFree") : t("filterPaid")}
                  checked={price === id}
                  onChange={() => setPrice(id)}
                />
              ))}
            </div>

            <SidebarHeading>{t("priceRange")}</SidebarHeading>
            <div className="mt-2 flex items-center gap-2">
              <PriceInput placeholder={t("priceMin")} value={priceMin} onChange={setPriceMin} />
              <PriceInput placeholder={t("priceMax")} value={priceMax} onChange={setPriceMax} />
            </div>

            <SidebarHeading>{t("minimumRating")}</SidebarHeading>
            <RatingSelect value={minRating} onChange={setMinRating} labels={{ any: t("ratingAny"), r1: t("rating1"), r2: t("rating2"), r3: t("rating3"), r4: t("rating4") }} />

            <SidebarHeading>{t("genresHeading")}</SidebarHeading>
            <div className="mt-2 flex flex-col gap-2">
              {GENRES.map((g) => (
                <CheckboxRow key={g} label={t(`genre.${g}`)} checked={genres.has(g)} onChange={() => toggleGenre(g)} />
              ))}
            </div>

            <SidebarHeading>{t("languagesHeading")}</SidebarHeading>
            <div className="mt-2 flex flex-col gap-2">
              {LANGUAGES.map((l) => (
                <CheckboxRow key={l} label={t(`language.${l}`)} checked={languages.has(l)} onChange={() => toggleLanguage(l)} />
              ))}
            </div>
          </aside>

          <section>
            {filtered.length === 0 ? (
              <p className="rounded-2xl border p-8 text-center text-sm" style={{ borderColor: "var(--tott-card-border)", backgroundColor: "var(--tott-panel-bg)", color: "var(--tott-home-text-muted)" }}>
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

        <BookDetailBanner />
      </div>
    </main>
  );
}
