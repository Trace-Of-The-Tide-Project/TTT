import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { HeadsetIcon } from "@/components/ui/icons";
import { theme } from "@/lib/theme";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <div
      className="relative min-h-screen w-full select-none"
      style={{ backgroundColor: "#1a1a1a" }}
    >
      <div className="absolute inset-0">
        <HexBackground />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-24">
        <div className="flex max-w-md flex-col items-center text-center">
          <h2 className="text-lg font-medium text-[#d1d1d1]">{t("title")}</h2>
          <p className="mt-2 text-7xl font-bold text-[#444444] sm:text-8xl">404</p>
          <h1
            className="mt-4 text-xl font-semibold sm:text-2xl"
            style={{ color: "#e8a846" }}
          >
            {t("heading")}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[#aaaaaa] sm:text-base">{t("body")}</p>
          <Link
            href="/"
            className="mt-8 inline-block select-none rounded-lg px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#C9A96E] focus:ring-offset-2 focus:ring-offset-[#1a1a1a]"
            style={{
              backgroundColor: theme.accentGold,
              boxShadow: `0 0 0 1px ${theme.accentGold}`,
            }}
          >
            {t("cta")}
          </Link>
          <p className="mt-10 flex flex-wrap items-center justify-center gap-1.5 text-sm text-[#999999]">
            {t("contactPrompt")}
            <span
              className="inline-flex shrink-0 align-middle"
              style={{ color: theme.accentGold }}
              aria-hidden
            >
              <HeadsetIcon />
            </span>
            <Link
              href="/contact"
              className="inline-flex select-none hover:underline"
              style={{ color: theme.accentGold }}
            >
              {t("contact")}
            </Link>
            {t("contactSuffix")}
          </p>
        </div>
      </div>
    </div>
  );
}
