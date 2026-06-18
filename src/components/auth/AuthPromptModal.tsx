"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

// Hexagon grid SVG — matches the site's login/404 background pattern
function HexGrid() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="hex-modal"
          x="0"
          y="0"
          width="56"
          height="64"
          patternUnits="userSpaceOnUse"
        >
          {/* flat-top hexagon path, ~26px radius */}
          <path
            d="M28 4 L52 18 L52 46 L28 60 L4 46 L4 18 Z"
            fill="none"
            stroke="rgba(201,169,110,0.18)"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#hex-modal)" />
    </svg>
  );
}

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
      {/* Blurred backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(10,10,10,0.75)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
        aria-hidden
      />

      {/* Card — mirrors the login page panel shape */}
      <div
        className="relative w-full max-w-sm overflow-hidden"
        style={{
          backgroundColor: "#1c1c1c",
          border: "1px solid rgba(201,169,110,0.25)",
          borderRadius: 20,
          boxShadow: "0 0 0 1px rgba(201,169,110,0.08), 0 24px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Hex pattern fills the card */}
        <HexGrid />

        {/* Gold top accent line */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(201,169,110,0.6), transparent)" }}
        />

        <div className="relative z-10 px-8 py-10">
          {/* Brand mark */}
          <div className="mb-6 flex justify-center">
            <svg width="36" height="28" viewBox="0 0 36 28" fill="none" aria-hidden>
              <path d="M2 14 L18 2 L34 14" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M6 14 L18 5 L30 14" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5" />
              <path d="M2 20 L18 8 L34 20" stroke="#C9A96E" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.25" />
            </svg>
          </div>

          <h2
            className="text-center text-xl font-semibold tracking-tight"
            style={{ color: "#f5f0e8" }}
          >
            {t("title")}
          </h2>

          {/* Gold divider */}
          <div
            className="mx-auto my-4 h-px w-16"
            style={{ background: "linear-gradient(90deg, transparent, #C9A96E, transparent)" }}
          />

          <p
            className="text-center text-sm leading-relaxed"
            style={{ color: "rgba(245,240,232,0.55)" }}
          >
            {t("body")}
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href={loginHref}
              className="inline-flex items-center justify-center font-medium transition-opacity hover:opacity-90"
              style={{
                height: 44,
                borderRadius: 10,
                fontSize: 14,
                letterSpacing: "0.01em",
                backgroundColor: "#C9A96E",
                color: "#1a1209",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25), 0 2px 8px rgba(201,169,110,0.3)",
              }}
            >
              {t("login")}
            </Link>
            <Link
              href={signUpHref}
              className="inline-flex items-center justify-center font-medium transition-opacity hover:opacity-90"
              style={{
                height: 44,
                borderRadius: 10,
                fontSize: 14,
                letterSpacing: "0.01em",
                backgroundColor: "rgba(255,255,255,0.05)",
                color: "#f5f0e8",
                border: "1px solid rgba(201,169,110,0.3)",
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
          className="absolute right-4 top-4 z-20 flex h-7 w-7 items-center justify-center rounded-full transition-opacity hover:opacity-70"
          style={{
            backgroundColor: "rgba(255,255,255,0.06)",
            color: "rgba(245,240,232,0.5)",
            fontSize: 13,
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          aria-label={t("close")}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
