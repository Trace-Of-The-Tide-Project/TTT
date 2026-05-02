import { getTranslations } from "next-intl/server";
import {
  AuthFooterLinks,
  AuthHexFrame,
  AuthPageShell,
} from "@/components/auth/shared";
import { ForgotPasswordForm } from "@/components/auth/forgot-password";

export default async function ForgotPasswordPage() {
  const t = await getTranslations("Auth");

  return (
    <AuthPageShell
      footer={<AuthFooterLinks backHref="/auth/login" backLabel={t("login")} />}
    >
      <AuthHexFrame
        header={
          <>
            <h1 className="text-sm font-semibold leading-tight text-foreground min-[380px]:text-base sm:text-lg md:text-xl">
              {t("pages.forgotPassword.title")}
            </h1>
            <p className="max-w-md text-[11px] leading-relaxed text-[color:var(--tott-auth-subtitle)] min-[380px]:text-xs sm:text-sm">
              {t("pages.forgotPassword.subtitle")}
            </p>
          </>
        }
      >
        <ForgotPasswordForm />
      </AuthHexFrame>
    </AuthPageShell>
  );
}
