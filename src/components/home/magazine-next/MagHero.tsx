import { getTranslations } from "next-intl/server";
import type { HeroLocaleFields } from "@/services/magazine-page.service";
import type { ImageFraming } from "@/lib/image-framing";
import { MagHeroClient } from "./MagHeroClient";
import { heroCta, stripHtml } from "./ui";
import type { IssueCard } from "./data";

const FALLBACK_COVER = "/images/image.png";

/**
 * Current-issue hero. Renders the latest published issue as the magazine's
 * "cover". Cover resolution: the issue's own cover → `fallbackArtwork`
 * (admin page-hero override, then CMS hero artwork) → a bundled placeholder.
 * The issue cover wins so publishing an issue always takes over the hero —
 * the fallbacks exist for the window where no issue is published yet.
 *
 * With no issue, the copy degrades to the CMS hero copy and then to a brand
 * statement, and the CTAs come from the CMS too — each rendered only when the
 * admin gave it both a label and a link.
 */
export async function MagHero({
  issue,
  fallbackArtwork,
  fallbackArtworkFraming,
  fallbackCopy,
  fallbackPrimaryHref,
  fallbackSecondaryHref,
}: {
  issue: IssueCard | undefined;
  fallbackArtwork?: string | null;
  /** Framing for `fallbackArtwork`. Applied only in the no-issue branch, since
   * an issue's own cover is a different image the crop was not tuned for. */
  fallbackArtworkFraming?: ImageFraming;
  /** CMS hero copy — consumed ONLY when no issue is published. */
  fallbackCopy?: HeroLocaleFields;
  /** CMS hero CTA destinations — same fallback-only scope as `fallbackCopy`. */
  fallbackPrimaryHref?: string;
  fallbackSecondaryHref?: string;
}) {
  const t = await getTranslations("MagazineNext.hero");
  const cover = issue?.coverImage || fallbackArtwork || FALLBACK_COVER;

  if (!issue) {
    // Subtitle is rich HTML in the editor; the hero renders plain text.
    return (
      <MagHeroClient
        eyebrow={t("brandLead")}
        title={fallbackCopy?.title?.trim() || t("brandStatement")}
        subtitle={stripHtml(fallbackCopy?.subtitle) || null}
        coverImage={cover}
        coverAlt={t("brandCoverAlt")}
        coverFraming={fallbackArtworkFraming}
        primary={heroCta(fallbackCopy?.primaryCtaLabel, fallbackPrimaryHref)}
        secondary={heroCta(fallbackCopy?.secondaryCtaLabel, fallbackSecondaryHref)}
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
      // Framing set on the issue's own cover — only meaningful when that cover
      // is what renders, which is exactly this branch.
      coverFraming={issue.coverImage ? issue.coverFraming : fallbackArtworkFraming}
      primary={{ label: t("readIssue"), href: readHref }}
      secondary={{ label: t("browseAll"), href: "/magazine-next#magazine-issues" }}
    />
  );
}
