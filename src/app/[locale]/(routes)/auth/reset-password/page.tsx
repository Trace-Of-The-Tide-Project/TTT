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
    <AuthPageShell footer={<AuthFooterLinks />}>
      <AuthHexFrame
        header={
          <>
            <h1 className="text-sm font-semibold leading-tight text-foreground min-[380px]:text-base sm:text-lg md:text-xl">
              {t("pages.resetPassword.title")}
            </h1>
            <p className="max-w-md text-[11px] leading-relaxed text-[color:var(--tott-auth-subtitle)] min-[380px]:text-xs sm:text-sm">
              {t("pages.resetPassword.subtitle")}
            </p>
          </>
        }
      >
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
