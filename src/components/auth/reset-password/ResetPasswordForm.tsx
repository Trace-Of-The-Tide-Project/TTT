"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { AuthInput } from "@/components/ui/AuthInput";
import {
  AuthFormBanner,
  AuthSubmitButton,
  PasswordVisibilityToggle,
} from "@/components/auth/shared";
import { LockIcon } from "@/components/ui/icons";
import { resetPassword } from "@/services/auth.service";
import { parseAuthErrorMessage } from "@/lib/auth/parse-auth-error";

export function ResetPasswordForm() {
  const t = useTranslations("Auth.forms.resetPassword");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = e.currentTarget;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement)
      .value;

    if (!token) {
      setError(t("errorInvalidToken"));
      return;
    }
    if (password.length < 8) {
      setError(t("errorPasswordLength"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("errorMismatch"));
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, newPassword: password, confirmPassword });
      router.push("/auth/success");
      router.refresh();
    } catch (err) {
      setError(parseAuthErrorMessage(err, t("errorGeneric")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md space-y-5">
      {error ? <AuthFormBanner>{error}</AuthFormBanner> : null}
      <AuthInput
        id="password"
        name="password"
        type={showPassword ? "text" : "password"}
        label={t("newPasswordLabel")}
        placeholder={t("newPasswordPlaceholder")}
        required
        minLength={8}
        autoComplete="new-password"
        icon={<LockIcon />}
        rightSlot={
          <PasswordVisibilityToggle
            visible={showPassword}
            onToggle={() => setShowPassword((v) => !v)}
            showLabel={t("showPassword")}
            hideLabel={t("hidePassword")}
          />
        }
      />
      <AuthInput
        id="confirmPassword"
        name="confirmPassword"
        type={showConfirm ? "text" : "password"}
        label={t("confirmLabel")}
        placeholder={t("confirmPlaceholder")}
        required
        minLength={8}
        autoComplete="new-password"
        icon={<LockIcon />}
        rightSlot={
          <PasswordVisibilityToggle
            visible={showConfirm}
            onToggle={() => setShowConfirm((v) => !v)}
            showLabel={t("showPassword")}
            hideLabel={t("hidePassword")}
          />
        }
      />
      <AuthSubmitButton loading={loading} loadingLabel={t("submitting")}>
        {t("submit")}
      </AuthSubmitButton>
    </form>
  );
}
