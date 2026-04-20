"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import HexBackground from "@/components/ui/HexBackground";
import { HexagonCard, AuthLinks } from "@/components/auth/shared";
import { theme } from "@/lib/theme";

const RESEND_COOLDOWN_SEC = 48;

export default function EmailSentPage() {
  const t = useTranslations("Auth");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SEC);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? sessionStorage.getItem("forgot-password-email-sent-at") : null;
    const sentAt = stored ? parseInt(stored, 10) : Date.now();
    if (!stored) {
      sessionStorage.setItem("forgot-password-email-sent-at", String(Date.now()));
    }
    const elapsed = Math.floor((Date.now() - sentAt) / 1000);
    const initial = Math.max(0, RESEND_COOLDOWN_SEC - elapsed);
    setSecondsLeft(initial);
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
      typeof window !== "undefined" ? sessionStorage.getItem("forgot-password-email") : null;
    if (!email || loading || secondsLeft > 0) return;
    setLoading(true);
    setTimeout(() => {
      sessionStorage.setItem("forgot-password-email-sent-at", String(Date.now()));
      setSecondsLeft(RESEND_COOLDOWN_SEC);
      setLoading(false);
    }, 800);
  }

  const canResend = secondsLeft === 0;

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: theme.pageBackground }}>
      <div
        className="absolute right-0 top-0 left-0 z-0"
        style={{
          height: "220px",
          background: theme.authBandGradient,
        }}
      >
        <HexBackground />
      </div>
      <div className="fixed inset-0 -z-10" style={{ background: theme.pageBackground }} />
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12 pt-16">
        <div className="w-full max-w-3xl">
          <div className="mb-8 text-center">
            <div className="mb-6 flex justify-center">
              <Image
                src="/images/Brand.png"
                alt=""
                width={120}
                height={48}
                className="h-12 w-auto object-contain"
              />
            </div>
          </div>

          <h1 className="mb-2 text-center text-xl font-semibold text-foreground">{t("pages.emailSent.title")}</h1>
          <p className="mx-auto mb-6 max-w-md text-center text-sm text-neutral-400">{t("pages.emailSent.subtitle")}</p>

          <HexagonCard size="compact">
            <div className="flex w-full max-w-md flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border-2 border-neutral-500 text-neutral-400">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h2 className="mb-2 text-lg font-semibold text-neutral-100">{t("pages.emailSent.cardTitle")}</h2>
              <p className="mx-auto mb-6 max-w-sm text-sm text-neutral-400">{t("pages.emailSent.cardBody")}</p>
              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend || loading}
                className="w-full cursor-pointer select-none rounded-lg border py-3 font-medium text-neutral-100 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  borderColor: theme.inputBorder,
                  backgroundColor: canResend ? theme.accentGold : "transparent",
                  color: canResend ? "#000" : undefined,
                }}
                suppressHydrationWarning
              >
                {loading
                  ? t("pages.emailSent.resendSending")
                  : canResend
                    ? t("pages.emailSent.resendReady")
                    : t("pages.emailSent.resendCountdown", { seconds: secondsLeft })}
              </button>
            </div>
          </HexagonCard>

          <AuthLinks
            primaryText={t("shared.linkToLoginLead")}
            primaryHref="/auth/login"
            primaryLinkLabel={t("login")}
            backHref="/"
          />
        </div>
      </div>
    </div>
  );
}
