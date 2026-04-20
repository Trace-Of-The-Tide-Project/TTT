"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { stripLocalePrefixesFromPath } from "@/lib/i18n/strip-locale-from-path";
import axios from "axios"
import { login } from "@/services/auth.service"
import type { LoginRequest } from "@/types/auth.types"

const REMEMBERED_EMAIL_KEY = "remembered_login_email"

export function useLoginForm() {
  const t = useTranslations("Auth.forms.login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const rawCallback = searchParams.get("callbackUrl")?.trim();
  const callbackUrl = stripLocalePrefixesFromPath(
    rawCallback && rawCallback.length > 0 ? rawCallback : "/admin",
  );
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [email, setEmail] = useState("")

  useEffect(() => {
    const savedEmail = window.localStorage.getItem(REMEMBERED_EMAIL_KEY)
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    const form = e.currentTarget

    const data: LoginRequest = {
      email: email.trim(),
      password: (form.elements.namedItem("password") as HTMLInputElement).value,
    }

    if (!data.email || !data.password) {
      setError(t("errorMissing"));
      return;
    }

    setLoading(true)
    try {
      if (rememberMe) {
        window.localStorage.setItem(REMEMBERED_EMAIL_KEY, data.email)
      } else {
        window.localStorage.removeItem(REMEMBERED_EMAIL_KEY)
      }

      await login(data);
      router.push(callbackUrl);
      router.refresh()
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("Login error:", err)
      }
      const errWithResponse = err as {
        response?: { status?: number; data?: Record<string, unknown> }
        message?: string
      }
      const data = errWithResponse.response?.data
      let msg: string | undefined
      if (data) {
        const inner = data.data as { message?: string } | undefined
        const rawMsg = (inner?.message ?? data.message) as string | string[] | undefined
        msg = Array.isArray(rawMsg) ? rawMsg[0] : rawMsg
        if (!msg && typeof data.error === "string") msg = data.error
      }
      if (!msg && (axios.isAxiosError(err) || errWithResponse.message)) {
        msg = (err as Error).message
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
    registered,
    email,
    setEmail,
    rememberMe,
    setRememberMe,
    handleSubmit,
  }
}
