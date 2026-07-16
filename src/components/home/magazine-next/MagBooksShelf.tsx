import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SectionShell } from "@/components/home/SectionShell";
import { MagCarousel } from "./MagCarousel";
import { MagImage } from "./MagImage";
import type { BookCard } from "./data";
import { coverSrc } from "./ui";

/**
 * Horizontal cover-shelf of books. The shelf baseline rule under the row
 * of covers gives a "books on a shelf" read, visually distinct from the
 * issues rail and article cards. Cover-dominant with an author subline.
 */
export async function MagBooksShelf({ books }: { books: BookCard[] }) {
  if (books.length === 0) return null;
  const t = await getTranslations("MagazineNext.books");

  return (
    <SectionShell
      id="magazine-books"
      eyebrow={t("eyebrow")}
      title={t("title")}
      standfirst={t("standfirst")}
      fullBleed
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <MagCarousel prevLabel={t("prev")} nextLabel={t("next")}>
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/books/${encodeURIComponent(book.id)}`}
              className="group flex w-40 shrink-0 flex-col sm:w-44"
            >
              {/* Cover sits on a shelf: drop shadow + a hairline baseline
                  rule rendered under the whole row via the wrapper below. */}
              <div
                className="relative w-full overflow-hidden shadow-[0_10px_20px_-12px_color-mix(in_srgb,var(--tott-well-bg)_70%,transparent)] transition-transform duration-500 group-hover:-translate-y-1"
                style={{ aspectRatio: "2 / 3", backgroundColor: "var(--tott-card-border)" }}
              >
                <MagImage
                  src={coverSrc(book.coverImage)}
                  alt={book.title}
                  fill
                  sizes="176px"
                  className="object-cover"
                />
                {/* Spine shading down the reading-start edge. */}
                <span
                  aria-hidden
                  className="absolute inset-y-0 start-0 w-1.5"
                  style={{
                    background: "color-mix(in srgb, var(--tott-well-bg) 32%, transparent)",
                  }}
                />
              </div>
              <h3 className="mt-3 line-clamp-2 text-sm font-medium leading-snug text-[var(--tott-home-text-strong)] group-hover:text-[var(--tott-gold-bright)]">
                {book.title}
              </h3>
              {book.author ? (
                <p className="mt-1 line-clamp-1 text-xs text-[var(--tott-home-text-muted)]">
                  {t("byAuthor", { author: book.author })}
                </p>
              ) : null}
            </Link>
          ))}
        </MagCarousel>
        {/* Shelf baseline. */}
        <div className="mt-1 h-px bg-gradient-to-r from-transparent via-[var(--tott-card-border)] to-transparent" />
      </div>
    </SectionShell>
  );
}
