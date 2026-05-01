import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import {
  AuthFooterLinks,
  AuthHexFrame,
  AuthInlineLink,
  AuthPageShell,
} from "@/components/auth/shared";
import { RegisterForm } from "@/components/auth/register";

export default async function RegisterPage() {
  const t = await getTranslations("Auth");

  return (
    <AuthPageShell
      subtitle={t("pages.register.subtitle")}
      footer={<AuthFooterLinks />}
    >
      <AuthHexFrame>
        <Suspense
          fallback={
            <div className="h-40 w-full animate-pulse rounded-md bg-white/5" />
          }
        >
          <RegisterForm />
        </Suspense>
        <AuthInlineLink
          text={t("pages.register.hasAccount")}
          href="/auth/login"
          label={t("pages.register.loginLink")}
          className="mt-2"
        />
      </AuthHexFrame>
    </AuthPageShell>
  );
}
