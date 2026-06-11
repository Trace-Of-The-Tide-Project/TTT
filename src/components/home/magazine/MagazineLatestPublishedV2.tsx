"use client";

import { Link } from "@/i18n/navigation";
import { BookCover } from "./BookCover";

const FALLBACK_IMAGE = "/images/image.png";

export type LatestPublishedItem = {
  id: string;
  category: string;
  title: string;
  author: string;
  readingTime: number;
  coverImage?: string | null;
  publishedAt?: string | null;
  /** Article slug used to build the `/books/{slug}` deep link. */
  slug?: string | null;
  href?: string | null;
};

export type MagazineLatestPublishedProps = {
  items: LatestPublishedItem[];
};

const FALLBACK_TITLE = "The Architecture of Silence";
const FALLBACK_DATE = "2026-03-01T00:00:00.000Z";

const FALLBACK_ITEMS: LatestPublishedItem[] = [
  { id: "pf-art",          category: "Art",          title: FALLBACK_TITLE, author: "", readingTime: 0, coverImage: null, publishedAt: FALLBACK_DATE },
  { id: "pf-architecture", category: "Architecture", title: FALLBACK_TITLE, author: "", readingTime: 0, coverImage: null, publishedAt: FALLBACK_DATE },
  { id: "pf-film",         category: "Film",         title: FALLBACK_TITLE, author: "", readingTime: 0, coverImage: null, publishedAt: FALLBACK_DATE },
  { id: "pf-society",      category: "Society",      title: FALLBACK_TITLE, author: "", readingTime: 0, coverImage: null, publishedAt: FALLBACK_DATE },
];

function isValidImageUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function formatMonthYear(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/**
 * "Publications" tab body — Figma "Books list".
 *
 *   Container: 841×400, flex-wrap row, gap 48px (row) × 24px (col).
 *   Book Card: 192×400
 *     ├── Book Cover (192×288) — elongated rounded-vertex hex w/ image
 *     └── Body (192×112)
 *           ├── Category   (Inter 400 12/16, #D6D6D6, text-shadow)
 *           ├── Title      (Inter 500 16/24, -0.01em, #FFFFFF, max 2 lines)
 *           └── Date       (Inter 400 12/16, #A3A3A3)
 */
export function MagazineLatestPublishedV2({
  items,
}: MagazineLatestPublishedProps) {
  const visible = [...items, ...FALLBACK_ITEMS].slice(0, 4);

  return (
    <div
      className="mx-auto flex w-full flex-wrap items-start justify-center"
      style={{ maxWidth: 840, columnGap: 24, rowGap: 48 }}
    >
      {visible.map((item) => (
        <BookCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function BookCard({ item }: { item: LatestPublishedItem }) {
  const date = formatMonthYear(item.publishedAt);
  const imgSrc = isValidImageUrl(item.coverImage) ? item.coverImage : FALLBACK_IMAGE;
  // These items come from /knowledge/books (see magazine/page.tsx
  // fetchLatestBooks), so link to the book detail page — sending a book
  // id to the /content/article reader renders its not-found state.
  const href = item.id ? `/books/${encodeURIComponent(item.id)}` : "/books";

  return (
    <Link
      href={href}
      className="flex w-full max-w-[192px] flex-col items-start transition-opacity hover:opacity-90"
    >
      <BookCover src={imgSrc} alt={item.title || item.category} />

      <div
        className="flex w-full flex-col items-center"
        style={{ padding: "16px 16px 0", gap: 16 }}
      >
        <div
          className="flex w-full flex-col items-center text-center"
          style={{ gap: 8 }}
        >
          {item.category ? (
            <p
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: 12,
                lineHeight: "16px",
                color: "var(--tott-home-text-heading)",
                textShadow: "var(--tott-home-text-shadow)",
                margin: 0,
              }}
            >
              {item.category}
            </p>
          ) : null}

          {item.title ? (
            <h3
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: 16,
                lineHeight: "24px",
                letterSpacing: "-0.01em",
                color: "var(--tott-home-text-strong)",
                margin: 0,
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
                overflow: "hidden",
              }}
            >
              {item.title}
            </h3>
          ) : null}

          {date ? (
            <p
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: 12,
                lineHeight: "16px",
                color: "var(--tott-home-text-muted)",
                margin: 0,
              }}
            >
              {date}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
