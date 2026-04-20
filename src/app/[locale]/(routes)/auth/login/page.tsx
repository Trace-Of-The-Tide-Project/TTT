import { Suspense } from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import HexBackground from "@/components/ui/HexBackground";
import { HexagonCard, AuthLinks } from "@/components/auth/shared";
import { LoginForm } from "@/components/auth/login";
import { theme } from "@/lib/theme";

export default async function LoginPage() {
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
          <h1 className="mb-6 cursor-default select-none text-center text-xl font-semibold text-foreground">
            {t("pages.login.title")}
          </h1>

          <HexagonCard>
            <Suspense fallback={<div className="h-64 w-full max-w-md animate-pulse rounded-lg bg-white/5" />}>
              <LoginForm />
            </Suspense>
          </HexagonCard>

          <AuthLinks
            primaryText={t("pages.login.noAccount")}
            primaryHref="/auth/register"
            primaryLinkLabel={t("pages.login.signUp")}
            backHref="/"
          />
        </div>
      </div>
    </div>
  );
}
