"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { isAxiosError } from "axios";
import { useCreateIssuePledge } from "@/hooks/mutations/issue-pledges";

/* Theme tokens — colors resolve via globals.css so the modal swaps
   between dark/light themes consistently with the rest of the app. */
const ACCENT = "var(--tott-accent-gold)";
const ACCENT_TEXT = "var(--tott-auth-btn-text)";
const ACCENT_DIM = "var(--tott-dash-gold-label)";
const SURFACE = "var(--tott-home-surface)";
const FIELD_BG = "var(--tott-elevated)";
const FRAME = "var(--tott-card-border)";
const TEXT_STRONG = "var(--tott-home-text-strong)";
const TEXT_MUTED = "var(--tott-home-text-muted)";

type TipKey = "tip1" | "tip5" | "tip10" | "tip25";

const TIPS: { key: TipKey; amount: number }[] = [
  { key: "tip1", amount: 1 },
  { key: "tip5", amount: 5 },
  { key: "tip10", amount: 10 },
  { key: "tip25", amount: 25 },
];

/**
 * Figma "Modal — User profile — Custom Support" (448×652).
 *
 * Three sectioned layout:
 *   1. Header (448×64) — title + close, bordered bottom
 *   2. Body (448×508) — subtitle + 2×2 amount tiles + custom amount
 *      input + optional message textarea
 *   3. Footer (448×80) — full-width gold "Continue with $X USD" button,
 *      bordered top
 */
