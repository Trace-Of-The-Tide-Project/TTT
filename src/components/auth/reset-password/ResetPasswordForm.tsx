"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { LockIcon } from "@/components/ui/icons";
import { AuthInput } from "@/components/ui/AuthInput";
import { theme } from "@/lib/theme";

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
    const confirmPassword = (form.elements.namedItem("confirmPassword") as HTMLInputElement).value;

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
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password, confirmPassword }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError((data.message as string) || t("errorGeneric"));
        setLoading(false);
        return;
      }
      router.push("/auth/success");
      router.refresh();
    } catch {
      setError(t("errorNetwork"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md space-y-6">
      {error && (
        <p className="rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}
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
          <button
            type="button"
            onClick={() => setShowConfirm((p) => !p)}
            className="text-neutral-500 hover:text-foreground"
            aria-label={showConfirm ? t("hidePassword") : t("showPassword")}
            suppressHydrationWarning
          >
            👁
          </button>
        }
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
