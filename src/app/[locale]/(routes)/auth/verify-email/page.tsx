import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import {
  AuthFooterLinks,
  AuthHexFrame,
  AuthInlineLink,
  AuthPageShell,
} from "@/components/auth/shared";
import { VerifyEmailClient } from "@/components/auth/verify-email";

export default async function VerifyEmailPage() {
  const t = await getTranslations("Auth");

  return (
    <AuthPageShell
      title={t("pages.verifyEmail.title")}
      subtitle={t("pages.verifyEmail.subtitle")}
      footer={<AuthFooterLinks />}
    >
      <AuthHexFrame>
        <Suspense
          fallback={
            <div className="h-40 w-full max-w-md animate-pulse rounded-md bg-white/5" />
          }
        >
          <VerifyEmailClient />
        </Suspense>
        <AuthInlineLink
          text={t("pages.verifyEmail.wrongAccount")}
          href="/auth/register"
          label={t("pages.verifyEmail.createAccount")}
          className="mt-4"
        />
      </AuthHexFrame>
    </AuthPageShell>
  );
}
