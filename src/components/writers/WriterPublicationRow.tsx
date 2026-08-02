"use client";

import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { FileTextIcon, ClockIcon, CalendarIcon } from "@/components/ui/icons";
import type { ArticleListItem } from "@/services/articles.service";

const SANS = "var(--font-plex-sans), 'IBM Plex Sans', system-ui, sans-serif";
const SERIF = "var(--font-plex-serif), 'IBM Plex Serif', Georgia, serif";
const ACCENT = "var(--tott-accent-gold)";
const MUTED = "var(--tott-home-text-muted)";
const CARD_BORDER = "var(--tott-card-border)";

const ArrowIcon = () => (
  <svg
    aria-hidden
    className="tott-archive-arrow"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
  >
    <path
      d="M2 8h11M9 3.5 13.5 8 9 12.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FILTER_KEYS = new Set(["essay", "article", "collection"]);

export function WriterPublicationRow({ article }: { article: ArticleListItem }) {
  const t = useTranslations("Writers");
  const format = useFormatter();

  const typeLabel = FILTER_KEYS.has(article.content_type)
    ? t(`publications.filters.${article.content_type}` as "publications.filters.essay")
    : article.content_type;

  return (
    <li>
      <Link
        href={`/content/article?id=${encodeURIComponent(article.id)}`}
        className="group flex items-center gap-4 rounded-lg px-4 py-4 transition-colors hover:bg-[var(--tott-elevated)] sm:px-5"
        style={{ border: `1px solid ${CARD_BORDER}` }}
      >
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-lg"
          style={{
            backgroundColor:
              "color-mix(in srgb, var(--tott-accent-gold) 10%, var(--tott-home-surface))",
            color: ACCENT,
          }}
        >
          <FileTextIcon />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="truncate text-base font-medium"
              style={{ color: "var(--tott-home-text-strong)", fontFamily: SERIF }}
            >
              {article.title}
            </span>
            <span
              className="shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide"
              style={{
                backgroundColor: "var(--tott-elevated)",
                color: MUTED,
              }}
            >
              {typeLabel}
            </span>
          </div>
          <div
            className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs"
            style={{ color: MUTED, fontFamily: SANS }}
          >
            {article.reading_time ? (
              <span className="inline-flex items-center gap-1.5">
                <ClockIcon />
                {article.reading_time} min
              </span>
            ) : null}
            {article.published_at ? (
              <span className="inline-flex items-center gap-1.5">
                <CalendarIcon />
                {format.dateTime(new Date(article.published_at), {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            ) : null}
          </div>
        </div>

        <span
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: ACCENT }}
        >
          {t("publications.read")}
          <ArrowIcon />
        </span>
      </Link>
    </li>
  );
}
