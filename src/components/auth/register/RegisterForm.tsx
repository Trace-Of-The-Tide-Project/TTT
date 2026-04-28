"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AuthInput } from "@/components/ui/AuthInput";
import {
  AuthFormBanner,
  AuthSubmitButton,
  PasswordVisibilityToggle,
  TermsCheckbox,
} from "@/components/auth/shared";
import { EmailIcon, LockIcon, PersonIcon, PhoneIcon } from "@/components/ui/icons";
import { useRegisterForm } from "./useRegisterForm";

export function RegisterForm() {
  const t = useTranslations("Auth.forms.register");
  const [showPassword, setShowPassword] = useState(false);
  const { loading, error, agreedToTerms, setAgreedToTerms, handleSubmit } = useRegisterForm();

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full space-y-2.5">
      {error ? <AuthFormBanner>{error}</AuthFormBanner> : null}

      {/* Username + Email */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <AuthInput
          id="username"
          name="username"
          label={t("usernameLabel")}
          placeholder={t("usernamePlaceholder")}
          required
          autoComplete="username"
          icon={<PersonIcon />}
        />
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
      </div>

      {/* Full name + Phone number */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <AuthInput
          id="full_name"
          name="full_name"
          label={t("fullNameLabel")}
          placeholder={t("fullNamePlaceholder")}
          required
          autoComplete="name"
          icon={<PersonIcon />}
        />
        <AuthInput
          id="phone_number"
          name="phone_number"
          type="tel"
          label={t("phoneLabel")}
          labelRight={
            <span className="text-xs font-normal text-[color:var(--tott-auth-input-placeholder)]">
              {t("phoneOptional")}
            </span>
          }
          placeholder={t("phonePlaceholder")}
          autoComplete="tel"
          icon={<PhoneIcon />}
        />
      </div>

      <AuthInput
        id="password"
        name="password"
        type={showPassword ? "text" : "password"}
        label={t("passwordLabel")}
        placeholder={t("passwordPlaceholder")}
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

      <TermsCheckbox checked={agreedToTerms} onChange={setAgreedToTerms} />

      <AuthSubmitButton loading={loading} loadingLabel={t("submitting")}>
        {t("submit")}
      </AuthSubmitButton>
    </form>
  );
}
