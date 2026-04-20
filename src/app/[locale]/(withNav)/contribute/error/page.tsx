import { getTranslations } from "next-intl/server";
import HexBackground from "@/components/ui/HexBackground";
import { ContributeResultButton } from "@/components/contribute/ContributeResultButton";
import { ContactUsLink } from "@/components/contribute/ContactUsLink";
import { theme } from "@/lib/theme";

function XIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

export default async function ContributionErrorPage() {
  const t = await getTranslations("Contribute.error");

  return (
    <div
      className="relative min-h-screen w-full select-none"
      style={{ backgroundColor: theme.pageBackground }}
    >
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0" style={{ background: theme.pageBackground }} />
        <div className="absolute inset-0 h-[320px] w-full">
          <HexBackground />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(127, 29, 29, 0.18) 0%, transparent 70%)",
            }}
            aria-hidden
          />
        </div>
      </section>

      <div className="relative z-10 flex min-h-[60vh] flex-col items-center justify-center px-6 py-12">
        <div className="flex w-full max-w-md flex-col items-center text-center">
          <div
            className="mb-6 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-red-600 text-white"
            aria-hidden
          >
            <XIcon />
          </div>
          <h1 className="mb-4 text-2xl font-bold text-foreground">{t("title")}</h1>
          <p className="mb-8 max-w-sm text-center text-sm text-gray-600 dark:text-gray-400">
            {t("description")}
          </p>
          <ContributeResultButton href="/contribute" variant="outline">
            {t("tryAgain")}
          </ContributeResultButton>
          <ContactUsLink />
        </div>
      </div>
    </div>
  );
}
