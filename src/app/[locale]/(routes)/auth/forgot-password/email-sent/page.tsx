"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  AuthCardFrame,
  AuthFooterLinks,
  AuthPageShell,
  AuthSubmitButton,
} from "@/components/auth/shared";

const RESEND_COOLDOWN_SEC = 48;

function MailIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
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
      title={t("pages.emailSent.title")}
      subtitle={t("pages.emailSent.subtitle")}
      footer={<AuthFooterLinks backHref="/auth/login" backLabel={t("login")} />}
    >
      <AuthCardFrame
        maxWidthClass="max-w-md"
        minHeightPx={0}
        bodyClassName="px-6 py-8 sm:px-8"
      >
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 text-neutral-400">
            <MailIcon />
          </div>
          <h2 className="mb-2 text-base font-semibold text-foreground">
            {t("pages.emailSent.cardTitle")}
          </h2>
          <p className="mb-6 max-w-xs text-sm leading-relaxed text-neutral-400">
            {t("pages.emailSent.cardBody")}
          </p>
          <AuthSubmitButton
            type="button"
            onClick={handleResend}
            disabled={!canResend}
            loading={loading}
          >
            {buttonLabel}
          </AuthSubmitButton>
        </div>
      </AuthCardFrame>
    </AuthPageShell>
  );
}
