"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { signup, logout } from "@/services/auth.service";
import { useAuth } from "@/components/providers/AuthProvider";
import { parseAuthErrorMessage } from "@/lib/auth/parse-auth-error";
import type { SignupRequest } from "@/types/auth.types";

type RegisterSubmitEvent = React.FormEvent<HTMLFormElement>;

export function useRegisterForm() {
  const t = useTranslations("Auth.forms.register");
  const router = useRouter();
  const { refresh } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  async function handleSubmit(e: RegisterSubmitEvent) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;

    const data: SignupRequest = {
      username: (form.elements.namedItem("username") as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem("email") as HTMLInputElement).value.trim(),
      password: (form.elements.namedItem("password") as HTMLInputElement).value,
      full_name: (form.elements.namedItem("full_name") as HTMLInputElement).value.trim(),
      phone_number: (form.elements.namedItem("phone_number") as HTMLInputElement)?.value.trim() ?? "",
    };

    if (!agreedToTerms) {
      setError(t("errorTerms"));
      return;
    }
    if (data.password.length < 8) {
      setError(t("errorPasswordLength"));
      return;
    }
    if (!data.username || !data.email || !data.full_name) {
      setError(t("errorRequired"));
      return;
    }

    setLoading(true);
    try {
      const result = await signup(data);

      // Force the email-verification gate even when the API auto-issues a session;
      // dropping the cookie keeps the user on the well-defined "check inbox" path.
      if ("user" in result) {
        await logout();
      }

      const email = "pendingEmailVerification" in result ? result.email : result.user.email;
      await refresh();
      router.push(`/auth/check-email?email=${encodeURIComponent(email)}`);
      router.refresh();
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      const fallback = t("errorFailed", { reason: String(status ?? t("networkReason")) });
      setError(parseAuthErrorMessage(err, fallback));
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    agreedToTerms,
    setAgreedToTerms,
    handleSubmit,
  };
}
