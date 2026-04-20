import { Suspense } from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import HexBackground from "@/components/ui/HexBackground";
import { HexagonCard, AuthLinks } from "@/components/auth/shared";
import { RegisterForm } from "@/components/auth/register";
import { theme } from "@/lib/theme";

export default async function RegisterPage() {
  const t = await getTranslations("Auth");

  return (
    <div
      className="relative min-h-screen overflow-x-hidden overflow-y-auto"
      style={{ background: theme.pageBackground }}
    >
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
      <div className="relative flex min-h-screen flex-col items-center justify-center px-8 py-12 pt-16 sm:px-8 md:px-10">
        <div className="w-full max-w-5xl">
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
          <h1 className="mb-6 cursor-crosshair select-none text-center text-xl font-semibold text-foreground">
            {t("pages.register.title")}
          </h1>
          <HexagonCard size="xl">
            <Suspense fallback={<div className="h-64 w-full max-w-md animate-pulse rounded-lg bg-white/5" />}>
              <RegisterForm />
            </Suspense>
          </HexagonCard>
          <AuthLinks
            primaryText={t("pages.register.hasAccount")}
            primaryHref="/auth/login"
            primaryLinkLabel={t("pages.register.loginLink")}
            backHref="/"
          />
        </div>
      </div>
    </div>
  );
}
