import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { theme } from "@/lib/theme";
import type { HomeArticle } from "@/lib/home/fetch-home-data";
import { contentBadge } from "./contentTypeBadge";

/**
 * Magazine-front-page lead. Generous typography, large cover, excerpt —
 * the single piece the editor wants the reader to sink into first.
 * Hidden (returns null) when there is no spotlight article.
 */
export function HomeSpotlight({
  article,
  eyebrow,
  readLabel,
  dir,
}: {
  article: HomeArticle | null;
  eyebrow: string;
  readLabel: string;
  dir?: "rtl" | "ltr";
}) {
  if (!article) return null;
  const badge = contentBadge(article.contentType);

  return (
    <section
      dir={dir}
      aria-label={article.title}
      className="relative overflow-x-hidden py-12 sm:py-16"
      style={{ backgroundColor: "var(--tott-well-bg, " + theme.homeSurface + ")" }}
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <span
          className="text-xs font-semibold uppercase tracking-[0.18em]"
          style={{ color: theme.accentGold }}
        >
          {eyebrow}
        </span>
        <Link
          href={article.href}
          className="group mt-5 grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center"
        >
          {article.image ? (
            <div
              className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border"
              style={{ borderColor: theme.cardBorder }}
            >
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="(min-width: 1024px) 55vw, 90vw"
                unoptimized
              />
            </div>
          ) : null}
          <div className="flex flex-col gap-4">
            <span
              className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
              style={{
                backgroundColor: "color-mix(in srgb, var(--tott-accent-gold) 16%, transparent)",
                color: theme.accentGold,
              }}
            >
              <span aria-hidden>{badge.glyph}</span> {badge.label}
            </span>
            <h2
              className="text-balance text-3xl font-medium leading-tight text-foreground sm:text-4xl"
              style={{ fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)" }}
            >
              {article.title}
            </h2>
            {article.excerpt ? (
              <p className="line-clamp-4 text-base leading-relaxed text-[var(--tott-muted)]">
                {article.excerpt}
              </p>
            ) : null}
            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--tott-muted)]">
              {article.authorName ? <span>{article.authorName}</span> : null}
              {article.readingTime ? (
                <>
                  <span aria-hidden>·</span>
                  <span>{article.readingTime} min</span>
                </>
              ) : null}
            </div>
            <span
              className="mt-1 inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: theme.accentGold }}
            >
              {readLabel} <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
