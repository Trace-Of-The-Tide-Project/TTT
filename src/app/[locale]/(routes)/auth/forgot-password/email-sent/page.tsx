"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  AuthFooterLinks,
  AuthHexFrame,
  AuthPageShell,
  AuthSubmitButton,
} from "@/components/auth/shared";

const RESEND_COOLDOWN_SEC = 48;

function MailIcon() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

export default function EmailSentPage() {
  const t = useTranslations("Auth");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SEC);
  const [loading, setLoading] = useState(false);

  // Initial cooldown is computed from sessionStorage (browser-only),
  // so this must run in an effect post-hydration; the setState is the
  // bridge. React 19's set-state-in-effect rule has no clean
  // alternative for client-only init that reads external storage.
  useEffect(() => {
    const stored =
      typeof window !== "undefined"
        ? sessionStorage.getItem("forgot-password-email-sent-at")
        : null;
    const sentAt = stored ? parseInt(stored, 10) : Date.now();
    if (!stored) {
      sessionStorage.setItem("forgot-password-email-sent-at", String(Date.now()));
    }
    const elapsed = Math.floor((Date.now() - sentAt) / 1000);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSecondsLeft(Math.max(0, RESEND_COOLDOWN_SEC - elapsed));
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  function handleResend() {
    const email =
      typeof window !== "undefined"
        ? sessionStorage.getItem("forgot-password-email")
        : null;
    if (!email || loading || secondsLeft > 0) return;
    setLoading(true);
    setTimeout(() => {
      sessionStorage.setItem("forgot-password-email-sent-at", String(Date.now()));
      setSecondsLeft(RESEND_COOLDOWN_SEC);
      setLoading(false);
    }, 800);
  }

  const canResend = secondsLeft === 0;
  const buttonLabel = loading
    ? t("pages.emailSent.resendSending")
    : canResend
      ? t("pages.emailSent.resendReady")
      : t("pages.emailSent.resendCountdown", { seconds: secondsLeft });

  return (
    <AuthPageShell
      footer={<AuthFooterLinks backHref="/auth/login" backLabel={t("login")} />}
    >
      <AuthHexFrame
        header={
          <>
            <h1 className="text-sm font-semibold leading-tight text-foreground min-[380px]:text-base sm:text-lg md:text-xl">
              {t("pages.emailSent.title")}
            </h1>
            <p className="max-w-md text-[11px] leading-relaxed text-[color:var(--tott-auth-subtitle)] min-[380px]:text-xs sm:text-sm">
              {t("pages.emailSent.subtitle")}
            </p>
          </>
        }
      >
        <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
          <div className="mb-8 text-[color:var(--tott-auth-input-icon)]">
            <MailIcon />
          </div>
          <AuthSubmitButton
            type="button"
            onClick={handleResend}
            disabled={!canResend}
            loading={loading}
          >
            {buttonLabel}
          </AuthSubmitButton>
        </div>
      </AuthHexFrame>
    </AuthPageShell>
  );
}
