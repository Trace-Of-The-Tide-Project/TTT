import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { SectionShell } from "@/components/home/SectionShell";
import { MagImage } from "./MagImage";
import type { ArticleCard } from "./data";
import { articleHref, coverSrc, shortDate, stripHtml } from "./ui";

/**
 * Editorial lead block: one large featured article + up to three stacked
 * secondaries. Proves rich written content and gives writers visible
 * identity. Lead sits at the reading-start side (DOM order); the grid
 * mirrors under RTL automatically.
 *
 * `articles[0]` is the lead — the caller passes is_featured results, or
 * falls back to newest-first so the block is never empty.
 */
export async function MagFeatured({
  articles,
  locale,
}: {
  articles: ArticleCard[];
  locale: string;
}) {
  if (articles.length === 0) return null;
  const t = await getTranslations("MagazineNext.featured");

  const [lead, ...rest] = articles;
  const secondaries = rest.slice(0, 3);

  return (
    <SectionShell id="magazine-featured" eyebrow={t("eyebrow")} title={t("title")}>
      <RevealOnScroll className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Lead */}
        <Link href={articleHref(lead.id)} className="group flex flex-col">
          <div
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: "16 / 10", backgroundColor: "var(--tott-card-border)" }}
          >
            <MagImage
              src={coverSrc(lead.coverImage)}
              alt={lead.title}
              framing={lead.coverFraming}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </div>
          {lead.category ? (
            <span className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tott-accent-gold)]">
              {lead.category}
            </span>
          ) : null}
          <h3
            className="font-display mt-2 text-2xl text-[var(--tott-home-text-warm)] sm:text-3xl"
            style={{
              lineHeight: "var(--tott-display-leading)",
              letterSpacing: "var(--tott-display-tracking)",
            }}
          >
            {lead.title}
          </h3>
          {lead.excerpt ? (
            <p className="mt-3 line-clamp-3 max-w-prose text-sm leading-relaxed text-[var(--tott-salt)]">
              {stripHtml(lead.excerpt)}
            </p>
          ) : null}
          <p className="mt-4 text-xs text-[var(--tott-home-text-muted)]">
            {[lead.authorName, shortDate(lead.publishedAt, locale)].filter(Boolean).join(" · ")}
          </p>
        </Link>

        {/* Secondaries */}
        {secondaries.length > 0 ? (
          <ul className="flex flex-col divide-y divide-[var(--tott-card-border)]">
            {secondaries.map((a) => (
              <li key={a.id} className="py-5 first:pt-0">
                <Link href={articleHref(a.id)} className="group flex items-start gap-4">
                  <div
                    className="relative hidden h-20 w-28 shrink-0 overflow-hidden sm:block"
                    style={{ backgroundColor: "var(--tott-card-border)" }}
                  >
                    <MagImage
                      src={coverSrc(a.coverImage)}
                      alt={a.title}
                      framing={a.coverFraming}
                      fill
                      sizes="112px"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                    />
                  </div>
                  <div className="min-w-0">
                    {a.category ? (
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--tott-accent-gold)]">
                        {a.category}
                      </span>
                    ) : null}
                    <h4 className="mt-1 text-base font-medium leading-snug text-[var(--tott-home-text-strong)] group-hover:text-[var(--tott-gold-bright)]">
                      {a.title}
                    </h4>
                    <p className="mt-1 text-xs text-[var(--tott-home-text-muted)]">
                      {[a.authorName, shortDate(a.publishedAt, locale)]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </RevealOnScroll>
    </SectionShell>
  );
}
