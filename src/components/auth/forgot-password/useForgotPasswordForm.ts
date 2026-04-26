"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/services/api";

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
      await api.post("/auth/forgot-password", { email });
      if (typeof window !== "undefined") {
        sessionStorage.setItem("forgot-password-email", email);
      }
      router.push("/auth/forgot-password/email-sent");
      router.refresh();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || t("errorGeneric"));
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
