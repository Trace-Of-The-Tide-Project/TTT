"use client";

import { useMemo } from "react";
import { useTranslations as useIntl, useLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { useArticle } from "@/hooks/queries/articles";
import { useTranslations } from "@/hooks/queries/translations";
import type { TranslationVersion } from "@/services/translations.service";

/**
 * Post-create "add translations" hub. After saving a new original article the
 * editor lands here; the author adds each language version one at a time. Every
 * "Add translation" opens the create editor pre-filled from the original and
 * linked via translation_of, returning here on save so progress is visible.
 * Each version publishes on its own — this is a guided flow, not a batch action.
 */
export function TranslationWizard({ articleId }: { articleId: string }) {
  const t = useIntl("Dashboard.translations.wizard");
  const tLang = useIntl("Dashboard.translations.languages");
  const tStatus = useIntl("Dashboard.translations.status");
  const locale = useLocale();

  const articleQuery = useArticle(articleId);
  const { data: group } = useTranslations("article", articleId);

  const byLanguage = useMemo(() => {
    const map = new Map<string, TranslationVersion>();
    for (const v of group?.versions ?? []) map.set(v.language, v);
    return map;
  }, [group]);

  const originalLang = (articleQuery.data?.language || "en").trim() || "en";

  const returnPath = `/admin/articles/translate/${articleId}`;
  const createHref = (loc: string) =>
    `/${locale}/admin/articles/create/article?language=${loc}` +
    `&translation_of=${encodeURIComponent(articleId)}` +
    `&return=${encodeURIComponent(returnPath)}`;

  const total = routing.locales.length;
  const done = routing.locales.filter(
    (loc) => loc === originalLang || byLanguage.has(loc),
  ).length;

  const cardClass =
    "flex items-center gap-3 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] px-4 py-3";

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-xl font-semibold text-foreground">{t("title")}</h1>
      <p className="mt-1 text-sm text-[var(--tott-muted)]">{t("subtitle")}</p>
      <p className="mt-3 text-xs font-medium text-[var(--tott-dash-gold-label)]">
        {t("progress", { done, total })}
      </p>

      <div className="mt-6 space-y-3">
        {routing.locales.map((loc) => {
          const langName = tLang.has(loc) ? tLang(loc) : loc.toUpperCase();
          const isOriginal = loc === originalLang;
          const version = byLanguage.get(loc);
          const exists = isOriginal || Boolean(version);
          const editId = isOriginal ? articleId : version?.id;
          const status = isOriginal
            ? articleQuery.data?.status
            : version?.status;

          return (
            <div key={loc} className={cardClass}>
              <span
                className={[
                  "flex h-7 w-9 shrink-0 items-center justify-center rounded-md text-[11px] font-bold uppercase tracking-wider",
                  exists
                    ? "bg-[var(--tott-gold)]/15 text-[var(--tott-gold)]"
                    : "bg-[var(--tott-dash-surface-inset)] text-[var(--tott-muted)]",
                ].join(" ")}
              >
                {loc}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {langName}
                  {isOriginal ? (
                    <span className="ml-2 text-[10px] font-medium uppercase tracking-wide text-[var(--tott-muted)]">
                      {t("originalBadge")}
                    </span>
                  ) : null}
                </p>
                {exists && status ? (
                  <p className="text-xs text-[var(--tott-muted)]">
                    {tStatus.has(status) ? tStatus(status) : status}
                  </p>
                ) : (
                  <p className="text-xs text-[var(--tott-muted)]">
                    {t("notAdded")}
                  </p>
                )}
              </div>

              {exists ? (
                <span className="flex items-center gap-2">
                  <CheckIcon />
                  <a
                    href={`/${locale}/admin/articles/edit/${editId}`}
                    className="rounded-lg border border-[var(--tott-card-border)] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-[var(--tott-elevated-hover)]"
                  >
                    {t("edit")}
                  </a>
                </span>
              ) : (
                <a
                  href={createHref(loc)}
                  className="rounded-lg border border-[var(--tott-gold)]/60 bg-[var(--tott-gold)]/10 px-3 py-1.5 text-xs font-medium text-[var(--tott-gold)] transition-colors hover:bg-[var(--tott-gold)]/20"
                >
                  {t("addTranslation")}
                </a>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <a
          href={`/${locale}/admin/articles`}
          className="rounded-lg border border-[var(--tott-card-border)] px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-elevated-hover)]"
        >
          {t("finish")}
        </a>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--tott-gold)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
