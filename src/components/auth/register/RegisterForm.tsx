"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PersonIcon, EmailIcon, LockIcon, PhoneIcon } from "@/components/ui/icons";
import { AuthInput } from "@/components/ui/AuthInput";
import { theme } from "@/lib/theme";
import { useRegisterForm } from "./useRegisterForm";

export function RegisterForm() {
  const t = useTranslations("Auth.forms.register");
  const [showPassword, setShowPassword] = useState(false);
  const { loading, error, agreedToTerms, setAgreedToTerms, handleSubmit } = useRegisterForm();

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md space-y-6">
      {error && (
        <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AuthInput
          id="username"
          name="username"
          type="text"
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AuthInput
          id="full_name"
          name="full_name"
          type="text"
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
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="text-neutral-500 hover:text-foreground"
            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
            suppressHydrationWarning
          >
            👁
          </button>
        }
      />
      <div className="flex items-start gap-3">
        <input
          id="terms"
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className={`mt-1 rounded bg-black text-[${theme.accentGoldFocus}] focus:ring-[${theme.accentGoldFocus}]`}
          style={{ borderColor: theme.inputBorder }}
          suppressHydrationWarning
        />
        <label htmlFor="terms" className="cursor-default select-none text-sm text-foreground">
          {t("termsLead")}{" "}
          <Link href="/terms" className="hover:underline" style={{ color: theme.accentGold }}>
            {t("termsLink")}
          </Link>{" "}
          {t("termsAnd")}{" "}
          <Link href="/privacy" className="hover:underline" style={{ color: theme.accentGold }}>
            {t("privacyLink")}
          </Link>
          {t("termsEnd")}
        </label>
      </div>
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
