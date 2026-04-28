import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import {
  AuthFooterLinks,
  AuthHexFrame,
  AuthInlineLink,
  AuthPageShell,
} from "@/components/auth/shared";
import { LoginForm } from "@/components/auth/login";

export default async function LoginPage() {
  const t = await getTranslations("Auth");

  return (
    <AuthPageShell title={t("pages.login.title")} footer={<AuthFooterLinks />}>
      <AuthHexFrame>
        <Suspense
          fallback={
            <div className="h-40 w-full animate-pulse rounded-md bg-white/5" />
          }
        >
          <LoginForm />
        </Suspense>
        <AuthInlineLink
          text={t("pages.login.noAccount")}
          href="/auth/register"
          label={t("pages.login.signUp")}
          className="mt-2"
        />
      </AuthHexFrame>
    </AuthPageShell>
  );
}
