import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SectionShell } from "@/components/home/SectionShell";
import { MagCarousel } from "./MagCarousel";
import { MagImage } from "./MagImage";
import type { IssueCard } from "./data";
import { coverSrc } from "./ui";

/**
 * Horizontal cover carousel of published issues — the "browse by issue"
 * rail. Issue covers use portrait framing with an edition badge so they
 * read as magazine issues, distinct from article and book cards.
 */
export async function MagIssuesRow({ issues }: { issues: IssueCard[] }) {
  if (issues.length === 0) return null;
  const t = await getTranslations("MagazineNext.issues");

  return (
    <SectionShell
      id="magazine-issues"
      eyebrow={t("eyebrow")}
      title={t("title")}
      standfirst={t("standfirst")}
      fullBleed
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <MagCarousel prevLabel={t("prev")} nextLabel={t("next")}>
          {issues.map((issue) => (
            <Link
              key={issue.id}
              href={issue.slug ? `/magazine-issues/${issue.slug}` : "/magazine-next#magazine-issues"}
              className="group w-56 shrink-0 sm:w-64"
            >
              <div
                className="relative w-full overflow-hidden border border-[var(--tott-card-border)]"
                style={{ aspectRatio: "3 / 4", backgroundColor: "var(--tott-card-border)" }}
              >
                <MagImage
                  src={coverSrc(issue.coverImage)}
                  alt={issue.title}
                  framing={issue.coverFraming}
                  fill
                  sizes="256px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
                {issue.editionNumber != null ? (
                  <span className="absolute start-3 top-3 bg-[color-mix(in_srgb,var(--tott-well-bg)_80%,transparent)] px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--tott-gold-bright)] backdrop-blur">
                    {t("editionLabel", { number: issue.editionNumber })}
                  </span>
                ) : null}
              </div>
              <h3 className="mt-3 text-sm font-medium leading-snug text-[var(--tott-home-text-strong)] group-hover:text-[var(--tott-gold-bright)]">
                {issue.title}
              </h3>
              {issue.subtitle ? (
                <p className="mt-1 line-clamp-1 text-xs text-[var(--tott-home-text-muted)]">
                  {issue.subtitle}
                </p>
              ) : null}
            </Link>
          ))}
        </MagCarousel>
      </div>
    </SectionShell>
  );
}
