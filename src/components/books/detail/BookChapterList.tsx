"use client";

import { useTranslations, useFormatter } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useBookChapters } from "@/hooks/queries/book-chapters";

/** Serialized-book chapter list for the public reader. Each chapter is an
 *  article — released ones link straight to it; unreleased ones show their
 *  scheduled date. Locking is enforced server-side by the article status
 *  gate (an unreleased chapter's URL 404s), this is display only. */
export function BookChapterList({ bookId }: { bookId: string }) {
  const t = useTranslations("Home.bookDetail.chapters");
  const format = useFormatter();
  const { data: chapters = [], isPending } = useBookChapters(bookId);

  if (isPending || chapters.length === 0) return null;

  return (
    <section className="flex flex-col" style={{ gap: "8px" }}>
      <h2
        className="min-[1600px]:text-[22px]!"
        style={{
          fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
          fontWeight: 500,
          fontSize: "16px",
          lineHeight: "24px",
          color: "var(--tott-home-text-muted)",
          margin: 0,
        }}
      >
        {t("heading")}
      </h2>
      <ol className="flex flex-col" style={{ gap: "4px" }}>
        {chapters.map((c, index) => {
          const article = c.article;
          const released = article?.status === "published";
          const label = c.chapter_title || article?.title || t("untitled");

          return (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-lg px-3 py-2"
              style={{ backgroundColor: "var(--tott-panel-bg)" }}
            >
              <span
                className="min-w-0 truncate text-sm"
                style={{ color: released ? "var(--tott-home-text-strong)" : "var(--tott-home-text-muted)" }}
              >
                <span className="me-2 text-[var(--tott-muted)]">{index + 1}.</span>
                {released && article?.slug ? (
                  <Link href={`/content/article/${article.slug}`} className="hover:underline">
                    {label}
                  </Link>
                ) : (
                  label
                )}
              </span>
              {!released ? (
                <span className="shrink-0 text-[10px] text-[var(--tott-muted)]">
                  {article?.scheduled_at
                    ? t("releasesOn", {
                        date: format.dateTime(new Date(article.scheduled_at), { dateStyle: "medium" }),
                      })
                    : t("locked")}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
