"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { EmailIcon, LockIcon } from "@/components/ui/icons";
import { AuthInput } from "@/components/ui/AuthInput";
import { theme } from "@/lib/theme";
import { useLoginForm } from "./useLoginForm";

export function LoginForm() {
  const t = useTranslations("Auth.forms.login");
  const [showPassword, setShowPassword] = useState(false);
  const { loading, error, registered, email, setEmail, rememberMe, setRememberMe, handleSubmit } =
    useLoginForm();

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md space-y-6">
      {registered === "1" && (
        <p className="rounded-lg border border-green-400/30 bg-green-400/10 px-3 py-2 text-sm text-green-400">
          {t("registeredBanner")}
        </p>
      )}
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
            className="text-sm hover:underline"
            style={{ color: theme.accentGold }}
          >
            {t("forgotPassword")}
          </Link>
        }
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
      <div className="flex items-center gap-3">
        <input
          id="remember"
          type="checkbox"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className={`rounded bg-black text-[${theme.accentGoldFocus}] focus:ring-[${theme.accentGoldFocus}]`}
          style={{ borderColor: theme.inputBorder }}
          suppressHydrationWarning
        />
        <label htmlFor="remember" className="cursor-default select-none text-sm text-foreground">
          {t("rememberMe")}
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
