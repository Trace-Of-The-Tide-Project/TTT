"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { ChamferedSurface } from "@/components/ui/ChamferedSurface";
import { XIcon } from "@/components/ui/icons";

/**
 * Shown instead of an auto-redirect when a guest tries a purchase/download
 * action. Gives them an actual choice (log in vs. sign up) rather than being
 * bounced to /auth/login with no say in it. Chamfered panel to match the
 * site's signature geometric language instead of Modal's rounded corners.
 */
export function AuthPromptModal({
  open,
  onClose,
  callbackUrl,
}: {
  open: boolean;
  onClose: () => void;
  callbackUrl: string;
}) {
  const t = useTranslations("Home.Commerce");
  const next = encodeURIComponent(callbackUrl);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-md"
        onClick={onClose}
        aria-label="Close dialog"
      />

      <ChamferedSurface
        className="relative mx-4 w-full max-w-md"
        chamfer={25}
        borderColor="var(--tott-card-border)"
        innerFill="var(--tott-dash-surface)"
      >
        <div role="dialog" aria-modal="true" aria-labelledby="auth-prompt-title">
          <div className="flex items-start justify-between gap-4 border-b border-[var(--tott-card-border)] px-6 py-4">
            <h2 id="auth-prompt-title" className="text-lg font-bold text-foreground">
              {t("authPromptTitle")}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-lg p-1 text-[var(--tott-muted)] transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
              aria-label="Close"
            >
              <XIcon />
            </button>
          </div>

          <div className="px-6 py-5">
            <p className="text-sm text-[var(--tott-muted)]">{t("authPromptBody")}</p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <ChamferedSurface chamfer={10} className="flex-1" style={{ backgroundColor: "var(--tott-magazine-btn-bg)" }}>
                <a
                  href={`/auth/register?callbackUrl=${next}`}
                  className="flex h-10 items-center justify-center px-5 text-sm font-medium transition-opacity hover:opacity-90"
                  style={{ color: "var(--tott-auth-btn-text)" }}
                >
                  {t("authPromptSignUp")}
                </a>
              </ChamferedSurface>
              <ChamferedSurface
                chamfer={10}
                className="flex-1"
                borderColor="var(--tott-card-border)"
                innerFill="var(--tott-dash-surface)"
              >
                <a
                  href={`/auth/login?callbackUrl=${next}`}
                  className="flex h-10 items-center justify-center px-5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)]"
                >
                  {t("authPromptLogIn")}
                </a>
              </ChamferedSurface>
            </div>
          </div>
        </div>
      </ChamferedSurface>
    </div>,
    document.body,
  );
}
