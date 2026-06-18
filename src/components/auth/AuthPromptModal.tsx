"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const TEXT_STRONG = "var(--tott-home-text-strong)";
const TEXT_MUTED = "var(--tott-home-text-muted)";
const CARD_BORDER = "var(--tott-card-border)";

/**
 * Lightweight auth prompt shown when a guest triggers an auth-gated action
 * (e.g. clicking Follow). Offers Login / Sign up, carrying a callbackUrl back
 * to the current page so the user returns after authenticating. Closes on Esc
 * or backdrop click.
 */
export function AuthPromptModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("AuthPrompt");
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const callback = encodeURIComponent(pathname || "/");
  const loginHref = `/auth/login?callbackUrl=${callback}`;
  const signUpHref = `/auth/register?callbackUrl=${callback}`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t("title")}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative w-full max-w-sm p-6"
        style={{
          backgroundColor: "var(--tott-home-surface, #171717)",
          border: `1px solid ${CARD_BORDER}`,
          borderRadius: 14,
        }}
      >
        <h2
          className="text-lg font-medium"
          style={{ color: TEXT_STRONG }}
        >
          {t("title")}
        </h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: TEXT_MUTED }}>
          {t("body")}
        </p>

        <div className="mt-5 flex flex-col gap-3">
          <Link
            href={loginHref}
            className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
            style={{
              height: 40,
              borderRadius: 8,
              fontWeight: 500,
              fontSize: 14,
              backgroundColor: "var(--tott-magazine-btn-bg)",
              color: "var(--tott-auth-btn-text)",
            }}
          >
            {t("login")}
          </Link>
          <Link
            href={signUpHref}
            className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
            style={{
              height: 40,
              borderRadius: 8,
              fontWeight: 500,
              fontSize: 14,
              backgroundColor: CARD_BORDER,
              color: TEXT_STRONG,
            }}
          >
            {t("signUp")}
          </Link>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-md transition-opacity hover:opacity-80"
          style={{ color: TEXT_MUTED }}
          aria-label={t("close")}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
