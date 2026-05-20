"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { isAxiosError } from "axios";
import { submitDictionaryNote } from "@/services/dictionary.service";
import { FirstWordGold } from "@/components/home/magazine/FirstWordGold";
import { HeadsetIcon } from "@/components/ui/icons";
import { Link } from "@/i18n/navigation";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Fired after a successful submit so the host can refresh the
   * dictionary list. The note still has to be approved before it
   * appears in the public list, so callers typically just toast and
   * close. */
  onSubmitted?: () => void;
};

// Figma "Submit a Note" modal sizing
const MODAL_WIDTH = 757; // px (caps on desktop)
const BAND_PAD_X = 20;
const BAND_PAD_Y = 20;
const BODY_PAD_X = 20;
const BODY_PAD_Y = 24;

/** Submit a Note modal — Figma comp ("Submit a Note…" dialog).
 * Three-band layout: 100px header (gold-gradient title + subtitle +
 * close), body with three inputs (Title, Definition or Thought,
 * Your Name (Optional)), and an 80px footer with a wide gold
 * "Submit Note" button + 86px "Cancel". Caps at 757px on desktop
 * and shrinks fluidly below. */
export function SubmitNoteModal({ open, onClose, onSubmitted }: Props) {
  const t = useTranslations("Home.writingRoom.submitModal");
  const titleId = useId();
  const descId = useId();

  const [title, setTitle] = useState("");
  const [definition, setDefinition] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const titleRef = useRef<HTMLInputElement | null>(null);

  // Reset transient state + autofocus the first field on open.
  useEffect(() => {
    if (!open) return;
    setError(null);
    setSubmitted(false);
    const id = window.setTimeout(() => titleRef.current?.focus(), 50);
    return () => window.clearTimeout(id);
  }, [open]);

  // Esc-to-close + body scroll lock while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, busy, onClose]);

  if (!open || typeof document === "undefined") return null;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedDefinition = definition.trim();
    if (!trimmedTitle || !trimmedDefinition) return;
    setBusy(true);
    setError(null);
    try {
      const trimmedName = name.trim();
      await submitDictionaryNote({
        title: trimmedTitle,
        definition_or_thought: trimmedDefinition,
        ...(trimmedName ? { author_name: trimmedName } : {}),
      });
      setSubmitted(true);
      setTitle("");
      setDefinition("");
      setName("");
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

  const canSubmit = title.trim().length > 0 && definition.trim().length > 0;

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
        aria-describedby={descId}
        style={{
          maxWidth: `${MODAL_WIDTH}px`,
          backgroundColor: "var(--tott-dash-surface)",
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
        {/* ── Header band — gold-gradient title + subtitle + close ── */}
        <div
          className="flex flex-row items-center"
          style={{
            padding: `${BAND_PAD_Y}px ${BAND_PAD_X}px`,
            gap: "24px",
            borderBottom: "1px solid var(--tott-card-border)",
            backgroundColor: "var(--tott-dash-surface)",
            boxSizing: "border-box",
          }}
        >
          <div
            className="flex flex-1 flex-col"
            style={{ gap: "16px", minWidth: 0 }}
          >
            <h2
              id={titleId}
              style={{
                fontFamily: "'IBM Plex Sans', var(--font-sans, sans-serif)",
                fontWeight: 500,
                fontSize: "16px",
                lineHeight: "24px",
                margin: 0,
                textShadow: "var(--tott-home-text-shadow)",
              }}
            >
              <FirstWordGold raw={t("title")} />
            </h2>
            <p
              id={descId}
              style={{
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "20px",
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
              color: "var(--tott-home-text-strong)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
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

        {/* ── Body — three input groups ─────────────────────────── */}
        <div
          className="flex flex-col"
          style={{
            padding: `${BODY_PAD_Y}px ${BODY_PAD_X}px`,
            gap: "24px",
            backgroundColor: "var(--tott-dash-surface)",
            boxSizing: "border-box",
          }}
        >
          <Field
            label={t("titleLabel")}
            input={
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("titlePlaceholder")}
                maxLength={120}
                required
                disabled={busy}
                className="tott-submit-note-input"
                style={inputStyle}
              />
            }
          />

          <Field
            label={t("definitionLabel")}
            input={
              <textarea
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                placeholder={t("definitionPlaceholder")}
                maxLength={1000}
                required
                disabled={busy}
                rows={1}
                className="tott-submit-note-input"
                style={{
                  ...inputStyle,
                  height: "auto",
                  minHeight: "40px",
                  resize: "vertical",
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  lineHeight: "20px",
                }}
              />
            }
          />

          <Field
            label={t("nameLabel")}
            optional={t("nameOptional")}
            input={
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("namePlaceholder")}
                maxLength={120}
                disabled={busy}
                className="tott-submit-note-input"
                style={inputStyle}
              />
            }
          />

          {error ? (
            <p
              role="alert"
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                border:
                  "1px solid color-mix(in srgb, var(--tott-status-coral) 45%, transparent)",
                backgroundColor:
                  "color-mix(in srgb, var(--tott-status-coral) 16%, transparent)",
                color: "var(--tott-dash-negative)",
                fontFamily: "'Inter', var(--font-sans, sans-serif)",
                fontSize: "13px",
                lineHeight: "18px",
                margin: 0,
              }}
            >
              {error}
            </p>
          ) : null}
        </div>

        {/* ── Footer — flex-grow Submit + fixed-width Cancel ────── */}
        <div
          className="flex flex-row items-center justify-end"
          style={{
            padding: `${BAND_PAD_Y}px ${BAND_PAD_X}px`,
            gap: "12px",
            borderTop: "1px solid var(--tott-card-border)",
            backgroundColor: "var(--tott-dash-surface)",
            boxSizing: "border-box",
          }}
        >
          <button
            type="submit"
            disabled={busy || !canSubmit}
            className="inline-flex flex-1 items-center justify-center transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              height: "40px",
              padding: "8px 16px",
              borderRadius: "8px",
              backgroundColor: "var(--tott-magazine-btn-bg)",
              boxShadow:
                "inset 0px 1px 0px color-mix(in srgb, var(--tott-home-text-strong) 40%, transparent)",
              color: "var(--tott-auth-btn-text)",
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 500,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.005em",
              textAlign: "center",
              border: "none",
            }}
          >
            {busy ? t("submitting") : t("submit")}
          </button>
          <button
            type="button"
            onClick={() => !busy && onClose()}
            disabled={busy}
            className="inline-flex items-center justify-center transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{
              width: "86px",
              height: "40px",
              padding: "8px 16px",
              borderRadius: "8px",
              backgroundColor: "var(--tott-card-border)",
              boxShadow:
                "inset 0px 1px 1px color-mix(in srgb, var(--tott-home-text-strong) 8%, transparent)",
              color: "var(--tott-home-text-strong)",
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.005em",
              textAlign: "center",
              border: "none",
              flexShrink: 0,
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

