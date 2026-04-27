import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import {
  AuthCardFrame,
  AuthFooterLinks,
  AuthInlineLink,
  AuthPageShell,
} from "@/components/auth/shared";
import { LoginForm } from "@/components/auth/login";

export default async function LoginPage() {
  const t = await getTranslations("Auth");

  return (
    <AuthPageShell title={t("pages.login.title")} footer={<AuthFooterLinks />}>
      <AuthCardFrame>
        <Suspense
          fallback={
            <div className="h-64 w-full max-w-md animate-pulse rounded-md bg-white/5" />
          }
        >
          <LoginForm />
        </Suspense>
        <AuthInlineLink
          text={t("pages.login.noAccount")}
          href="/auth/register"
          label={t("pages.login.signUp")}
          className="mt-6"
        />
      </AuthCardFrame>
    </AuthPageShell>
  );
}
