import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import {
  AuthFooterLinks,
  AuthHexFrame,
  AuthInlineLink,
  AuthPageShell,
} from "@/components/auth/shared";
import { ResetPasswordForm } from "@/components/auth/reset-password";

export default async function ResetPasswordPage() {
  const t = await getTranslations("Auth");

  return (
    <AuthPageShell
      title={t("pages.resetPassword.title")}
      subtitle={t("pages.resetPassword.subtitle")}
      footer={<AuthFooterLinks />}
    >
      <AuthHexFrame>
        <Suspense
          fallback={
            <div className="h-64 w-full max-w-md animate-pulse rounded-md bg-white/5" />
          }
        >
          <ResetPasswordForm />
        </Suspense>
        <AuthInlineLink
          text={t("shared.linkToLoginLead")}
          href="/auth/login"
          label={t("login")}
          className="mt-4"
        />
      </AuthHexFrame>
    </AuthPageShell>
  );
}
