import Image from "next/image";
import { getTranslations } from "next-intl/server";
import HexBackground from "@/components/ui/HexBackground";
import { HexagonCard, AuthLinks } from "@/components/auth/shared";
import { theme } from "@/lib/theme";

type SearchParams = { email?: string };

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const t = await getTranslations("Auth");
  const { email } = await searchParams;
  const safeEmail = typeof email === "string" ? email : "";

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: theme.pageBackground }}>
      <div
        className="tott-auth-top-band absolute right-0 top-0 left-0 z-0"
        style={{
          height: "220px",
          background: theme.authBandGradient,
        }}
      >
        <HexBackground />
      </div>
      <div className="fixed inset-0 -z-10" style={{ background: theme.pageBackground }} />
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 pt-16">
        <div className="w-full max-w-3xl">
          <div className="mb-8 text-center">
            <div className="mb-6 flex justify-center">
              <Image src="/images/Brand.png" alt="" width={120} height={48} className="h-12 w-auto object-contain" />
            </div>
          </div>

          <h1 className="mb-2 text-center text-xl font-semibold text-foreground">{t("pages.checkEmail.title")}</h1>
          <p className="mx-auto mb-6 max-w-md text-center text-sm text-neutral-400">{t("pages.checkEmail.intro")}</p>

          <HexagonCard size="medium">
            <div className="flex w-full max-w-md flex-col items-center text-center">
              <div
                className="mb-6 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: `${theme.accentGold}33` }}
                aria-hidden
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={theme.accentGold}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h2 className="mb-3 text-lg font-semibold text-neutral-100">{t("pages.checkEmail.cardTitle")}</h2>
              <p className="mx-auto mb-3 max-w-sm text-sm leading-relaxed text-neutral-400">
                {t("pages.checkEmail.cardBody")}
              </p>
              {safeEmail ? (
                <p className="mx-auto mb-2 max-w-sm break-all text-xs text-neutral-500">
                  {t("pages.checkEmail.sentTo", { email: safeEmail })}
                </p>
              ) : null}
              <p className="mx-auto mb-2 max-w-sm text-xs text-neutral-500">{t("pages.checkEmail.spamHint")}</p>
            </div>
          </HexagonCard>

          <AuthLinks
            primaryText={t("pages.checkEmail.wrongAddress")}
            primaryHref="/auth/register"
            primaryLinkLabel={t("pages.checkEmail.signUpAgain")}
            backHref="/"
          />
        </div>
      </div>
    </div>
  );
}
