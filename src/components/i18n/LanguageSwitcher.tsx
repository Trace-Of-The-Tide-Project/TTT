"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { stripLocalePrefixesFromPath } from "@/lib/i18n/strip-locale-from-path";
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

export function LanguageSwitcher({ className, mode = "dropdown" }: Props) {
  const locale = useLocale();
  const pathname = usePathname();
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

  const switchTo = (next: (typeof routing.locales)[number]) => {
    if (next === locale) { setOpen(false); return; }
    const base = stripLocalePrefixesFromPath(pathname ?? "/");
    const target = `/${next}${base === "/" ? "" : base}`;
    // Use `.assign()` instead of mutating `location.href` so React 19's
    // immutability rule is happy. Same hard-navigation semantics.
    window.location.assign(target);
  };

  const current = LOCALE_LABELS[locale] ?? { short: locale.toUpperCase(), native: locale };
  const dropdownBg = isDark ? "#1a1a1a" : "var(--background)";
  const dropdownBorder = isDark ? "#333333" : "var(--tott-card-border)";

  if (mode === "flat") {
    return (
      <div className={`flex flex-wrap gap-1 ${className ?? ""}`}>
        {routing.locales.map((code) => {
          const label = LOCALE_LABELS[code] ?? { short: code.toUpperCase(), native: code };
          return (
            <button
              key={code}
              type="button"
              onClick={() => switchTo(code)}
              className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                code === locale
                  ? "bg-[#C9A96E]/20 text-[#C9A96E]"
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
                onClick={() => { setOpen(false); switchTo(code); }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "text-[#C9A96E]"
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
