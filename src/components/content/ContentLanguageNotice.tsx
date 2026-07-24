"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useTranslations as useTranslationGroup } from "@/hooks/queries/translations";
import {
  type TranslatableType,
  type TranslationVersion,
} from "@/services/translations.service";
import { resolveVersionHref } from "@/lib/content/translation-href";
import { AlertTriangleIcon, XIcon } from "@/components/ui/icons";

type ContentLanguageNoticeProps = {
  /** Content type, so the right translations endpoint is queried when
   * `preloadedVersions` isn't supplied. */
  contentType: TranslatableType;
  /** Any id within the translation group (the piece currently being viewed). */
  contentId: string;
  /** Language the version on screen is written in. */
  contentLanguage?: string;
  /**
   * Sibling versions already fetched with the piece itself (e.g. the article
   * detail response embeds `available_languages`) — skips the extra
   * /translations request and avoids a pop-in. Falls back to fetching via
   * `useTranslations(contentType, contentId)` when omitted.
   */
  preloadedVersions?: TranslationVersion[];
  /** Public route base for the generic `?id=` reader. Ignored for
   * `contentType="article"`, which resolves its own reader per sibling. */
  viewBasePath?: string;
  /** Build the href for a sibling version — use for routes that aren't
   * `?id=`-based (e.g. slug routes). */
  hrefFor?: (version: TranslationVersion) => string;
  /** Only consider versions matching this predicate. Defaults to
   * published-only, the right default for public readers. */
  statusFilter?: (version: TranslationVersion) => boolean;
  /** Swaps the fallback copy for a magazine issue rather than an article. */
  variant?: "article" | "issue";
  className?: string;
};

const DEFAULT_STATUS_FILTER = (v: TranslationVersion) =>
  !v.status || v.status === "published";

/**
 * Tells the reader when the piece on screen isn't in their UI language — the
 * feedback `AvailableLanguagesBadge` never gave (it renders nothing for a
 * single-language piece, which is exactly the untranslated case). Renders one
 * of three things:
 *
 * - Nothing, when the content language matches the UI locale and there's
 *   only one version (nothing to say).
 * - A quiet "Also available in X · Y" list, when languages match but the
 *   piece has siblings (same as the old badge — still useful, low salience).
 * - An amber notice, when languages DON'T match: a "Read this in <lang>" CTA
 *   if a sibling exists in the UI language, else "not available yet" plus
 *   links to whatever languages do exist. Dismissible per session per piece.
 */
export function ContentLanguageNotice({
  contentType,
  contentId,
  contentLanguage,
  preloadedVersions,
  viewBasePath,
  hrefFor,
  statusFilter = DEFAULT_STATUS_FILTER,
  variant = "article",
  className,
}: ContentLanguageNoticeProps) {
  const uiLocale = useLocale();
  const t = useTranslations("Content.languageNotice");
  const tLang = useTranslations("Content.availableLanguages");
  const { data } = useTranslationGroup(
    contentType,
    preloadedVersions ? null : contentId,
  );
  const versions = (preloadedVersions ?? data?.versions ?? []).filter(statusFilter);

  const storageKey = `tott:lang-notice:${contentId}`;
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    try {
      if (sessionStorage.getItem(storageKey) === "1") setDismissed(true);
    } catch {
      // Storage can throw in locked-down browser contexts — never block the read.
    }
  }, [storageKey]);

  if (!contentLanguage) return null;

  const languageLabel = (code: string) =>
    tLang.has(`languages.${code}`) ? tLang(`languages.${code}`) : code.toUpperCase();

  const hrefForVersion = (v: TranslationVersion) =>
    hrefFor ? hrefFor(v) : resolveVersionHref(contentType, v, viewBasePath);

  const matchesUiLocale = contentLanguage === uiLocale;

  if (matchesUiLocale) {
    // Same job as the old badge: quiet, not dismissible, hidden entirely for
    // a single-language piece.
    if (versions.length < 2) return null;
    return (
      <div className={`flex flex-wrap items-center gap-2 text-sm ${className ?? ""}`}>
        <span className="text-[var(--tott-home-text-muted)]">{tLang("label")}</span>
        {versions.map((v) => {
          const isCurrent = v.language === contentLanguage;
          return isCurrent ? (
            <span
              key={v.id}
              className="rounded-full bg-[var(--tott-panel-bg)] px-2.5 py-0.5 text-xs font-medium text-foreground"
            >
              {languageLabel(v.language)}
            </span>
          ) : (
            <Link
              key={v.id}
              href={hrefForVersion(v)}
              locale={v.language as "en" | "ar" | "es" | "fr"}
              className="rounded-full border border-[var(--tott-card-border)] px-2.5 py-0.5 text-xs font-medium text-blue-400 hover:underline"
            >
              {languageLabel(v.language)}
            </Link>
          );
        })}
      </div>
    );
  }

  if (dismissed) return null;

  const siblingInUiLocale = versions.find((v) => v.language === uiLocale);
  const otherLanguages = versions.filter((v) => v.id !== siblingInUiLocale?.id);

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {
      // Best-effort only — a failed write just means it re-shows next time.
    }
  };

  return (
    <div
      role="status"
      className={`flex items-start gap-3 rounded-xl border ps-3.5 pe-2.5 py-3 text-sm ${className ?? ""}`}
      style={{
        borderColor: "color-mix(in srgb, var(--tott-status-amber) 45%, transparent)",
        backgroundColor: "color-mix(in srgb, var(--tott-status-amber) 12%, transparent)",
        color: "var(--tott-home-text-strong)",
      }}
    >
      <span
        className="mt-0.5 shrink-0"
        style={{ color: "var(--tott-status-amber)" }}
        aria-hidden="true"
      >
        <AlertTriangleIcon />
      </span>
      <div className="flex flex-1 flex-wrap items-center gap-x-2 gap-y-1.5">
        <p className="leading-snug">
          {siblingInUiLocale
            ? t("switchBody", { contentLanguage: languageLabel(contentLanguage) })
            : t(variant === "issue" ? "issueFallbackBody" : "fallbackBody", {
                userLanguage: languageLabel(uiLocale),
                contentLanguage: languageLabel(contentLanguage),
              })}
        </p>
        {siblingInUiLocale ? (
          <Link
            href={hrefForVersion(siblingInUiLocale)}
            locale={siblingInUiLocale.language as "en" | "ar" | "es" | "fr"}
            className="font-semibold underline underline-offset-2 hover:no-underline"
          >
            {t("switchCta", { language: languageLabel(uiLocale) })}
          </Link>
        ) : otherLanguages.length > 0 ? (
          <span className="flex flex-wrap items-center gap-1.5">
            {otherLanguages.map((v) => (
              <Link
                key={v.id}
                href={hrefForVersion(v)}
                locale={v.language as "en" | "ar" | "es" | "fr"}
                className="rounded-full border border-[var(--tott-card-border)] px-2 py-0.5 text-xs font-medium hover:underline"
              >
                {languageLabel(v.language)}
              </Link>
            ))}
          </span>
        ) : null}
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t("dismiss")}
        className="shrink-0 rounded-full p-1 text-[var(--tott-home-text-muted)] hover:bg-[var(--tott-panel-bg)]"
      >
        <XIcon />
      </button>
    </div>
  );
}
