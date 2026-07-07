"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useTranslations as useTranslationGroup } from "@/hooks/queries/translations";
import {
  type TranslatableType,
} from "@/services/translations.service";

type AvailableLanguagesBadgeProps = {
  /** Content type, so the right translations endpoint is queried. */
  contentType: TranslatableType;
  /** Any id within the translation group (the piece currently being viewed). */
  contentId: string;
  /** Language of the version on screen, highlighted and not linked. */
  currentLanguage?: string;
  /**
   * Public route base used to switch to another version, e.g.
   * "/content/article". The sibling id is appended as `?id=<id>`.
   */
  viewBasePath?: string;
  className?: string;
};

const DEFAULT_VIEW_PATH = "/content/article";

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
  className,
}: AvailableLanguagesBadgeProps) {
  const t = useTranslations("Content.availableLanguages");
  const { data } = useTranslationGroup(contentType, contentId);

  const versions = data?.versions ?? [];
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
        return (
          <Link
            key={v.id}
            href={`${viewBasePath}?id=${encodeURIComponent(v.id)}`}
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
