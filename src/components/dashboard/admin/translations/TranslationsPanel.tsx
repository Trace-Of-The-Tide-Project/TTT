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
  contentType: TranslatableType;
  contentId: string;
  currentLanguage?: string;
  createBasePath?: string;
};

const DEFAULT_CREATE_PATH = "/admin/articles/create/article";

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
    <ChamferedPanel className="p-3">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-gray-500">
        {t("panelTitle")}
      </p>

      <div className="flex gap-0.5 rounded-lg bg-[var(--tott-elevated)] p-0.5">
        {routing.locales.map((loc) => {
          const version = byLanguage.get(loc);
          const isCurrent = loc === currentLanguage;

          const chipClass = `relative rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
            isCurrent
              ? "bg-[var(--tott-dash-surface-inset)] text-foreground shadow-sm"
              : version
                ? "text-[var(--tott-tab-inactive)] hover:text-foreground"
                : "text-gray-600 hover:text-gray-400"
          }`;

          if (isCurrent) {
            return (
              <span key={loc} className={chipClass} title={t("currentBadge")}>
                {loc}
              </span>
            );
          }

          if (version) {
            return (
              <Link
                key={loc}
                href={`/admin/articles/edit/${version.id}`}
                className={chipClass}
                title={
                  version.status
                    ? t.has(`status.${version.status}`)
                      ? t(`status.${version.status}`)
                      : version.status
                    : t("openVersion")
                }
              >
                {loc}
              </Link>
            );
          }

          return (
            <Link
              key={loc}
              href={`${createBasePath}?language=${loc}&translation_of=${encodeURIComponent(contentId)}`}
              className={chipClass}
              aria-disabled={isPending}
              title={t("addTranslation")}
            >
              {loc}
              <span className="ml-0.5 text-[9px] leading-none text-gray-500">+</span>
            </Link>
          );
        })}
      </div>
    </ChamferedPanel>
  );
}
