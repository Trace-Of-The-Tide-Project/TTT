import { getTranslations } from "next-intl/server";
import { MagHeroClient } from "./MagHeroClient";
import type { IssueCard } from "./data";

const FALLBACK_COVER = "/images/image.png";

/**
 * Current-issue hero. Renders the latest published issue as the magazine's
 * "cover". Cover resolution: the issue's own cover → `fallbackArtwork`
 * (admin page-hero override, then CMS hero artwork) → a bundled placeholder.
 * The issue cover wins so publishing an issue always takes over the hero —
 * the fallbacks exist for the window where no issue is published yet.
 *
 * With no issue there is nothing to link to, so the CTAs drop and the copy
 * degrades to a brand statement.
 */
export async function MagHero({
  issue,
  fallbackArtwork,
}: {
  issue: IssueCard | undefined;
  fallbackArtwork?: string | null;
}) {
  const t = await getTranslations("MagazineNext.hero");
  const cover = issue?.coverImage || fallbackArtwork || FALLBACK_COVER;

  if (!issue) {
    return (
      <MagHeroClient
        eyebrow={t("brandLead")}
        title={t("brandStatement")}
        subtitle={null}
        coverImage={cover}
        coverAlt={t("brandCoverAlt")}
      />
    );
  }

  const readHref = issue.slug ? `/magazine-issues/${issue.slug}` : "/magazine-next#magazine-issues";

  return (
    <MagHeroClient
      eyebrow={t("eyebrow")}
      title={issue.title}
      subtitle={issue.subtitle ?? issue.excerpt ?? null}
      coverImage={cover}
      coverAlt={t("coverAlt")}
      primary={{ label: t("readIssue"), href: readHref }}
      secondary={{ label: t("browseAll"), href: "/magazine-next#magazine-issues" }}
    />
  );
}
