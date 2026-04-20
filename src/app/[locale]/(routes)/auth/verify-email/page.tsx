import { Suspense } from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import HexBackground from "@/components/ui/HexBackground";
import { HexagonCard, AuthLinks } from "@/components/auth/shared";
import { VerifyEmailClient } from "@/components/auth/verify-email";
import { theme } from "@/lib/theme";

export default async function VerifyEmailPage() {
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
          <h1 className="mb-2 text-center text-xl font-semibold text-foreground">{t("pages.verifyEmail.title")}</h1>
          <p className="mx-auto mb-6 max-w-md text-center text-sm text-neutral-400">
            {t("pages.verifyEmail.subtitle")}
          </p>
          <HexagonCard size="medium">
            <Suspense fallback={<div className="h-40 w-full max-w-md animate-pulse rounded-lg bg-white/5" />}>
              <VerifyEmailClient />
            </Suspense>
          </HexagonCard>
          <AuthLinks
            primaryText={t("pages.verifyEmail.wrongAccount")}
            primaryHref="/auth/register"
            primaryLinkLabel={t("pages.verifyEmail.createAccount")}
            backHref="/"
          />
        </div>
      </div>
    </div>
  );
}
