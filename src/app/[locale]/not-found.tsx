import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import HexBackground404 from "@/components/ui/HexBackground404";
import { HeadsetIcon } from "@/components/ui/icons";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <div
      className="relative h-screen w-full overflow-hidden"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div className="absolute inset-0">
        <HexBackground404 />
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 sm:px-6">
        <div className="flex w-full flex-col items-center text-center">

          <p
            className="text-base font-medium tracking-wide sm:text-lg"
            style={{ color: "var(--tott-muted)" }}
          >
            {t("title")}
          </p>

          <p
            aria-hidden
            className="select-none font-black leading-none"
            style={{
              fontSize: "clamp(5rem, 22vw, 20rem)",
              letterSpacing: "-0.03em",
              color: "var(--tott-card-border)",
              marginTop: "0.15rem",
            }}
          >
            404
          </p>

          <h1
            className="mt-4 text-lg font-bold sm:text-2xl"
            style={{ color: "var(--foreground)" }}
          >
            {t("heading")}
          </h1>

          <p
            className="mt-2 max-w-md text-sm leading-relaxed sm:text-base"
            style={{ color: "var(--tott-muted)" }}
          >
            {t("body")}
          </p>

          <Link
            href="/"
            className="mt-5 inline-block rounded-xl px-8 py-3 text-sm font-semibold transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--tott-accent-gold)] focus:ring-offset-2"
            style={{
              backgroundColor: "var(--tott-accent-gold)",
              color: "#1a1a1a",
            }}
          >
            {t("cta")}
          </Link>

          <p
            className="mt-5 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-sm"
            style={{ color: "var(--tott-muted)" }}
          >
            <span>{t("contactPrompt")}</span>
            <span
              className="inline-flex shrink-0 items-center"
              style={{ color: "var(--tott-dash-gold-label)" }}
              aria-hidden
            >
              <HeadsetIcon />
            </span>
            <Link
              href="/contact"
              className="font-medium hover:underline"
              style={{ color: "var(--tott-dash-gold-label)" }}
            >
              {t("contact")}
            </Link>
            <span>{t("contactSuffix")}</span>
          </p>

        </div>
      </div>
    </div>
  );
}
