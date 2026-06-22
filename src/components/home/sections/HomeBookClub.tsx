import Image from "next/image";
import { theme } from "@/lib/theme";
import type { HomeBookClubItem } from "@/lib/home/fetch-home-data";
import { HomeSectionShell } from "./HomeSectionShell";

/**
 * Book Club current selections. Cover + blurb. Hidden when empty (no
 * active selections, or no live magazine to scope them to).
 */
export function HomeBookClub({
  items,
  heading,
  subheading,
  dir,
}: {
  items: HomeBookClubItem[];
  heading: string;
  subheading?: string;
  dir?: "rtl" | "ltr";
}) {
  if (items.length === 0) return null;

  return (
    <HomeSectionShell
      anchorId="home-book-club"
      heading={heading}
      subheading={subheading}
      dir={dir}
    >
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 3).map((book) => (
          <li
            key={book.id}
            className="flex gap-4 rounded-2xl border p-4"
            style={{ borderColor: theme.cardBorder, backgroundColor: theme.panelBackground }}
          >
            <div
              className="relative h-28 w-20 shrink-0 overflow-hidden rounded-md border"
              style={{ borderColor: theme.cardBorder }}
            >
              {book.image ? (
                <Image
                  src={book.image}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="80px"
                  loading="lazy"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0" style={{ backgroundColor: "var(--tott-well-bg)" }} />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="line-clamp-2 text-base font-medium text-foreground">
                {book.title}
              </h3>
              {book.authorName ? (
                <p className="mt-0.5 text-sm text-[var(--tott-muted)]">
                  {book.authorName}
                  {book.year ? ` · ${book.year}` : ""}
                </p>
              ) : null}
              {book.blurb ? (
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--tott-muted)]">
                  {book.blurb}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </HomeSectionShell>
  );
}
