"use client";

import { useTranslations } from "next-intl";
import { EmailIcon } from "@/components/ui/icons";
import { AuthInput } from "@/components/ui/AuthInput";
import { theme } from "@/lib/theme";
import { useForgotPasswordForm } from "./useForgotPasswordForm";

export function ForgotPasswordForm() {
  const t = useTranslations("Auth.forms.forgotPassword");
  const { loading, error, handleSubmit } = useForgotPasswordForm();

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md space-y-6">
      {error && (
        <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}
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
      <button
        type="submit"
        disabled={loading}
        className="w-full cursor-pointer select-none rounded-lg py-3 font-medium text-black transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        style={{ backgroundColor: theme.accentGold }}
        suppressHydrationWarning
      >
        {loading ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
