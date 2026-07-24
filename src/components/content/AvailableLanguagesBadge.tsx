"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useTranslations as useTranslationGroup } from "@/hooks/queries/translations";
import {
  type TranslatableType,
  type TranslationVersion,
} from "@/services/translations.service";
import {
  DEFAULT_TRANSLATION_VIEW_PATH,
  resolveVersionHref,
} from "@/lib/content/translation-href";

type AvailableLanguagesBadgeProps = {
  /** Content type, so the right translations endpoint is queried. */
  contentType: TranslatableType;
  /** Any id within the translation group (the piece currently being viewed). */
  contentId: string;
  /** Language of the version on screen, highlighted and not linked. */
  currentLanguage?: string;
  /**
   * Public route base used to switch to another version, e.g.
   * "/content/article". The sibling id is appended as `?id=<id>`. Ignored
   * when `hrefFor` is given, and ignored for `contentType="article"` — article
   * versions resolve their own reader from the sibling's product/content_type
   * (see `versionHref` below).
   */
  viewBasePath?: string;
  /**
   * Build the href for a sibling version — use for routes that aren't
   * `?id=`-based (e.g. slug routes). Defaults to `${viewBasePath}?id=<id>`.
   */
  hrefFor?: (version: TranslationVersion) => string;
  /** Only show versions matching this predicate (e.g. published-only for
   * public readers). Defaults to showing every version returned. */
  statusFilter?: (version: TranslationVersion) => boolean;
  className?: string;
};

const DEFAULT_VIEW_PATH = DEFAULT_TRANSLATION_VIEW_PATH;

/**
 * Public "Also available in EN · AR" badge. Lists the languages a piece exists
 * in and links to switch to each sibling version. Content is never hidden — if
 * only one version exists, nothing renders. Reader's current language is shown
 * highlighted and is not a link.
 */
export function AvailableLanguagesBadge({
  contentType,
  contentId,
  currentLanguage,
  viewBasePath = DEFAULT_VIEW_PATH,
  hrefFor,
  statusFilter,
  className,
}: AvailableLanguagesBadgeProps) {
  const t = useTranslations("Content.availableLanguages");
  const { data } = useTranslationGroup(contentType, contentId);

  const versions = (data?.versions ?? []).filter((v) =>
    statusFilter ? statusFilter(v) : true,
  );
  // Only worth showing when the piece exists in more than one language.
  if (versions.length < 2) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 text-sm ${className ?? ""}`}>
      <span className="text-[var(--tott-home-text-muted)]">{t("label")}</span>
      {versions.map((v) => {
        const isCurrent = v.language === currentLanguage;
        const label = t.has(`languages.${v.language}`)
          ? t(`languages.${v.language}`)
          : v.language.toUpperCase();
        if (isCurrent) {
          return (
            <span
              key={v.id}
              className="rounded-full bg-[var(--tott-panel-bg)] px-2.5 py-0.5 text-xs font-medium text-foreground"
            >
              {label}
            </span>
          );
        }
        const href = hrefFor
          ? hrefFor(v)
          : resolveVersionHref(contentType, v, viewBasePath);
        return (
          <Link
            key={v.id}
            href={href}
            locale={v.language as "en" | "ar" | "es" | "fr"}
            className="rounded-full border border-[var(--tott-card-border)] px-2.5 py-0.5 text-xs font-medium text-blue-400 hover:underline"
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
