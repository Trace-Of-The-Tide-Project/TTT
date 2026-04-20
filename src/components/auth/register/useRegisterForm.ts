"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import axios from "axios";
import { clearStoredAuth, signup } from "@/services/auth.service";
import type { SignupRequest } from "@/types/auth.types";

type RegisterSubmitEvent = React.FormEvent<HTMLFormElement>;

export function useRegisterForm() {
  const t = useTranslations("Auth.forms.register");
  const router = useRouter();
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
      phone_number: (form.elements.namedItem("phone_number") as HTMLInputElement).value.trim(),
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
      // Require the emailed link to continue: discard any session the API might have returned on signup.
      clearStoredAuth();
      const email =
        "pendingEmailVerification" in result ? result.email : result.user.email;
      router.push(`/auth/check-email?email=${encodeURIComponent(email)}`);
      router.refresh();
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Signup error:", err);
      }
      const errWithResponse = err as {
        response?: { status?: number; data?: Record<string, unknown> };
        message?: string;
      };
      const data = errWithResponse.response?.data;
      let msg: string | undefined;
      if (data) {
        const inner = data.data as { message?: string } | undefined;
        const rawMsg = (inner?.message ?? data.message) as string | string[] | undefined;
        msg = Array.isArray(rawMsg) ? rawMsg[0] : rawMsg;
        if (!msg && typeof data.error === "string") msg = data.error;
      }
      if (!msg && (axios.isAxiosError(err) || errWithResponse.message)) {
        msg = (err as Error).message;
      }
      const reason = String(errWithResponse.response?.status ?? t("networkReason"));
      setError(msg ?? t("errorFailed", { reason }));
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
