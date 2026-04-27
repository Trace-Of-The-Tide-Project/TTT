import { getTranslations } from "next-intl/server";
import {
  AuthCardFrame,
  AuthFooterLinks,
  AuthPageShell,
} from "@/components/auth/shared";
import { ForgotPasswordForm } from "@/components/auth/forgot-password";

export default async function ForgotPasswordPage() {
  const t = await getTranslations("Auth");

  return (
    <AuthPageShell
      title={t("pages.forgotPassword.title")}
      subtitle={t("pages.forgotPassword.subtitle")}
      footer={
        <AuthFooterLinks
          backHref="/auth/login"
          backLabel={t("login")}
        />
      }
    >
      <AuthCardFrame
        maxWidthClass="max-w-md"
        minHeightPx={0}
        bodyClassName="px-6 py-6 sm:px-8 sm:py-8"
      >
        <ForgotPasswordForm />
      </AuthCardFrame>
    </AuthPageShell>
  );
}
