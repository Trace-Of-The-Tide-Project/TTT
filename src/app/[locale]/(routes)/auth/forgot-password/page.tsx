import Image from "next/image";
import { getTranslations } from "next-intl/server";
import HexBackground from "@/components/ui/HexBackground";
import { HexagonCard, AuthLinks } from "@/components/auth/shared";
import { ForgotPasswordForm } from "@/components/auth/forgot-password";
import { theme } from "@/lib/theme";

export default async function ForgotPasswordPage() {
  const t = await getTranslations("Auth");

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: theme.pageBackground }}>
      <div
        className="absolute right-0 top-0 left-0 z-0"
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
              <Image
                src="/images/Brand.png"
                alt=""
                width={120}
                height={48}
                className="h-12 w-auto object-contain"
              />
            </div>
          </div>
          <h1 className="mb-2 text-center text-xl font-semibold text-foreground">{t("pages.forgotPassword.title")}</h1>
          <p className="mx-auto mb-6 max-w-md text-center text-sm text-neutral-400">
            {t("pages.forgotPassword.subtitle")}
          </p>
          <HexagonCard size="compact">
            <ForgotPasswordForm />
          </HexagonCard>

          <AuthLinks
            primaryText={t("shared.linkToLoginLead")}
            primaryHref="/auth/login"
            primaryLinkLabel={t("login")}
            backHref="/"
          />
        </div>
      </div>
    </div>
  );
}
