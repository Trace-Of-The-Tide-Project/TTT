"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { signup, logout } from "@/services/auth.service";
import { useAuth } from "@/components/providers/AuthProvider";
import { parseAuthErrorMessage } from "@/lib/auth/parse-auth-error";
import type { SignupRequest } from "@/types/auth.types";

type RegisterSubmitEvent = React.FormEvent<HTMLFormElement>;

function deriveUsername(email: string, firstName: string, lastName: string): string {
  const local = email.split("@")[0] ?? "";
  const cleaned = local.toLowerCase().replace(/[^a-z0-9._-]/g, "");
  if (cleaned.length >= 3) return cleaned;
  const fallback = `${firstName}${lastName}`.toLowerCase().replace(/[^a-z0-9]/g, "");
  return fallback || `user${Date.now().toString(36)}`;
}

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

    const firstName = (form.elements.namedItem("first_name") as HTMLInputElement).value.trim();
    const lastName = (form.elements.namedItem("last_name") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const phone = (form.elements.namedItem("phone_number") as HTMLInputElement)?.value.trim() ?? "";
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const data: SignupRequest = {
      username: deriveUsername(email, firstName, lastName),
      email,
      password,
      full_name: `${firstName} ${lastName}`.trim(),
      phone_number: phone,
    };

    if (!agreedToTerms) {
      setError(t("errorTerms"));
      return;
    }
    if (data.password.length < 8) {
      setError(t("errorPasswordLength"));
      return;
    }
    if (!firstName || !lastName || !data.email) {
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

      const verifiedEmail = "pendingEmailVerification" in result ? result.email : result.user.email;
      await refresh();
      router.push(`/auth/check-email?email=${encodeURIComponent(verifiedEmail)}`);
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
