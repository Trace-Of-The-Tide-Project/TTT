"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { StarIcon } from "@/components/ui/icons";
import { BookHexCover } from "@/components/books/BookHexCover";
import type { BookItem } from "../BooksPageContent";

const VIEW_ICON = "/images/books/leading-icon.svg";

export function BookCard({
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
    <article className="flex w-full flex-col items-stretch" style={{ maxWidth: "192px", margin: "0 auto" }}>
      <BookHexCover src={book.coverImage} alt={book.title} />
      <div className="flex w-full flex-col items-center" style={{ padding: "16px 16px 0", gap: "16px" }}>
        <div className="flex w-full flex-col items-center" style={{ gap: "8px" }}>
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
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {book.title}
          </p>
          <span className="flex items-center" style={{ gap: "4px" }}>
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
            <span style={{ fontFamily: "'Inter', var(--font-sans, sans-serif)", fontWeight: 400, fontSize: "12px", lineHeight: "16px", color: "var(--tott-home-text-muted)", textShadow: "0px 1px 2px rgba(0, 0, 0, 0.24)" }}>
              {book.author}
            </span>
          </span>
          <span className="flex items-center" style={{ gap: "4px" }}>
            <span aria-hidden className="[&>svg]:h-4 [&>svg]:w-4" style={{ color: "var(--tott-dash-gold-label)" }}>
              <StarIcon />
            </span>
            <span style={{ fontFamily: "'Inter', var(--font-sans, sans-serif)", fontWeight: 500, fontSize: "12px", lineHeight: "16px", color: "var(--tott-home-text-strong)" }}>
              {book.rating.toFixed(1)}
            </span>
            <span style={{ fontFamily: "'Inter', var(--font-sans, sans-serif)", fontWeight: 400, fontSize: "12px", lineHeight: "16px", color: "var(--tott-home-text-muted)" }}>
              {labels.reviews(book.reviewCount)}
            </span>
          </span>
        </div>
        <div className="flex w-full items-center" style={{ gap: "16px", height: "32px" }}>
          <span
            className="flex-1"
            style={{ fontFamily: "'Inter', var(--font-sans, sans-serif)", fontWeight: 500, fontSize: "16px", lineHeight: "24px", letterSpacing: "-0.01em", color: "var(--tott-dash-gold-label)" }}
          >
            {book.price === 0 ? labels.free : `$${book.price.toFixed(2)}`}
          </span>
          <Link
            href={`/books/${book.slug}`}
            className="inline-flex shrink-0 items-center justify-center transition-opacity hover:opacity-90"
            style={{ height: "32px", padding: "4px", gap: "0", backgroundColor: "var(--tott-card-border)", boxShadow: "inset 0px 1px 1px rgba(255, 255, 255, 0.08)", borderRadius: "6px", border: "none", color: "var(--tott-home-text-strong)" }}
          >
            <span aria-hidden className="relative flex h-6 shrink-0" style={{ width: "28px" }}>
              <Image src={VIEW_ICON} alt="" fill sizes="28px" className="select-none" draggable={false} />
            </span>
            <span className="flex items-center justify-center" style={{ padding: "2px 4px", fontFamily: "'Inter', var(--font-sans, sans-serif)", fontWeight: 400, fontSize: "14px", lineHeight: "20px", letterSpacing: "-0.005em" }}>
              {labels.view}
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
