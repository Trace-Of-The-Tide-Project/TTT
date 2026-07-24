import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { StaggerContainer } from "@/components/motion/StaggerContainer";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { SectionShell } from "@/components/home/SectionShell";
import { ContentLanguageChip } from "@/components/content/ContentLanguageChip";
import { MagImage } from "./MagImage";
import type { ArticleCard } from "./data";
import { articleHref, coverSrc, initial, shortDate, stripHtml } from "./ui";

/**
 * Vertical editorial feed of the latest articles. Each card carries the
 * writer's identity (avatar + name), a category kicker, headline, 2-line
 * excerpt, and date · reading-time. Cards stagger in on scroll. Meta rows
 * use logical flow so they mirror correctly under RTL.
 */
export async function MagLatestFeed({
  articles,
  locale,
}: {
  articles: ArticleCard[];
  locale: string;
}) {
  if (articles.length === 0) return null;
  const t = await getTranslations("MagazineNext.feed");

  return (
    <SectionShell
      id="magazine-feed"
      eyebrow={t("eyebrow")}
      title={t("title")}
      standfirst={t("standfirst")}
    >
      <StaggerContainer className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {articles.map((a) => {
          const meta = [
            shortDate(a.publishedAt, locale),
            a.readingTime ? t("minRead", { count: a.readingTime }) : "",
          ]
            .filter(Boolean)
            .join(" · ");
          return (
            <StaggerItem key={a.id}>
              <Link
                href={articleHref(a.id, a.slug)}
                className="group flex h-full flex-col overflow-hidden border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] transition-colors hover:border-[color-mix(in_srgb,var(--tott-accent-gold)_45%,var(--tott-card-border))]"
              >
                <div
                  className="relative w-full"
                  style={{ aspectRatio: "16 / 9", backgroundColor: "var(--tott-card-border)" }}
                >
                  <MagImage
                    src={coverSrc(a.coverImage)}
                    alt={a.title}
                    framing={a.coverFraming}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  {a.category || a.language ? (
                    <span className="flex items-center gap-2">
                      {a.category ? (
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tott-accent-gold)]">
                          {a.category}
                        </span>
                      ) : null}
                      <ContentLanguageChip contentLanguage={a.language} uiLocale={locale} />
                    </span>
                  ) : null}
                  <h3 className="text-lg font-medium leading-snug text-[var(--tott-home-text-strong)]">
                    {a.title}
                  </h3>
                  {a.excerpt ? (
                    <p className="line-clamp-2 text-sm leading-relaxed text-[var(--tott-home-text-muted)]">
                      {stripHtml(a.excerpt)}
                    </p>
                  ) : null}

                  <div className="mt-auto flex items-center gap-3 pt-3">
                    <span className="relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--tott-elevated)] text-xs font-semibold text-[var(--tott-salt)]">
                      {a.authorAvatar ? (
                        <MagImage
                          src={coverSrc(a.authorAvatar)}
                          alt=""
                          fill
                          sizes="32px"
                          className="object-cover"
                        />
                      ) : (
                        initial(a.authorName)
                      )}
                    </span>
                    <div className="min-w-0 text-xs">
                      {a.authorName ? (
                        <p className="truncate text-[var(--tott-home-text-strong)]">
                          {a.authorName}
                        </p>
                      ) : null}
                      {meta ? <p className="text-[var(--tott-home-text-muted)]">{meta}</p> : null}
                    </div>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </SectionShell>
  );
}
