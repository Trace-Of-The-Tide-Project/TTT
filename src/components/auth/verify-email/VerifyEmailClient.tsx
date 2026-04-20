"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { EmailIcon } from "@/components/ui/icons";
import { AuthInput } from "@/components/ui/AuthInput";
import { theme } from "@/lib/theme";
import { resendVerificationEmail, verifyEmail } from "@/services/auth.service";

type Status = "loading" | "success" | "error" | "missing";

export function VerifyEmailClient() {
  const t = useTranslations("Auth.forms.verifyEmail");
  const router = useRouter();
  const searchParams = useSearchParams();
  const ran = useRef(false);
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resendBusy, setResendBusy] = useState(false);
  const [resendFeedback, setResendFeedback] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const e = searchParams.get("email");
    if (e) setResendEmail(e);
  }, [searchParams]);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("missing");
      setMessage(t("missingToken"));
      return;
    }
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        const result = await verifyEmail(token);
        setStatus("success");
        setMessage(result.loggedIn ? t("successLoggedIn") : t("successSignIn"));
        const dest = result.loggedIn ? "/profile" : "/auth/login";
        router.replace(dest);
        router.refresh();
      } catch (err) {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : t("verifyError"));
      }
    })();
  }, [router, searchParams, t]);

  async function handleResendVerification() {
    setResendFeedback(null);
    setResendBusy(true);
    try {
      await resendVerificationEmail(resendEmail);
      setResendFeedback({
        tone: "success",
        text: t("resendSuccess"),
      });
    } catch (err) {
      setResendFeedback({
        tone: "error",
        text: err instanceof Error ? err.message : t("resendError"),
      });
    } finally {
      setResendBusy(false);
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center text-center">
      {status === "loading" && (
        <>
          <div
            className="mb-6 h-12 w-12 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: `${theme.accentGold} transparent transparent transparent` }}
            aria-hidden
          />
          <h1 className="mb-2 text-xl font-semibold text-foreground">{t("loadingTitle")}</h1>
          <p className="text-sm text-foreground/70">{t("loadingSubtitle")}</p>
        </>
      )}
      {(status === "error" || status === "missing") && (
        <>
          <div
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-red-400/40 bg-red-500/20"
            aria-hidden
          >
            <span className="text-2xl text-red-300">!</span>
          </div>
          <h1 className="mb-2 text-xl font-semibold text-foreground">{t("errorTitle")}</h1>
          <p className="mb-8 text-sm text-foreground/70">{message}</p>

          <div className="mt-2 w-full space-y-4 border-t border-foreground/10 pt-8 text-left">
            <p className="text-center text-sm font-medium text-foreground">{t("resendSectionTitle")}</p>
            <AuthInput
              id="resend-email"
              name="resend-email"
              type="email"
              label={t("resendEmailLabel")}
              placeholder={t("resendEmailPlaceholder")}
              autoComplete="email"
              value={resendEmail}
              onChange={(ev) => setResendEmail(ev.target.value)}
              icon={<EmailIcon />}
            />
            {resendFeedback && (
              <p
                className={`text-center text-sm ${resendFeedback.tone === "success" ? "text-green-400" : "text-red-400"}`}
              >
                {resendFeedback.text}
              </p>
            )}
            <button
              type="button"
              onClick={() => void handleResendVerification()}
              disabled={resendBusy}
              className="w-full cursor-pointer select-none rounded-lg py-3 font-medium text-black transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: theme.accentGold }}
            >
              {resendBusy ? t("resendSubmitting") : t("resendSubmit")}
            </button>
          </div>

          <Link
            href="/auth/login"
            className="mt-8 block w-full cursor-pointer select-none rounded-lg border border-foreground/20 py-3 text-center font-medium text-foreground transition-colors hover:opacity-90"
          >
            {t("backToLogin")}
          </Link>
        </>
      )}
      {status === "success" && (
        <>
          <div
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-green-400/40 bg-green-500/20"
            aria-hidden
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className="text-green-400"
            >
              <path d="M20 6L9 17l-5-5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="mb-2 text-xl font-semibold text-foreground">{t("successTitle")}</h1>
          <p className="text-sm text-foreground/70">{message}</p>
        </>
      )}
    </div>
  );
}
