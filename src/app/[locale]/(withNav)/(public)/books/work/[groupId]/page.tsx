import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getBookWork } from "@/services/books.service";
import {
  isUsableArticleMediaRef,
  resolveArticleMediaSrc,
} from "@/lib/content/article-media-url";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ groupId: string; locale: string }>;
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  ar: "العربية",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
};

export default async function BookWorkPage({ params }: PageProps) {
  const { groupId } = await params;
  const t = await getTranslations("Books.work");

  const editions = await getBookWork(groupId);
  if (!editions.length) return notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-2xl text-[var(--tott-home-text-warm)]">
        {t("title")}
      </h1>
      <ul className="mt-6 flex flex-col gap-3">
        {editions.map((book) => {
          const ref = book.cover_image?.trim();
          const cover =
            ref && isUsableArticleMediaRef(ref)
              ? resolveArticleMediaSrc(ref)
              : null;
          const langLabel =
            LANGUAGE_NAMES[(book.language ?? "").toLowerCase()] ??
            book.language ??
            "";
          const formatLabel = book.format ?? "digital";

          return (
            <li key={book.id}>
              <Link
                href={`/books/${book.id}`}
                className="flex items-center gap-4 rounded-md border border-[var(--tott-panel-bg)] bg-[var(--tott-elevated)] p-3 hover:bg-[var(--tott-elevated-hover)]"
              >
                {cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={cover}
                    alt=""
                    className="h-16 w-12 shrink-0 rounded-sm object-cover"
                  />
                ) : null}
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{book.title}</span>
                  <span className="text-sm text-[var(--tott-salt)]">
                    {langLabel} — {formatLabel}
                    {book.edition ? ` — ${book.edition}` : ""}
                  </span>
                  {book.isbn ? (
                    <span dir="ltr" className="text-xs text-[var(--tott-salt)]">
                      ISBN {book.isbn}
                    </span>
                  ) : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
