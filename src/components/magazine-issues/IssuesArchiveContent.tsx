"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import ComingSoon from "@/components/ui/ComingSoon";
import { ChamferedSurface } from "@/components/ui/ChamferedSurface";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { StaggerContainer } from "@/components/motion/StaggerContainer";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { MagImage } from "@/components/home/magazine-next/MagImage";
import { shortDate } from "@/components/home/magazine-next/ui";
import { StarIcon } from "@/components/ui/icons";
import type { IssueCard } from "@/components/home/magazine-next/data";

export function IssuesArchiveContent({
  current,
  previous,
  locale,
}: {
  current: IssueCard | null;
  previous: IssueCard[];
  locale: string;
}) {
  const t = useTranslations("Magazine.issuesArchive");
  const tMag = useTranslations("Magazine");

  if (!current && previous.length === 0) {
    return (
      <ComingSoon
        badge={tMag("issueNotFound.badge")}
        title={t("empty")}
        description={tMag("issueNotFound.description")}
        ctaLabel={tMag("issueNotFound.cta")}
        ctaHref="/magazine"
      />
    );
  }

  return (
    <main
      className="min-h-screen px-6 pb-24 pt-24 sm:px-10 sm:pt-28 lg:px-[156px] lg:pt-32"
      style={{ backgroundColor: "var(--tott-home-surface)" }}
    >
      <RevealOnScroll>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--tott-gold-bright)]">
          {t("title")}
        </p>
        <h1
          className="font-display mt-3 max-w-2xl text-3xl text-[var(--tott-home-text-warm)] sm:text-4xl"
          style={{
            lineHeight: "var(--tott-display-leading)",
            letterSpacing: "var(--tott-display-tracking)",
          }}
        >
          {t("standfirst")}
        </h1>
      </RevealOnScroll>

      {current ? (
        <RevealOnScroll className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--tott-salt)]">
            {t("currentHeading")}
          </h2>
          <ChamferedSurface
            className="mt-4"
            chamfer={25}
            borderColor="var(--tott-card-border)"
            innerFill="var(--tott-elevated)"
          >
            <div className="flex flex-col gap-6 p-6 sm:flex-row sm:gap-8 sm:p-8">
              <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden sm:w-72">
                {current.coverImage ? (
                  <MagImage
                    src={current.coverImage}
                    alt={current.title}
                    framing={current.coverFraming}
                    fill
                    sizes="(min-width: 640px) 288px, 100vw"
                    className="object-cover"
                  />
                ) : null}
                <span
                  className="absolute start-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold shadow [&_svg]:h-3 [&_svg]:w-3"
                  style={{
                    backgroundColor: "var(--tott-accent-gold)",
                    color: "var(--tott-well-bg)",
                  }}
                >
                  <StarIcon />
                  {t("currentHeading")}
                </span>
              </div>
              <div className="flex flex-1 flex-col justify-center">
                <p className="text-sm text-[var(--tott-salt)]">
                  {[
                    current.editionNumber ? `${t("editionLabel")} ${current.editionNumber}` : null,
                    shortDate(current.publishedAt, locale) || null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                <h3
                  className="font-display mt-2 text-2xl text-[var(--tott-home-text-warm)] sm:text-3xl"
                  style={{
                    lineHeight: "var(--tott-display-leading)",
                    letterSpacing: "var(--tott-display-tracking)",
                  }}
                >
                  {current.title}
                </h3>
                {current.excerpt ? (
                  <p className="mt-4 line-clamp-3 text-base leading-relaxed text-[var(--tott-salt)]">
                    {current.excerpt}
                  </p>
                ) : null}
                {current.slug ? (
                  <Link
                    href={`/magazine-issues/${encodeURIComponent(current.slug)}`}
                    className="mt-6 inline-flex w-fit items-center bg-[var(--tott-gold-primary)] px-6 py-3 text-sm font-semibold text-[var(--tott-panel-bg)] transition-colors hover:bg-[var(--tott-gold-bright)]"
                  >
                    {tMag("currentIssue.readCta")}
                  </Link>
                ) : null}
              </div>
            </div>
          </ChamferedSurface>
        </RevealOnScroll>
      ) : null}

      {previous.length > 0 ? (
        <RevealOnScroll className="mt-14">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--tott-salt)]">
            {t("previousHeading")}
          </h2>
          <StaggerContainer className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {previous.map((issue) => (
              <StaggerItem key={issue.id}>
                {issue.slug ? (
                  <Link href={`/magazine-issues/${encodeURIComponent(issue.slug)}`} className="group block">
                    <div className="relative">
                      <ChamferedFrame />
                      <div className="relative aspect-[4/5] w-full overflow-hidden">
                        {issue.coverImage ? (
                          <MagImage
                            src={issue.coverImage}
                            alt={issue.title}
                            framing={issue.coverFraming}
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        ) : null}
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-[var(--tott-salt)]">
                      {[
                        issue.editionNumber ? `${t("editionLabel")} ${issue.editionNumber}` : null,
                        shortDate(issue.publishedAt, locale) || null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    <h3 className="mt-1 line-clamp-2 text-base font-medium text-[var(--tott-home-text-warm)]">
                      {issue.title}
                    </h3>
                    {issue.excerpt ? (
                      <p className="mt-1 line-clamp-2 text-sm text-[var(--tott-salt)]">{issue.excerpt}</p>
                    ) : null}
                  </Link>
                ) : null}
              </StaggerItem>
            ))}
          </StaggerContainer>
        </RevealOnScroll>
      ) : null}
    </main>
  );
}
