"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { requestPasswordReset } from "@/services/auth.service";
import { parseAuthErrorMessage } from "@/lib/auth/parse-auth-error";

type ForgotPasswordSubmitEvent = React.FormEvent<HTMLFormElement>;

export function useForgotPasswordForm() {
  const t = useTranslations("Auth.forms.forgotPassword");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: ForgotPasswordSubmitEvent) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();

    if (!email) {
      setError(t("errorEmail"));
      return;
    }

    setLoading(true);
    try {
      await requestPasswordReset(email);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("forgot-password-email", email);
      }
      router.push("/auth/forgot-password/email-sent");
      router.refresh();
    } catch (err) {
      setError(parseAuthErrorMessage(err, t("errorGeneric")));
    } finally {
      setLoading(false);
    }
  }

  return {
    loading,
    error,
    handleSubmit,
  };
}
