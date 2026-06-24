"use client";

import { useMemo } from "react";
import { useTranslations as useIntl } from "next-intl";
import { useLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { useTranslations } from "@/hooks/queries/translations";
import {
  isTranslatableNow,
  type TranslatableType,
  type TranslationVersion,
} from "@/services/translations.service";
import { TRANSLATION_ROUTES } from "./translation-routes";

type TranslationsPanelProps = {
  contentType: TranslatableType;
  contentId: string;
  currentLanguage?: string;
  /** Override the registry create path (e.g. article sub-kinds like trips). */
  createBasePath?: string;
};

/**
 * Compact language-switcher chip row for the editor toolbar.
 * - Current language: highlighted, not a link.
 * - Existing other version: link to that version's editor (same tab).
 * - Missing version: dimmed chip with "+", opens create route (same tab).
 * - "Add all" button: opens the first missing language; the rest stay as chips.
 *
 * Renders nothing when the content type has no admin editor route or its
 * translation support is gated off (pending backend rollout).
 */
export function TranslationsPanel({
  contentType,
  contentId,
  currentLanguage,
  createBasePath,
}: TranslationsPanelProps) {
  const t = useIntl("Dashboard.translations");
  const locale = useLocale();
  const { data } = useTranslations(contentType, contentId);

  const route = TRANSLATION_ROUTES[contentType];
  const createPath = createBasePath ?? route?.create;

  const byLanguage = useMemo(() => {
    const map = new Map<string, TranslationVersion>();
    for (const v of data?.versions ?? []) map.set(v.language, v);
    return map;
  }, [data]);

  const missingLocales = routing.locales.filter(
    (loc) => loc !== currentLanguage && !byLanguage.has(loc),
  );

  // No editor route, or pending type with the flag off → nothing to show.
  if (!route || !createPath || !isTranslatableNow(contentType)) return null;

  function createHref(loc: string) {
    return `/${locale}${createPath}?language=${loc}&translation_of=${encodeURIComponent(contentId)}`;
  }

  function handleAddAll() {
    // Same-tab editing means we can only open one at a time — start with the
    // first missing language; the others remain as "+" chips to add next.
    const first = missingLocales[0];
    if (first) window.location.assign(createHref(first));
  }

  return (
    <div className="flex items-center gap-2">
      {/* Language chips */}
      <div className="flex gap-0.5 rounded-lg bg-[var(--tott-elevated)] p-0.5">
        {routing.locales.map((loc) => {
          const version = byLanguage.get(loc);
          const isCurrent = loc === currentLanguage;

          const base =
            "rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors";

          if (isCurrent) {
            return (
              <span
                key={loc}
                className={`${base} bg-[var(--tott-dash-surface-inset)] text-foreground shadow-sm`}
                title={t("currentBadge")}
              >
                {loc}
              </span>
            );
          }

          if (version) {
            return (
              <a
                key={loc}
                href={`/${locale}${route.edit(version.id)}`}
                className={`${base} text-[var(--tott-tab-inactive)] hover:text-foreground`}
                title={
                  version.status
                    ? t.has(`status.${version.status}`)
                      ? t(`status.${version.status}`)
                      : version.status
                    : t("openVersion")
                }
              >
                {loc}
              </a>
            );
          }

          return (
            <a
              key={loc}
              href={createHref(loc)}
              className={`${base} text-gray-600 hover:text-gray-400`}
              title={t("addTranslation")}
            >
              {loc}
              <span className="ml-0.5 text-[9px] leading-none text-gray-500">+</span>
            </a>
          );
        })}
      </div>

      {/* "Add all missing" — only shown when 2+ languages are missing */}
      {missingLocales.length >= 2 ? (
        <button
          type="button"
          onClick={handleAddAll}
          className="rounded-md border border-[var(--tott-card-border)] px-2.5 py-1 text-[11px] font-medium text-gray-400 transition-colors hover:border-gray-500 hover:text-foreground"
          title={missingLocales.map((l) => l.toUpperCase()).join(", ")}
        >
          {t("addAll")}
        </button>
      ) : null}
    </div>
  );
}
