"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { stripLocalePrefixesFromPath } from "@/lib/i18n/strip-locale-from-path";

const LOCALE_LABELS: Record<string, string> = {
  en: "EN",
  ar: "ع",
  es: "ES",
  fr: "FR",
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Navbar");

  const switchTo = (next: (typeof routing.locales)[number]) => {
    if (next === locale) return;
    const base = stripLocalePrefixesFromPath(pathname ?? "/");
    router.replace(base, { locale: next });
  };

  return (
    <div className={`flex items-center gap-1 ${className ?? ""}`}>
      <span className="sr-only">{t("language")}</span>
      {routing.locales.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => switchTo(code)}
          className={`rounded px-2 py-1 text-xs font-semibold transition-colors ${
            code === locale
              ? "bg-[#C9A96E]/20 text-[#C9A96E]"
              : "text-[var(--tott-muted)] hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
          }`}
          aria-pressed={code === locale}
          aria-label={code}
        >
          {LOCALE_LABELS[code] ?? code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
