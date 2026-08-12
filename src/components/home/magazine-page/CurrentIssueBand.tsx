import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ChamferedSurface } from "@/components/ui/ChamferedSurface";
import { MagImage } from "@/components/home/magazine-next/MagImage";
import { shortDate } from "@/components/home/magazine-next/ui";
import type { IssueCard } from "@/components/home/magazine-next/data";

/**
 * Current Issue band — sits directly below the (now CMS-only) Hero. The
 * hero no longer shows issue content, so this is the homepage's only issue
 * surface; it renders nothing when there is no current/newest issue, so the
 * homepage stays complete with zero published issues.
 */
export async function CurrentIssueBand({
  issue,
  recent,
  locale,
}: {
  issue: IssueCard | null;
  recent: IssueCard[];
  locale: string;
}) {
  if (!issue) return null;
  const t = await getTranslations({ locale, namespace: "Magazine" });

  return (
    <section className="px-6 py-12 sm:px-10 lg:px-[156px]" aria-labelledby="current-issue-heading">
      <ChamferedSurface
        chamfer={25}
        borderColor="var(--tott-card-border)"
        innerFill="var(--tott-elevated)"
      >
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:gap-8 sm:p-8">
          <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden sm:w-64">
            {issue.coverImage ? (
              <MagImage
                src={issue.coverImage}
                alt={issue.title}
                framing={issue.coverFraming}
                fill
                sizes="(min-width: 640px) 256px, 100vw"
                className="object-cover"
              />
            ) : null}
          </div>
          <div className="flex flex-1 flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--tott-gold-bright)]">
              {t("currentIssue.eyebrow")}
            </p>
            <h2
              id="current-issue-heading"
              className="font-display mt-3 text-2xl text-[var(--tott-home-text-warm)] sm:text-3xl"
              style={{
                lineHeight: "var(--tott-display-leading)",
                letterSpacing: "var(--tott-display-tracking)",
              }}
            >
              {issue.title}
            </h2>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[var(--tott-salt)]">
              {issue.editionNumber ? (
                <span>
                  {t("edition")} {issue.editionNumber}
                </span>
              ) : null}
              {issue.editionNumber && issue.publishedAt ? <span aria-hidden>·</span> : null}
              {shortDate(issue.publishedAt, locale) || null}
            </p>
            {issue.excerpt ? (
              <p className="mt-4 line-clamp-3 text-base leading-relaxed text-[var(--tott-salt)]">
                {issue.excerpt}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center gap-5">
              {issue.slug ? (
                <Link
                  href={`/magazine-issues/${encodeURIComponent(issue.slug)}`}
                  className="inline-flex items-center bg-[var(--tott-gold-primary)] px-6 py-3 text-sm font-semibold text-[var(--tott-panel-bg)] transition-colors hover:bg-[var(--tott-gold-bright)]"
                >
                  {t("currentIssue.readCta")}
                </Link>
              ) : null}
              <Link
                href="/magazine-issues"
                className="text-sm font-medium text-[var(--tott-gold-bright)] transition-opacity hover:opacity-80"
              >
                {t("currentIssue.allIssues")}
              </Link>
            </div>
          </div>
        </div>
      </ChamferedSurface>

      {recent.length > 0 ? (
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {recent.slice(0, 3).map((r) =>
            r.slug ? (
              <li key={r.id}>
                <Link
                  href={`/magazine-issues/${encodeURIComponent(r.slug)}`}
                  className="group block"
                >
                  <div className="relative aspect-[4/5] w-full overflow-hidden">
                    {r.coverImage ? (
                      <MagImage
                        src={r.coverImage}
                        alt={r.title}
                        framing={r.coverFraming}
                        fill
                        sizes="(min-width: 640px) 25vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : null}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-[var(--tott-home-text-warm)]">
                    {r.title}
                  </p>
                </Link>
              </li>
            ) : null,
          )}
        </ul>
      ) : null}
    </section>
  );
}
