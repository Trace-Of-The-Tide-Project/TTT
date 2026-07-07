import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import HexBackground from "@/components/ui/HexBackground";
import { ContactUsLink } from "@/components/contribute/ContactUsLink";

const LABEL_COLOR = "var(--tott-home-text-strong)";
const HELPER_COLOR = "var(--tott-home-text-muted)";
const FIELD_BORDER = "var(--tott-card-border)";
const FIELD_BG = "var(--tott-dash-input-bg)";

export default async function ContributionSuccessPage() {
  const t = await getTranslations("Contribute.success");

  return (
    <main
      className="relative min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: "var(--tott-home-surface)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 overflow-hidden"
        style={{ opacity: "var(--tott-dash-hex-opacity, 1)" }}
      >
        <HexBackground />
      </div>

      <div
        className="relative z-10 mx-auto flex min-h-screen w-full flex-col items-center justify-center px-6 py-16"
        style={{ maxWidth: "640px" }}
      >
        <div
          className="flex w-full flex-col items-center text-center"
          style={{ gap: "24px" }}
        >
          {/* Success badge — dark green tint, full-saturation check */}
          <span
            aria-hidden
            className="inline-flex items-center justify-center"
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "999px",
              backgroundColor:
                "color-mix(in srgb, var(--tott-dash-positive, #22C55E) 22%, transparent)",
              color: "var(--tott-dash-positive, #22C55E)",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.25}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>

          <div
            className="flex flex-col items-center"
            style={{ gap: "8px" }}
          >
            <h1
              style={{
                fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "20px",
                lineHeight: "28px",
                color: LABEL_COLOR,
                margin: 0,
              }}
            >
              {t("title")}
            </h1>
            <p
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "-0.005em",
                color: HELPER_COLOR,
                margin: 0,
                maxWidth: "44ch",
              }}
            >
              {t("description")}
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
            style={{
              height: "40px",
              padding: "8px 20px",
              borderRadius: "8px",
              backgroundColor: FIELD_BG,
              border: `1px solid ${FIELD_BORDER}`,
              color: LABEL_COLOR,
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.005em",
            }}
          >
            {t("backHome")}
          </Link>

          <ContactUsLink />
        </div>
      </div>
    </main>
  );
}
