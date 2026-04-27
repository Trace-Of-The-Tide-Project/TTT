"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { safeCallbackPath } from "@/lib/auth/safe-callback-url";
import { parseAuthErrorMessage } from "@/lib/auth/parse-auth-error";
import { useAuth } from "@/components/providers/AuthProvider";
import { login } from "@/services/auth.service";
import { getNavAccountHref } from "@/lib/auth/nav-account-href";

const DEFAULT_REDIRECT = "/profile";

export function useLoginForm() {
  const t = useTranslations("Auth.forms.login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();

  const registered = searchParams.get("registered");
  const callbackUrl = safeCallbackPath(searchParams.get("callbackUrl"));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = e.currentTarget;
    const trimmed = email.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    if (!trimmed || !password) {
      setError(t("errorMissing"));
      return;
    }

    setLoading(true);
    try {
      const session = await login({ email: trimmed, password });
      await refresh();

      const dest = callbackUrl ?? getNavAccountHref(session.user) ?? DEFAULT_REDIRECT;
      router.push(dest);
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
    registered,
    email,
    setEmail,
    rememberMe,
    setRememberMe,
    handleSubmit,
  };
}