export function SupportIssueModal({
  open,
  onClose,
  issue,
}: {
  open: boolean;
  onClose: () => void;
  /** `id` is required to POST a real pledge. When missing we render
   * the modal but disable submit + show an error — protects against
   * a placeholder card opening a non-functional payment flow. */
  issue: { id?: string; title: string; author: string };
}) {
  const t = useTranslations("OpenIssues.modal");
  const titleId = useId();
  const pledge = useCreateIssuePledge();

  const [selectedTip, setSelectedTip] = useState<TipKey | null>("tip25");
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const busy = pledge.isPending;

  useEffect(() => {
    if (!open) return;
    setSubmitted(false);
    setSubmitError(null);
    pledge.reset();
    // The mutation owns busy state; resetting here is enough — no
    // explicit setBusy call needed.
  }, [open, pledge]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, busy, onClose]);

  if (!open || typeof document === "undefined") return null;

  const presetAmount =
    selectedTip != null ? TIPS.find((t) => t.key === selectedTip)?.amount : null;
  const customParsed = Number.parseFloat(customAmount);
  const customValid = !Number.isNaN(customParsed) && customParsed > 0;
  const effectiveAmount = customValid
    ? customParsed
    : presetAmount != null
      ? presetAmount
      : null;
  const canSubmit = effectiveAmount != null && Boolean(issue.id) && !busy;

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (effectiveAmount == null || !issue.id || busy) return;
    setSubmitError(null);
    const trimmedMessage = message.trim();
    pledge.mutate(
      {
        issue_id: issue.id,
        amount: effectiveAmount,
        ...(trimmedMessage ? { message: trimmedMessage } : {}),
      },
      {
        onSuccess: (data) => {
          // If the backend hands back a payment-provider URL (Stripe
          // Checkout etc.), route the user there to actually pay.
          // Otherwise show the in-modal success state.
          if (data?.payment_url) {
            window.location.assign(data.payment_url);
            return;
          }
          setSubmitted(true);
        },
        onError: (err) => {
          const msg =
            (isAxiosError(err) &&
              (err.response?.data as { message?: string } | undefined)
                ?.message) ||
            t("error");
          setSubmitError(typeof msg === "string" ? msg : t("error"));
        },
      },
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 backdrop-blur-md"
        onClick={() => !busy && onClose()}
        aria-label={t("close")}
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--tott-panel-bg) 55%, transparent)",
        }}
      />

      <form
        onSubmit={submit}
        className="relative mx-4 flex w-full flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{
          maxWidth: 448,
          backgroundColor: SURFACE,
          border: `1px solid ${FRAME}`,
          borderRadius: 20,
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {/* ─────────────── 1. Header (Modal Items 448×64) ─────────────── */}
        <div
          className="flex flex-row items-center"
          style={{
            padding: 20,
            gap: 24,
            backgroundColor: SURFACE,
            borderBottom: `1px solid ${FRAME}`,
          }}
        >
          <h2
            id={titleId}
            className="min-w-0 flex-1"
            style={{
              fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: 16,
              lineHeight: "24px",
              color: TEXT_STRONG,
              margin: 0,
            }}
          >
            {t("title", { author: issue.author })}
          </h2>
          <button
            type="button"
            onClick={() => !busy && onClose()}
            disabled={busy}
            aria-label={t("close")}
            className="shrink-0 transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{
              width: 24,
              height: 24,
              padding: 4,
              borderRadius: 6,
              background: "transparent",
              border: "none",
              color: TEXT_STRONG,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: busy ? "not-allowed" : "pointer",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="4" y1="4" x2="12" y2="12" />
              <line x1="12" y1="4" x2="4" y2="12" />
            </svg>
          </button>
        </div>

        {/* ─────────────── 2. Body (Figma 448×508, padding 24 20) ─────────────── */}
        <div
          className="flex flex-col"
          style={{
            padding: "24px 20px",
            gap: 24,
            backgroundColor: SURFACE,
          }}
        >
          {submitted ? (
            <div
              role="status"
              style={{
                padding: "32px 16px",
                textAlign: "center",
                borderRadius: 12,
                backgroundColor:
                  "color-mix(in srgb, var(--tott-dash-positive, #6FB47A) 16%, transparent)",
                color: "var(--tott-dash-positive, #6FB47A)",
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: 16,
                lineHeight: "24px",
              }}
            >
              {t("submitted")}
            </div>
          ) : (
            <>
              <p
                style={{
                  fontFamily: "'Inter', var(--font-sans, sans-serif)",
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: "20px",
                  letterSpacing: "-0.005em",
                  color: TEXT_MUTED,
                  margin: 0,
                }}
              >
                {t("subtitle", { author: issue.author })}
              </p>

              {/* Support Options — 4-up 2×2 grid of Select Cards. */}
              <div className="grid grid-cols-2" style={{ gap: 16 }}>
                {TIPS.map((tip) => {
                  const isSelected = selectedTip === tip.key;
                  return (
                    <button
                      key={tip.key}
                      type="button"
                      onClick={() => {
                        setSelectedTip(tip.key);
                        setCustomAmount("");
                      }}
                      className="transition-colors"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        padding: 16,
                        // Figma `Select Card`: bg stays #262626 on both
                        // states; selected swaps border to 2px gold and
                        // recolors the label/description.
                        backgroundColor: FIELD_BG,
                        border: `${isSelected ? 2 : 1}px solid ${
                          isSelected ? ACCENT : FRAME
                        }`,
                        borderRadius: 8,
                        cursor: "pointer",
                      }}
                      aria-pressed={isSelected}
                    >
                      <span
                        style={{
                          fontFamily: "'Inter', var(--font-sans, sans-serif)",
                          fontWeight: 500,
                          fontSize: 14,
                          lineHeight: "20px",
                          letterSpacing: "-0.005em",
                          color: isSelected ? ACCENT : TEXT_STRONG,
                          textAlign: "center",
                        }}
                      >
                        {t(`${tip.key}Amount`)}
                      </span>
                      <span
                        style={{
                          fontFamily: "'Inter', var(--font-sans, sans-serif)",
                          fontWeight: 400,
                          fontSize: 12,
                          lineHeight: "16px",
                          color: isSelected ? ACCENT_DIM : TEXT_MUTED,
                          textAlign: "center",
                        }}
                      >
                        {t(`${tip.key}Label`)}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Amount input (Text Input, 408×68). */}
              <label className="flex flex-col" style={{ gap: 8 }}>
                <span
                  style={{
                    fontFamily: "'Inter', var(--font-sans, sans-serif)",
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: "20px",
                    letterSpacing: "-0.005em",
                    color: TEXT_STRONG,
                  }}
                >
                  {t("customAmountLabel")}
                </span>
                <span
                  className="flex flex-row items-center"
                  style={{
                    height: 40,
                    padding: 8,
                    // Figma input is #171717 with a gold border + focus
                    // ring when typing; default state keeps the field
                    // background dim with a #333 border.
                    backgroundColor: customValid ? SURFACE : FIELD_BG,
                    border: `1px solid ${customValid ? ACCENT : FRAME}`,
                    boxShadow: customValid
                      ? "0px 0px 0px 2px rgba(201, 169, 110, 0.32)"
                      : "none",
                    borderRadius: 8,
                    boxSizing: "border-box",
                  }}
                >
                  <span
                    aria-hidden
                    className="inline-flex shrink-0 items-center justify-center"
                    style={{
                      width: 24,
                      height: 24,
                      padding: "2px 4px",
                      color: TEXT_STRONG,
                      fontFamily: "'Inter', var(--font-sans, sans-serif)",
                      fontSize: 14,
                      lineHeight: "20px",
                    }}
                  >
                    $
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={customAmount}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9.]/g, "");
                      setCustomAmount(v);
                      if (v) setSelectedTip(null);
                    }}
                    placeholder={t("customAmountPlaceholder")}
                    maxLength={10}
                    className="min-w-0 flex-1 bg-transparent focus:outline-none"
                    style={{
                      padding: "2px 8px",
                      color: TEXT_STRONG,
                      fontFamily: "'Inter', var(--font-sans, sans-serif)",
                      fontWeight: 400,
                      fontSize: 14,
                      lineHeight: "20px",
                      letterSpacing: "-0.005em",
                      border: "none",
                    }}
                  />
                </span>
              </label>

              {submitError ? (
                <p
                  role="alert"
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border:
                      "1px solid color-mix(in srgb, var(--tott-status-coral) 45%, transparent)",
                    backgroundColor:
                      "color-mix(in srgb, var(--tott-status-coral) 16%, transparent)",
                    color: "var(--tott-dash-negative)",
                    fontFamily: "'Inter', var(--font-sans, sans-serif)",
                    fontSize: 13,
                    lineHeight: "18px",
                    margin: 0,
                  }}
                >
                  {submitError}
                </p>
              ) : null}

              {/* Message textarea (Text Input, 408×140). */}
              <label className="flex flex-col" style={{ gap: 8 }}>
                <span
                  className="flex flex-row items-center"
                  style={{ gap: 4 }}
                >
                  <span
                    style={{
                      fontFamily: "'Inter', var(--font-sans, sans-serif)",
                      fontWeight: 500,
                      fontSize: 14,
                      lineHeight: "20px",
                      letterSpacing: "-0.005em",
                      color: TEXT_STRONG,
                    }}
                  >
                    {t("messageLabel")}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Inter', var(--font-sans, sans-serif)",
                      fontWeight: 400,
                      fontSize: 14,
                      lineHeight: "20px",
                      letterSpacing: "-0.005em",
                      color: TEXT_MUTED,
                    }}
                  >
                    {t("messageOptional")}
                  </span>
                </span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("messagePlaceholder")}
                  rows={4}
                  maxLength={500}
                  className="w-full resize-y bg-transparent focus:outline-none"
                  style={{
                    minHeight: 112,
                    padding: "8px 12px",
                    backgroundColor: FIELD_BG,
                    border: `1px solid ${FRAME}`,
                    borderRadius: 8,
                    color: TEXT_STRONG,
                    fontFamily: "'Inter', var(--font-sans, sans-serif)",
                    fontWeight: 400,
                    fontSize: 14,
                    lineHeight: "20px",
                    letterSpacing: "-0.005em",
                    boxSizing: "border-box",
                  }}
                />
              </label>
            </>
          )}
        </div>

        {/* ─────────────── 3. Footer (Modal Items 448×80) ─────────────── */}
        {!submitted ? (
          <div
            className="flex flex-row items-center justify-end"
            style={{
              padding: 20,
              gap: 12,
              backgroundColor: SURFACE,
              borderTop: `1px solid ${FRAME}`,
            }}
          >
            <button
              type="submit"
              disabled={!canSubmit || busy}
              className="w-full transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                height: 40,
                padding: "8px 16px",
                borderRadius: 8,
                backgroundColor: ACCENT,
                boxShadow: "inset 0px 1px 0px rgba(255, 255, 255, 0.4)",
                color: ACCENT_TEXT,
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: 14,
                lineHeight: "20px",
                letterSpacing: "-0.005em",
                textAlign: "center",
                border: "none",
                cursor: !canSubmit || busy ? "not-allowed" : "pointer",
              }}
            >
              {busy
                ? t("submitting")
                : canSubmit && effectiveAmount != null
                  ? t("continueCta", { amount: `$${effectiveAmount}` })
                  : t("continueDisabledCta")}
            </button>
          </div>
        ) : null}
      </form>
    </div>,
    document.body,
  );
}
