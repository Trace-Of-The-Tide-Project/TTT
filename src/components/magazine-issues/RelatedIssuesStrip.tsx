"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import { StaggerContainer } from "@/components/motion/StaggerContainer";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { MagImage } from "@/components/home/magazine-next/MagImage";
import { shortDate } from "@/components/home/magazine-next/ui";
import type { IssueCard } from "@/components/home/magazine-next/data";

/** Editorial-archive cover grid, not a product carousel — same treatment as
 * the "Previous issues" grid on the archive page. */
export function RelatedIssuesStrip({ issues }: { issues: IssueCard[] }) {
  const t = useTranslations("MagazineIssueDetail");
  const locale = useLocale();

  if (issues.length === 0) return null;

  return (
    <div>
      <h2
        className="font-display text-2xl"
        style={{ color: "var(--tott-home-text-strong)" }}
      >
        {t("exploreMore")}
      </h2>
      <StaggerContainer className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-4">
        {issues.map((issue) =>
          issue.slug ? (
            <StaggerItem key={issue.id}>
              <Link
                href={`/magazine-issues/${encodeURIComponent(issue.slug)}`}
                className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <div className="relative">
                  <ChamferedFrame />
                  <div className="relative aspect-[4/5] w-full overflow-hidden">
                    {issue.coverImage ? (
                      <MagImage
                        src={issue.coverImage}
                        alt={issue.title}
                        framing={issue.coverFraming}
                        fill
                        sizes="(min-width: 640px) 25vw, 50vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    ) : null}
                  </div>
                </div>
                <p className="mt-3 text-xs" style={{ color: "var(--tott-home-text-muted)" }}>
                  {[
                    issue.editionNumber ? `${t("issuePrefix")} ${issue.editionNumber}` : null,
                    shortDate(issue.publishedAt, locale) || null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <h3
                  className="mt-1 line-clamp-2 text-sm font-medium transition-colors group-hover:opacity-80"
                  style={{ color: "var(--tott-home-text-strong)" }}
                >
                  {issue.title}
                </h3>
              </Link>
            </StaggerItem>
          ) : null,
        )}
      </StaggerContainer>
    </div>
  );
}
