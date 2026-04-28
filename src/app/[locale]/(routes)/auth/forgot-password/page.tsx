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
      title={t("pages.forgotPassword.title")}
      subtitle={t("pages.forgotPassword.subtitle")}
      footer={<AuthFooterLinks backHref="/auth/login" backLabel={t("login")} />}
    >
      <AuthHexFrame minHeightPx={520}>
        <ForgotPasswordForm />
      </AuthHexFrame>
    </AuthPageShell>
  );
}
