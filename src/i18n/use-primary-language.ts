"use client";

import { useLocale } from "next-intl";

import { routing } from "@/i18n/routing";

/**
 * Primary language for a create/edit form.
 *
 * Order: the explicit value the form already has (an existing record's
 * `language`, or a `?language=` deep link), then the editor's current CMS
 * locale, then the default locale. Content is authored in one language first;
 * translations are added later, so a form must never default to a locale the
 * editor isn't working in.
 */
export function usePrimaryLanguage(explicit?: string | null): string {
  const locale = useLocale();
  const pick = explicit?.trim() || locale;
  return (routing.locales as readonly string[]).includes(pick)
    ? pick
    : routing.defaultLocale;
}
