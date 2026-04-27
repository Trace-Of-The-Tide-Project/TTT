"use client";

import { useTranslations } from "next-intl";
import { AuthInput } from "@/components/ui/AuthInput";
import { AuthFormBanner, AuthSubmitButton } from "@/components/auth/shared";
import { EmailIcon } from "@/components/ui/icons";
import { useForgotPasswordForm } from "./useForgotPasswordForm";

export function ForgotPasswordForm() {
  const t = useTranslations("Auth.forms.forgotPassword");
  const { loading, error, handleSubmit } = useForgotPasswordForm();

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md space-y-5">
      {error ? <AuthFormBanner>{error}</AuthFormBanner> : null}
      <AuthInput
        id="email"
        name="email"
        type="email"
        label={t("emailLabel")}
        placeholder={t("emailPlaceholder")}
        required
        autoComplete="email"
        icon={<EmailIcon />}
      />
      <AuthSubmitButton loading={loading} loadingLabel={t("submitting")}>
        {t("submit")}
      </AuthSubmitButton>
    </form>
  );
}
