"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

const ACCENT = "#C9A96E";
const ACCENT_TEXT = "#332217";
const FIELD_BG = "#262626";
const FIELD_BORDER = "#333333";
const LABEL_COLOR = "#FFFFFF";
const HELPER_COLOR = "#A3A3A3";
const PLACEHOLDER_COLOR = "#7B7B7B";

type TipKey = "tip1" | "tip5" | "tip10" | "tip25";

const TIPS: { key: TipKey; amount: number }[] = [
  { key: "tip1", amount: 1 },
  { key: "tip5", amount: 5 },
  { key: "tip10", amount: 10 },
  { key: "tip25", amount: 25 },
];

export function SupportIssueModal({
  open,
  onClose,
  issue,
}: {
  open: boolean;
  onClose: () => void;
  issue: { title: string; author: string };
}) {
  const t = useTranslations("OpenIssues.modal");
  const titleId = useId();

  const [selectedTip, setSelectedTip] = useState<TipKey | null>("tip25");
  const [customAmount, setCustomAmount] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setBusy(false);
    setSubmitted(false);
  }, [open]);

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
  const canSubmit = effectiveAmount != null;

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit || busy) return;
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      setSubmitted(true);
    }, 600);
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
        className="relative mx-4 flex w-full flex-col items-stretch"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{
          maxWidth: "464px",
          backgroundColor: "var(--tott-dash-surface, #1A1A1A)",
          border: `1px solid ${FIELD_BORDER}`,
          borderRadius: "16px",
          boxSizing: "border-box",
          overflow: "hidden",
          padding: "20px",
          gap: "20px",
        }}
      >
        {/* Header */}
        <div
          className="flex flex-row items-start"
          style={{ gap: "16px" }}
        >
          <div className="flex min-w-0 flex-1 flex-col" style={{ gap: "8px" }}>
            <h2
              id={titleId}
              style={{
                fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "18px",
                lineHeight: "24px",
                color: LABEL_COLOR,
                margin: 0,
              }}
            >
              {t("title", { author: issue.author })}
            </h2>
            <p
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "-0.005em",
                color: HELPER_COLOR,
                margin: 0,
              }}
            >
              {t("subtitle", { author: issue.author })}
            </p>
          </div>
          <button
            type="button"
            onClick={() => !busy && onClose()}
            disabled={busy}
            aria-label={t("close")}
            className="shrink-0 transition-opacity hover:opacity-80 disabled:opacity-40"
            style={{
              width: "24px",
              height: "24px",
              padding: "4px",
              borderRadius: "6px",
              background: "transparent",
              border: "none",
              color: LABEL_COLOR,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
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

        {submitted ? (
          <div
            role="status"
            style={{
              padding: "32px 16px",
              textAlign: "center",
              borderRadius: "12px",
              backgroundColor:
                "color-mix(in srgb, var(--tott-dash-positive, #6FB47A) 16%, transparent)",
              color: "var(--tott-dash-positive, #6FB47A)",
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "16px",
              lineHeight: "24px",
            }}
          >
            {t("submitted")}
          </div>
        ) : (
          <>
            {/* Tip tiles — 2×2 grid */}
            <div
              className="grid grid-cols-2"
              style={{ gap: "12px" }}
            >
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
                      gap: "4px",
                      padding: "16px 12px",
                      backgroundColor: isSelected ? ACCENT : FIELD_BG,
                      border: `1px solid ${
                        isSelected ? ACCENT : FIELD_BORDER
                      }`,
                      borderRadius: "8px",
                      cursor: "pointer",
                      boxShadow: isSelected
                        ? "inset 0px 1px 0px rgba(255, 255, 255, 0.4)"
                        : undefined,
                    }}
                    aria-pressed={isSelected}
                  >
                    <span
                      style={{
                        fontFamily:
                          "'IBM Plex Sans', var(--font-sans, sans-serif)",
                        fontWeight: 500,
                        fontSize: "20px",
                        lineHeight: "28px",
                        color: isSelected ? ACCENT_TEXT : LABEL_COLOR,
                      }}
                    >
                      {t(`${tip.key}Amount`)}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Inter', var(--font-sans, sans-serif)",
                        fontWeight: 400,
                        fontSize: "12px",
                        lineHeight: "16px",
                        letterSpacing: "-0.005em",
                        color: isSelected ? ACCENT_TEXT : HELPER_COLOR,
                      }}
                    >
                      {t(`${tip.key}Label`)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom amount */}
            <label className="flex flex-col" style={{ gap: "8px" }}>
              <span
                style={{
                  fontFamily: "'Inter', var(--font-sans, sans-serif)",
                  fontWeight: 500,
                  fontSize: "14px",
                  lineHeight: "20px",
                  letterSpacing: "-0.005em",
                  color: LABEL_COLOR,
                }}
              >
                {t("customAmountLabel")}
              </span>
              <span
                className="flex flex-row items-center"
                style={{
                  height: "40px",
                  padding: "8px",
                  backgroundColor: FIELD_BG,
                  border: `1px solid ${
                    customValid ? ACCENT : FIELD_BORDER
                  }`,
                  borderRadius: "8px",
                  boxSizing: "border-box",
                }}
              >
                <span
                  aria-hidden
                  className="inline-flex shrink-0 items-center justify-center"
                  style={{
                    width: "24px",
                    height: "24px",
                    padding: "2px 4px",
                    color: PLACEHOLDER_COLOR,
                    fontFamily: "'Inter', var(--font-sans, sans-serif)",
                    fontSize: "14px",
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
                    color: LABEL_COLOR,
                    fontFamily: "'Inter', var(--font-sans, sans-serif)",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "20px",
                    letterSpacing: "-0.005em",
                    border: "none",
                  }}
                />
              </span>
            </label>

            {/* Message */}
            <label className="flex flex-col" style={{ gap: "8px" }}>
              <span
                className="flex flex-row items-center"
                style={{ gap: "8px" }}
              >
                <span
                  style={{
                    fontFamily: "'Inter', var(--font-sans, sans-serif)",
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: "20px",
                    letterSpacing: "-0.005em",
                    color: LABEL_COLOR,
                  }}
                >
                  {t("messageLabel")}
                </span>
                <span
                  style={{
                    fontFamily: "'Inter', var(--font-sans, sans-serif)",
                    fontWeight: 400,
                    fontSize: "14px",
                    lineHeight: "20px",
                    letterSpacing: "-0.005em",
                    color: HELPER_COLOR,
                  }}
                >
                  {t("messageOptional")}
                </span>
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("messagePlaceholder")}
                rows={3}
                maxLength={500}
                className="w-full resize-y bg-transparent focus:outline-none"
                style={{
                  minHeight: "88px",
                  padding: "8px 12px",
                  backgroundColor: FIELD_BG,
                  border: `1px solid ${FIELD_BORDER}`,
                  borderRadius: "8px",
                  color: LABEL_COLOR,
                  fontFamily: "'Inter', var(--font-sans, sans-serif)",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "20px",
                  letterSpacing: "-0.005em",
                  boxSizing: "border-box",
                }}
              />
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit || busy}
              className="w-full transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                height: "44px",
                padding: "10px 16px",
                borderRadius: "8px",
                backgroundColor: ACCENT,
                boxShadow: "inset 0px 1px 0px rgba(255, 255, 255, 0.4)",
                color: ACCENT_TEXT,
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "-0.005em",
                textAlign: "center",
                border: "none",
                cursor:
                  !canSubmit || busy ? "not-allowed" : "pointer",
              }}
            >
              {busy
                ? t("submitting")
                : canSubmit && effectiveAmount != null
                  ? t("continueCta", { amount: `$${effectiveAmount}` })
                  : t("continueDisabledCta")}
            </button>
          </>
        )}
      </form>
    </div>,
    document.body,
  );
}
