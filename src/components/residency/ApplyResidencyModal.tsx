"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { isAxiosError } from "axios";
import { FirstWordGold } from "@/components/home/magazine/FirstWordGold";
import { HeadsetIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";
import { applyForResidency } from "@/services/residency.service";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
};

/** Apply for Residency modal — Figma "Modal-6". Same three-band
 * shell as the Join Workshop modal (Modal-5), one more field for
 * the longer residency intake (Why join? + What are you working
 * on?). Footer pairs a wide gold "Submit Application" with a small
 * dark "Cancel". All sizes fluid, all colors via CSS vars. */
export function ApplyResidencyModal({ open, onClose, onSubmitted }: Props) {
  const t = useTranslations("Home.residency.applyModal");
  const titleId = useId();
  const descId = useId();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [why, setWhy] = useState("");
  const [working, setWorking] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Submitted flag swaps the form view for the success view
  // (Figma "Modal-7") while keeping the same modal shell open.
  const [submitted, setSubmitted] = useState(false);
  const nameRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setName("");
    setEmail("");
    setWhy("");
    setWorking("");
    setSubmitted(false);
    setBusy(false);
    setError(null);
    const id = window.setTimeout(() => nameRef.current?.focus(), 50);
    return () => window.clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await applyForResidency({
        name: name.trim(),
        email: email.trim(),
        why_join: why.trim() || undefined,
        working_on: working.trim() || undefined,
      });
      setSubmitted(true);
      onSubmitted?.();
    } catch (err) {
      const msg =
        (isAxiosError(err) &&
          (err.response?.data as { message?: string } | undefined)?.message) ||
        t("error");
      setError(typeof msg === "string" ? msg : t("error"));
    } finally {
      setBusy(false);
    }
  };

  const canSubmit =
    !busy &&
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    why.trim().length > 0 &&
    working.trim().length > 0;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 backdrop-blur-md"
        onClick={onClose}
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
        aria-describedby={descId}
        style={{
          maxWidth: "min(95vw, clamp(640px, 50vw + 4rem, 1100px))",
          maxHeight: "calc(100vh - 32px)",
          backgroundColor: "var(--tott-home-surface)",
          border: "1px solid var(--tott-card-border)",
          borderRadius: "20px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {submitted ? (
          <SuccessView
            titleId={titleId}
            descId={descId}
            onClose={onClose}
          />
        ) : (
          <>
        {/* ── Header band ─────────────────────────────────────── */}
        <div
          className="flex flex-row items-center"
          style={{
            padding: "clamp(16px, 0.8vw + 0.5rem, 32px)",
            gap: "clamp(16px, 1vw + 0.4rem, 32px)",
            borderBottom: "1px solid var(--tott-card-border)",
            backgroundColor: "var(--tott-home-surface)",
          }}
        >
          <div
            className="flex flex-1 flex-col"
            style={{
              gap: "clamp(12px, 0.6vw + 0.4rem, 24px)",
              minWidth: 0,
              background:
                "linear-gradient(0deg, color-mix(in srgb, var(--tott-home-surface) 64%, transparent) 0%, color-mix(in srgb, var(--tott-home-surface) 0%, transparent) 100%)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
            }}
          >
            <h2
              id={titleId}
              style={{
                fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "clamp(1rem, 0.45vw + 0.55rem, 1.75rem)",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              <FirstWordGold raw={t("title")} />
            </h2>
            <p
              id={descId}
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "clamp(0.875rem, 0.3vw + 0.5rem, 1.25rem)",
                lineHeight: 1.4,
                letterSpacing: "-0.005em",
                color: "var(--tott-home-text-strong)",
                textShadow: "var(--tott-home-text-shadow)",
                margin: 0,
              }}
            >
              {t("subtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="shrink-0 transition-opacity hover:opacity-80"
            style={{
              width: "clamp(24px, 0.4vw + 1rem, 40px)",
              height: "clamp(24px, 0.4vw + 1rem, 40px)",
              padding: "4px",
              borderRadius: "6px",
              background: "transparent",
              border: "none",
              color: "var(--tott-home-text-strong)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="66%"
              height="66%"
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

        {/* ── Body — four labeled inputs ──────────────────────── */}
        <div
          className="flex flex-col overflow-y-auto"
          style={{
            padding:
              "clamp(20px, 1vw + 0.6rem, 40px) clamp(16px, 0.8vw + 0.5rem, 32px)",
            gap: "clamp(20px, 1vw + 0.5rem, 32px)",
            backgroundColor: "var(--tott-home-surface)",
            flex: "1 1 auto",
          }}
        >
          <Field label={t("nameLabel")}>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              required
              maxLength={120}
              style={inputStyle}
            />
          </Field>

          <Field label={t("emailLabel")}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              required
              maxLength={200}
              style={inputStyle}
            />
          </Field>

          <Field label={t("whyLabel")}>
            <input
              type="text"
              value={why}
              onChange={(e) => setWhy(e.target.value)}
              placeholder={t("whyPlaceholder")}
              required
              maxLength={500}
              style={inputStyle}
            />
          </Field>

          <Field label={t("workingLabel")}>
            <input
              type="text"
              value={working}
              onChange={(e) => setWorking(e.target.value)}
              placeholder={t("workingPlaceholder")}
              required
              maxLength={500}
              style={inputStyle}
            />
          </Field>

          {error ? (
            <p
              role="alert"
              style={{
                margin: 0,
                padding: "10px 12px",
                borderRadius: "8px",
                backgroundColor:
                  "color-mix(in srgb, var(--tott-dash-negative) 16%, transparent)",
                color: "var(--tott-dash-negative)",
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "clamp(0.8125rem, 0.25vw + 0.45rem, 1.125rem)",
                lineHeight: 1.45,
              }}
            >
              {error}
            </p>
          ) : null}
        </div>

        {/* ── Footer band ─────────────────────────────────────── */}
        <div
          className="flex flex-row items-center justify-end"
          style={{
            padding: "clamp(16px, 0.8vw + 0.5rem, 32px)",
            gap: "clamp(12px, 0.4vw + 0.3rem, 20px)",
            borderTop: "1px solid var(--tott-card-border)",
            backgroundColor: "var(--tott-home-surface)",
          }}
        >
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex-1 transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{
              height: "clamp(40px, 0.7vw + 1.5rem, 64px)",
              padding:
                "clamp(8px, 0.3vw + 0.3rem, 16px) clamp(16px, 0.5vw + 0.5rem, 32px)",
              borderRadius: "8px",
              backgroundColor: "var(--tott-magazine-btn-bg)",
              boxShadow:
                "inset 0px 1px 0px color-mix(in srgb, var(--tott-home-text-strong) 40%, transparent)",
              color: "var(--tott-auth-btn-text)",
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "clamp(0.875rem, 0.3vw + 0.5rem, 1.25rem)",
              lineHeight: 1.4,
              letterSpacing: "-0.005em",
              border: "none",
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            {busy ? t("submitting") : t("submit")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 transition-opacity hover:opacity-90"
            style={{
              height: "clamp(40px, 0.7vw + 1.5rem, 64px)",
              padding:
                "clamp(8px, 0.3vw + 0.3rem, 16px) clamp(16px, 0.5vw + 0.5rem, 32px)",
              borderRadius: "8px",
              backgroundColor: "var(--tott-card-border)",
              boxShadow:
                "inset 0px 1px 1px color-mix(in srgb, var(--tott-home-text-strong) 8%, transparent)",
              color: "var(--tott-home-text-strong)",
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "clamp(0.875rem, 0.3vw + 0.5rem, 1.25rem)",
              lineHeight: 1.4,
              letterSpacing: "-0.005em",
              border: "none",
            }}
          >
            {t("cancel")}
          </button>
        </div>
          </>
        )}
      </form>
    </div>,
    document.body,
  );
}

// ─── Helpers ──────────────────────────────────────────────────

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className="flex flex-col"
      style={{ gap: "clamp(8px, 0.4vw + 0.2rem, 16px)" }}
    >
      <span
        style={{
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 500,
          fontSize: "clamp(0.875rem, 0.3vw + 0.5rem, 1.25rem)",
          lineHeight: 1.4,
          letterSpacing: "-0.005em",
          color: "var(--tott-home-text-strong)",
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "clamp(40px, 0.7vw + 1.5rem, 56px)",
  padding: "8px 12px",
  backgroundColor: "var(--tott-elevated)",
  border: "1px solid var(--tott-card-border)",
  borderRadius: "8px",
  boxSizing: "border-box",
  color: "var(--tott-home-text-strong)",
  fontFamily: "'Inter', var(--font-sans, sans-serif)",
  fontSize: "clamp(0.875rem, 0.3vw + 0.5rem, 1.25rem)",
  fontWeight: 400,
  lineHeight: 1.4,
  letterSpacing: "-0.005em",
  outline: "none",
};

// ─── Success state (Modal-7) ───────────────────────────────────

/** Confirmation view shown after a successful submit. Replaces the
 * three-band form with a single centered column: green-tinted check
 * badge, success heading, supporting copy, dark "Back to Writing
 * Room" pill that returns to /writing-room, and a muted
 * "If you have any questions — Contact us" footer. */
function SuccessView({
  titleId,
  descId,
  onClose,
}: {
  titleId: string;
  descId: string;
  onClose: () => void;
}) {
  const t = useTranslations("Home.residency.applyModal");

  return (
    <div
      className="flex flex-col items-center text-center"
      style={{
        padding:
          "clamp(40px, 2vw + 1rem, 80px) clamp(24px, 2vw + 0.5rem, 64px) clamp(28px, 2vw + 0.5rem, 64px)",
        gap: "clamp(12px, 0.6vw + 0.4rem, 24px)",
        backgroundColor: "var(--tott-home-surface)",
      }}
    >
      {/* Green check badge — same color recipe as the
          SubmitNoteModal success view so both confirmations read
          as one system. */}
      <span
        aria-hidden
        className="inline-flex shrink-0 items-center justify-center"
        style={{
          width: "clamp(48px, 1vw + 2rem, 80px)",
          height: "clamp(48px, 1vw + 2rem, 80px)",
          borderRadius: "999px",
          backgroundColor:
            "color-mix(in srgb, var(--tott-dash-positive) 28%, var(--tott-panel-bg))",
          color: "var(--tott-dash-positive)",
          marginBottom: "8px",
        }}
      >
        <svg
          width="56%"
          height="56%"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.25}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>

      <h2
        id={titleId}
        style={{
          fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
          fontWeight: 600,
          fontSize: "clamp(1.125rem, 0.7vw + 0.6rem, 2.25rem)",
          lineHeight: 1.3,
          color: "var(--tott-home-text-strong)",
          margin: 0,
          textShadow: "var(--tott-home-text-shadow)",
        }}
      >
        {t("successTitle")}
      </h2>

      <p
        id={descId}
        style={{
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 400,
          fontSize: "clamp(0.875rem, 0.3vw + 0.5rem, 1.25rem)",
          lineHeight: 1.55,
          letterSpacing: "-0.005em",
          color: "var(--tott-home-text-muted)",
          margin: 0,
          maxWidth: "clamp(280px, 32vw, 720px)",
        }}
      >
        {t("successBody")}
      </p>

      <Link
        href="/writing-room"
        onClick={onClose}
        className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
        style={{
          marginTop: "clamp(8px, 0.4vw + 0.2rem, 20px)",
          height: "clamp(40px, 0.7vw + 1.5rem, 64px)",
          padding:
            "clamp(8px, 0.3vw + 0.3rem, 16px) clamp(20px, 1vw + 0.5rem, 40px)",
          gap: "clamp(8px, 0.4vw + 0.2rem, 16px)",
          borderRadius: "8px",
          backgroundColor: "var(--tott-card-border)",
          boxShadow:
            "inset 0px 1px 1px color-mix(in srgb, var(--tott-home-text-strong) 8%, transparent)",
          color: "var(--tott-home-text-strong)",
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 500,
          fontSize: "clamp(0.875rem, 0.3vw + 0.5rem, 1.25rem)",
          lineHeight: 1.4,
          letterSpacing: "-0.005em",
        }}
      >
        <svg
          aria-hidden
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="11 6 5 12 11 18" />
        </svg>
        {t("backToWritingRoom")}
      </Link>

      <p
        className="flex flex-wrap items-center justify-center"
        style={{
          marginTop: "clamp(8px, 0.4vw + 0.2rem, 20px)",
          gap: "clamp(6px, 0.3vw, 12px)",
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 400,
          fontSize: "clamp(0.875rem, 0.3vw + 0.5rem, 1.25rem)",
          lineHeight: 1.4,
          color: "var(--tott-home-text-muted)",
          margin: 0,
        }}
      >
        {t("contactLead")}
        <span
          aria-hidden
          className="inline-flex shrink-0 items-center"
          style={{ color: "var(--tott-accent-gold)" }}
        >
          <HeadsetIcon />
        </span>
        <Link
          href="/contact"
          className="inline-flex hover:underline"
          style={{ color: "var(--tott-accent-gold)" }}
        >
          {t("contactLink")}
        </Link>
      </p>
    </div>
  );
}
