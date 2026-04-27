import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import {
  AuthCardFrame,
  AuthFooterLinks,
  AuthInlineLink,
  AuthPageShell,
} from "@/components/auth/shared";
import { RegisterForm } from "@/components/auth/register";

export default async function RegisterPage() {
  const t = await getTranslations("Auth");

  return (
    <AuthPageShell title={t("pages.register.title")} footer={<AuthFooterLinks />}>
      <AuthCardFrame>
        <Suspense
          fallback={
            <div className="h-64 w-full max-w-md animate-pulse rounded-md bg-white/5" />
          }
        >
          <RegisterForm />
        </Suspense>
        <AuthInlineLink
          text={t("pages.register.hasAccount")}
          href="/auth/login"
          label={t("pages.register.loginLink")}
          className="mt-6"
        />
      </AuthCardFrame>
    </AuthPageShell>
  );
}
