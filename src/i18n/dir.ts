/**
 * Text direction for a CONTENT language (not the UI locale) — use on inputs,
 * textareas, rich-text editors, and rendered content containers whose language
 * can differ from the active UI locale (e.g. typing the Arabic version of an
 * article while the dashboard is in English).
 *
 * Extend RTL_LOCALES if Hebrew/Farsi are ever added.
 */
const RTL_LOCALES = new Set(["ar"]);

export function dirFor(locale: string | null | undefined): "rtl" | "ltr" {
  return locale && RTL_LOCALES.has(locale) ? "rtl" : "ltr";
}
