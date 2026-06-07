"use client";

import { useMemo } from "react";
import { useTranslations as useIntl } from "next-intl";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { useTranslations } from "@/hooks/queries/translations";
import {
  type TranslatableType,
  type TranslationVersion,
} from "@/services/translations.service";

type TranslationsPanelProps = {
  /** Which content type this panel manages versions for. */
  contentType: TranslatableType;
  /** Any id within the translation group (usually the item being edited). */
  contentId: string;
  /** Language of the item currently open, so it can be marked "Current". */
  currentLanguage?: string;
  /**
   * Where "Add translation" sends the author. The target language is appended
   * as `?language=<loc>&translation_of=<contentId>`. Defaults to the article
   * create route since articles are the primary translatable type.
   */
  createBasePath?: string;
};

const DEFAULT_CREATE_PATH = "/admin/articles/create/article";

/**
 * Generic "Translations" panel shown in a content editor/detail view. Lists all
 * four locales, marking which language versions exist (with a link to open them
 * and their status) and which are missing (with an "Add translation" button that
 * opens the editor pre-linked to this translation group).
 *
 * Driven by `routing.locales`, so adding a fifth locale needs no change here.
 */
export function TranslationsPanel({
  contentType,
  contentId,
  currentLanguage,
  createBasePath = DEFAULT_CREATE_PATH,
}: TranslationsPanelProps) {
  const t = useIntl("Dashboard.translations");
  const { data, isPending } = useTranslations(contentType, contentId);

  const byLanguage = useMemo(() => {
    const map = new Map<string, TranslationVersion>();
    for (const v of data?.versions ?? []) map.set(v.language, v);
    return map;
  }, [data]);

  return (
    <ChamferedPanel className="p-4">
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-foreground">{t("panelTitle")}</h3>
        <p className="mt-0.5 text-xs text-gray-400">{t("panelSubtitle")}</p>
      </div>

      <ul className="space-y-2">
        {routing.locales.map((loc) => {
          const version = byLanguage.get(loc);
          const isCurrent = loc === currentLanguage;
          return (
            <li
              key={loc}
              className="flex items-center justify-between gap-3 rounded-[7.5px] border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2"
            >
              <span className="flex items-center gap-2 text-sm text-foreground">
                {t(`languages.${loc}`)}
                {isCurrent ? (
                  <span className="rounded-full bg-gray-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-200">
                    {t("currentBadge")}
                  </span>
                ) : null}
              </span>

              {version ? (
                <span className="flex items-center gap-2">
                  {version.status ? (
                    <span className="text-xs text-gray-400">
                      {t.has(`status.${version.status}`)
                        ? t(`status.${version.status}`)
                        : version.status}
                    </span>
                  ) : null}
                  {!isCurrent ? (
                    <Link
                      href={`/admin/articles/edit/${version.id}`}
                      className="text-xs font-medium text-blue-400 hover:underline"
                    >
                      {t("openVersion")}
                    </Link>
                  ) : null}
                </span>
              ) : (
                <Link
                  href={`${createBasePath}?language=${loc}&translation_of=${encodeURIComponent(
                    contentId,
                  )}`}
                  className="rounded-[6px] border border-[var(--tott-card-border)] px-2.5 py-1 text-xs font-medium text-foreground hover:border-gray-400"
                  aria-disabled={isPending}
                >
                  {t("addTranslation")}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </ChamferedPanel>
  );
}
