"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { stripLocalePrefixesFromPath } from "@/lib/i18n/strip-locale-from-path";
import { getTranslations } from "@/services/translations.service";
import { ChevronDownSmallIcon } from "@/components/ui/icons";
import { useTheme } from "@/components/providers/ThemeProvider";

const LOCALE_LABELS: Record<string, { short: string; native: string }> = {
  en: { short: "EN", native: "English" },
  ar: { short: "ع", native: "العربية" },
  es: { short: "ES", native: "Español" },
  fr: { short: "FR", native: "Français" },
};

interface Props {
  className?: string;
  /** "dropdown" (default) for desktop nav; "flat" for mobile drawer where overflow clips the dropdown */
  mode?: "dropdown" | "flat";
}

/**
 * `usePathname()` is locale-stripped, so the article page is reachable at
 * exactly this base. The reader's article lives in the `?id=` query param.
 */
const ARTICLE_BASE_PATH = "/content/article";

export function LanguageSwitcher({ className, mode = "dropdown" }: Props) {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const switchTo = async (next: (typeof routing.locales)[number]) => {
    if (next === locale) { setOpen(false); return; }
    const base = stripLocalePrefixesFromPath(pathname ?? "/");

    // On an article page, a plain locale swap keeps the *same* article id, which
    // shows the original piece under a different UI language (or, worse, an
    // unrelated article). Each language version is its own row with its own id,
    // so resolve the sibling in the target language and point at *that* id.
    const articleId = searchParams.get("id")?.trim();
    if (base === ARTICLE_BASE_PATH && articleId) {
      try {
        const group = await getTranslations("article", articleId);
        const sibling = group.versions.find((v) => v.language === next);
        if (sibling) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("id", sibling.id);
          window.location.assign(`/${next}${base}?${params.toString()}`);
          return;
        }
        // No version in the target language: fall through to a plain swap so the
        // navbar still changes the UI language rather than doing nothing.
      } catch {
        // Network/lookup failure — degrade to the plain locale swap below.
      }
    }

    const target = `/${next}${base === "/" ? "" : base}`;
    // Use `.assign()` instead of mutating `location.href` so React 19's
    // immutability rule is happy. Same hard-navigation semantics.
    window.location.assign(target);
  };

  const current = LOCALE_LABELS[locale] ?? { short: locale.toUpperCase(), native: locale };
  const dropdownBg = isDark ? "var(--tott-panel-bg)" : "var(--background)";
  const dropdownBorder = "var(--tott-card-border)";

  if (mode === "flat") {
    return (
      <div className={`flex flex-wrap gap-1 ${className ?? ""}`}>
        {routing.locales.map((code) => {
          const label = LOCALE_LABELS[code] ?? { short: code.toUpperCase(), native: code };
          return (
            <button
              key={code}
              type="button"
              onClick={() => void switchTo(code)}
              className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                code === locale
                  ? "bg-[color-mix(in_srgb,var(--tott-accent-gold)_20%,transparent)] text-[var(--tott-home-eyebrow)]"
                  : "text-[var(--tott-muted)] hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
              }`}
              aria-pressed={code === locale}
            >
              {label.native}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div ref={ref} className={`relative ${className ?? ""}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold transition-colors hover:bg-[var(--tott-dash-ghost-hover)]"
      >
        <span>{current.short}</span>
        <ChevronDownSmallIcon />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 min-w-[130px] rounded-lg border py-1 shadow-lg"
          style={{ backgroundColor: dropdownBg, borderColor: dropdownBorder }}
          role="listbox"
          aria-label="Select language"
        >
          {routing.locales.map((code) => {
            const label = LOCALE_LABELS[code] ?? { short: code.toUpperCase(), native: code };
            const isActive = code === locale;
            return (
              <button
                key={code}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => { setOpen(false); void switchTo(code); }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "text-[var(--tott-home-eyebrow)]"
                    : "text-[var(--tott-muted)] hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
                }`}
              >
                <span className="w-5 shrink-0 text-center font-semibold">{label.short}</span>
                <span>{label.native}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
