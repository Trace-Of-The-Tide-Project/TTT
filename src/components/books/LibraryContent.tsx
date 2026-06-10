"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLibrary } from "@/hooks/queries/commerce";
import { BookDownloadLink } from "@/components/books/BookPurchaseActions";

export function LibraryContent() {
  const t = useTranslations("Home.Commerce");
  const router = useRouter();
  const { status } = useAuth();

  const authed = status === "authenticated";
  const { data: books, isLoading } = useLibrary(authed);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(
        `/auth/login?callbackUrl=${encodeURIComponent("/books/library")}`,
      );
    }
  }, [status, router]);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-[var(--tott-home-text-strong)]">
        {t("libraryTitle")}
      </h1>

      {isLoading ? (
        <p className="text-[var(--tott-home-text-muted)]">…</p>
      ) : !books || books.length === 0 ? (
        <div className="rounded-lg border border-[var(--tott-card-border)] p-8 text-center">
          <p className="mb-4 text-[var(--tott-home-text-muted)]">
            {t("libraryEmpty")}
          </p>
          <Link
            href="/books"
            className="text-[var(--tott-dash-gold-label)] hover:underline"
          >
            {t("browseBooks")}
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <li
              key={book.id}
              className="flex flex-col gap-3 rounded-lg border border-[var(--tott-card-border)] p-4"
            >
              <Link
                href={`/books/${book.id}`}
                className="font-medium text-[var(--tott-home-text-strong)] hover:underline"
              >
                {book.title}
              </Link>
              {book.author ? (
                <p className="text-sm text-[var(--tott-home-text-muted)]">
                  {book.author}
                </p>
              ) : null}
              <BookDownloadLink bookId={book.id} label={t("read")} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