// ── Reusable label+input group (Figma "Text Input" frame) ────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "40px",
  padding: "8px",
  paddingLeft: "12px",
  paddingRight: "12px",
  backgroundColor: "var(--tott-elevated)",
  border: "1px solid var(--tott-card-border)",
  borderRadius: "8px",
  boxSizing: "border-box",
  color: "var(--tott-home-text-strong)",
  fontFamily: "'Inter', var(--font-sans, sans-serif)",
  fontSize: "14px",
  fontWeight: 400,
  lineHeight: "20px",
  letterSpacing: "-0.005em",
  outline: "none",
};

// ── Success state (Modal-3) ──────────────────────────────────────

/** Confirmation view shown after a successful submit. Replaces the
 * three-band form layout with a single centered column: green-tinted
 * check badge, success heading, supporting copy, dark "View all
 * Notes" pill that closes the modal, and a muted "If you have any
 * questions — Contact us" footer. */
function SuccessView({
  titleId,
  descId,
  onClose,
}: {
  titleId: string;
  descId: string;
  onClose: () => void;
}) {
  const t = useTranslations("Home.writingRoom.submitModal");

  return (
    <div
      className="flex flex-col items-center text-center"
      style={{
        padding: "48px 40px 36px",
        gap: "16px",
        backgroundColor: "var(--tott-dash-surface)",
      }}
    >
      {/* Green check badge — muted forest green disk with a bright
          emerald checkmark, mixed off the existing positive token so
          the hue lines up with the rest of the dashboard. */}
      <span
        aria-hidden
        className="inline-flex shrink-0 items-center justify-center"
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "999px",
          backgroundColor:
            "color-mix(in srgb, var(--tott-dash-positive) 28%, var(--tott-panel-bg))",
          color: "var(--tott-dash-positive)",
          marginBottom: "8px",
        }}
      >
        <svg
          width="28"
          height="28"
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
          fontSize: "clamp(1.125rem, 2.4vw, 1.375rem)",
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
        className="max-w-xl"
        style={{
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "22px",
          letterSpacing: "-0.005em",
          color: "var(--tott-auth-subtitle)",
          margin: 0,
        }}
      >
        {t("successBody")}
      </p>

      <Link
        href="/dictionary"
        onClick={onClose}
        className="inline-flex items-center justify-center transition-opacity hover:opacity-90"
        style={{
          marginTop: "8px",
          height: "40px",
          padding: "8px 20px",
          gap: "8px",
          borderRadius: "8px",
          backgroundColor: "var(--tott-card-border)",
          boxShadow:
            "inset 0px 1px 1px color-mix(in srgb, var(--tott-home-text-strong) 8%, transparent)",
          color: "var(--tott-home-text-strong)",
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 500,
          fontSize: "14px",
          lineHeight: "20px",
          letterSpacing: "-0.005em",
          border: "none",
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
        {t("viewAllNotes")}
      </Link>

      {/* "If you have any questions [headset] Contact us" footer.
          Mirrors the existing ContactUsLink pattern but inlined so we
          control the modal-local typography and translation key. */}
      <p
        className="mt-2 flex flex-wrap items-center justify-center"
        style={{
          gap: "6px",
          fontFamily: "'Inter', var(--font-sans, sans-serif)",
          fontWeight: 400,
          fontSize: "14px",
          lineHeight: "20px",
          color: "var(--tott-auth-subtitle)",
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

function Field({
  label,
  optional,
  input,
}: {
  label: string;
  optional?: string;
  input: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col"
      style={{ gap: "8px", width: "100%" }}
    >
      <div className="flex flex-row items-center" style={{ gap: "4px" }}>
        <span
          style={{
            fontFamily: "'Inter', var(--font-sans, sans-serif)",
            fontWeight: 500,
            fontSize: "14px",
            lineHeight: "20px",
            letterSpacing: "-0.005em",
            color: "var(--tott-home-text-strong)",
          }}
        >
          {label}
        </span>
        {optional ? (
          <span
            style={{
              fontFamily: "'Inter', var(--font-sans, sans-serif)",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              letterSpacing: "-0.005em",
              color: "var(--tott-auth-subtitle)",
            }}
          >
            {optional}
          </span>
        ) : null}
      </div>
      {input}
    </div>
  );
}
