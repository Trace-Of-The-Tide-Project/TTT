import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { I18nDemoClient } from "./I18nDemoClient";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";

export default async function I18nDemoPage() {
  const t = await getTranslations("Home");

  return (
    <div className="min-h-screen bg-[#141414] text-foreground">
      <header className="flex items-center justify-between border-b border-[var(--tott-card-border)] px-6 py-4">
        <Link href="/" className="text-sm font-medium text-[#C9A96E] hover:underline">
          ← {t("title")}
        </Link>
        <LanguageSwitcher />
      </header>
      <div className="mx-auto max-w-2xl space-y-8 px-6 py-16">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-gray-400">{t("subtitle")}</p>
          <p className="text-sm text-gray-500">
            Server:{" "}
            <code className="rounded bg-[var(--tott-dash-control-bg)] px-1">
              getTranslations(&quot;Home&quot;)
            </code>
          </p>
        </div>

        <I18nDemoClient />

        <Link
          href="/admin"
          className="inline-block rounded-lg border border-[#C9A96E]/50 px-4 py-2 text-sm font-medium text-[#C9A96E] hover:bg-[#C9A96E]/10"
        >
          {t("goAdmin")}
        </Link>
      </div>
    </div>
  );
}
