"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { isAxiosError } from "axios";
import { FirstWordGold } from "@/components/home/magazine/FirstWordGold";
import { applyToWorkshop } from "@/services/workshops.service";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Workshop being applied to. Required for the POST to land on
   * the correct endpoint; passed by the host when the user clicks
   * Apply Now in a specific workshop's detail modal. */
  workshopId: string | null;
  /** Fired after a successful submit so the host can chain into
   * a confirmation flow if it wants to. Not required. */
  onSubmitted?: () => void;
};

/** Join Workshop modal — Figma "Modal-5" comp. Mirrors the
 * detail-modal three-band shell (home-surface bands, color-mix
 * borders, fluid clamps) but the body is a three-field reservation
 * form: Name, Email, Experience Level. Footer pairs a wide gold
 * "Apply Now" with a small dark "Cancel". */
export function JoinWorkshopModal({
  open,
  onClose,
  workshopId,
  onSubmitted,
}: Props) {
  const t = useTranslations("Home.workshops.joinModal");
  const titleId = useId();
  const descId = useId();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [experience, setExperience] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);

  // Reset transient form state + autofocus the first field whenever
  // the modal is opened (closing keeps prior values discarded).
  useEffect(() => {
    if (!open) return;
    setName("");
    setEmail("");
    setExperience("");
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
    if (!workshopId) return;
    setBusy(true);
    setError(null);
    try {
      await applyToWorkshop(workshopId, {
        name: name.trim(),
        email: email.trim(),
        experience_level: experience.trim() || undefined,
      });
      onSubmitted?.();
      onClose();
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
    !!workshopId &&
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    experience.trim().length > 0;

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
          {/* "Trip Info" translucent-gradient wrapper per Figma —
              same lift treatment as the detail modal so both
              dialogs read as one system. */}
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

        {/* ── Body — three labeled inputs ──────────────────────── */}
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

          <Field label={t("experienceLabel")}>
            <input
              type="text"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder={t("experiencePlaceholder")}
              required
              maxLength={120}
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
            {busy ? t("submitting") : t("apply")}
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
