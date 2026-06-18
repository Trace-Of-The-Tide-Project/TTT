"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

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
      {/* Backdrop */}
      <div
        className="absolute inset-0 animate-[fadeIn_0.2s_ease-out]"
        style={{ backgroundColor: "rgba(8,8,8,0.82)", backdropFilter: "blur(10px)" }}
        onClick={onClose}
        aria-hidden
      />

      {/* Card */}
      <div
        className="relative w-full max-w-[400px] overflow-hidden animate-[popIn_0.22s_cubic-bezier(0.16,1,0.3,1)]"
        style={{
          backgroundColor: "#161616",
          border: "1px solid rgba(201,169,110,0.18)",
          borderRadius: 24,
          boxShadow:
            "0 1px 0 rgba(255,255,255,0.04) inset, 0 30px 80px -20px rgba(0,0,0,0.8)",
        }}
      >
        {/* Soft gold glow, top-center */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              "radial-gradient(circle, rgba(201,169,110,0.28) 0%, rgba(201,169,110,0) 70%)",
          }}
        />

        <div className="relative z-10 px-9 pb-9 pt-11">
          {/* Brand mark */}
          <div className="mb-7 flex justify-center">
            <svg width="34" height="22" viewBox="0 0 34 22" fill="none" aria-hidden>
              <path
                d="M2 16 L17 4 L32 16"
                stroke="#C9A96E"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>

          <h2
            className="text-center text-2xl font-semibold leading-snug tracking-tight"
            style={{ color: "#f7f2ea" }}
          >
            {t("title")}
          </h2>

          <p
            className="mx-auto mt-3 max-w-[300px] text-center text-sm leading-relaxed"
            style={{ color: "rgba(247,242,234,0.5)" }}
          >
            {t("body")}
          </p>

          <div className="mt-9 flex flex-col gap-3">
            <Link
              href={loginHref}
              className="inline-flex items-center justify-center font-semibold transition-transform duration-150 hover:-translate-y-px active:translate-y-0"
              style={{
                height: 50,
                borderRadius: 14,
                fontSize: 15,
                backgroundColor: "#C9A96E",
                color: "#1a1209",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.3), 0 8px 24px -8px rgba(201,169,110,0.55)",
              }}
            >
              {t("login")}
            </Link>
            <Link
              href={signUpHref}
              className="inline-flex items-center justify-center font-medium transition-colors duration-150 hover:bg-[rgba(201,169,110,0.08)]"
              style={{
                height: 50,
                borderRadius: 14,
                fontSize: 15,
                backgroundColor: "transparent",
                color: "#f7f2ea",
                border: "1px solid rgba(201,169,110,0.22)",
              }}
            >
              {t("signUp")}
            </Link>
          </div>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute end-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[rgba(255,255,255,0.08)]"
          style={{ color: "rgba(247,242,234,0.45)", fontSize: 14 }}
          aria-label={t("close")}
        >
          ✕
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
        }
        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(8px);
          }
        }
      `}</style>
    </div>
  );
}
