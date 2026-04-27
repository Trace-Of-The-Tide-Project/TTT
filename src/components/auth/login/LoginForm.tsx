"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AuthInput } from "@/components/ui/AuthInput";
import {
  AuthCheckbox,
  AuthFormBanner,
  AuthSubmitButton,
  PasswordVisibilityToggle,
} from "@/components/auth/shared";
import { EmailIcon, LockIcon } from "@/components/ui/icons";
import { useLoginForm } from "./useLoginForm";

export function LoginForm() {
  const t = useTranslations("Auth.forms.login");
  const [showPassword, setShowPassword] = useState(false);
  const {
    loading,
    error,
    registered,
    email,
    setEmail,
    rememberMe,
    setRememberMe,
    handleSubmit,
  } = useLoginForm();

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-md space-y-5">
      {registered === "1" ? (
        <AuthFormBanner tone="success">{t("registeredBanner")}</AuthFormBanner>
      ) : null}
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
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <AuthInput
        id="password"
        name="password"
        type={showPassword ? "text" : "password"}
        label={t("passwordLabel")}
        placeholder={t("passwordPlaceholder")}
        required
        autoComplete="current-password"
        icon={<LockIcon />}
        labelRight={
          <Link
            href="/auth/forgot-password"
            className="text-sm text-[#CBA158] hover:underline"
          >
            {t("forgotPassword")}
          </Link>
        }
        rightSlot={
          <PasswordVisibilityToggle
            visible={showPassword}
            onToggle={() => setShowPassword((v) => !v)}
            showLabel={t("showPassword")}
            hideLabel={t("hidePassword")}
          />
        }
      />

      <AuthCheckbox id="rememberMe" checked={rememberMe} onChange={setRememberMe}>
        {t("rememberMe")}
      </AuthCheckbox>

      <AuthSubmitButton loading={loading} loadingLabel={t("submitting")}>
        {t("submit")}
      </AuthSubmitButton>
    </form>
  );
}
