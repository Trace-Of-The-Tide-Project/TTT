"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";
import { Modal } from "@/components/ui/Modal";

const inputWrapClass =
  "relative flex items-center rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] focus-within:border-[var(--tott-accent-gold)]";
const inputClass =
  "w-full border-0 bg-transparent py-3 pl-4 pr-12 text-sm text-foreground placeholder:text-[var(--tott-muted)] outline-none";

type PasswordConfirmModalProps = {
  open: boolean;
  title: string;
  description: string;
  /** Confirm button label. */
  confirmLabel: string;
  /** Label while the action runs. */
  confirmBusyLabel: string;
  /** When set, the user must type this exact string (e.g. "DELETE") to enable confirm. */
  typeToConfirm?: string;
  /** Disable interactions while the action runs. */
  busy?: boolean;
  /** Error to surface (e.g. wrong password). */
  error?: string | null;
  onClose: () => void;
  /** Receives the entered password. */
  onConfirm: (password: string) => void;
};

/**
 * A password-confirmation modal for destructive account actions. Built on the
 * shared {@link Modal} so it can host a real password field (which ConfirmDialog
 * cannot). Optionally gates confirmation behind a type-to-confirm phrase.
 */
export function PasswordConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  confirmBusyLabel,
  typeToConfirm,
  busy,
  error,
  onClose,
  onConfirm,
}: PasswordConfirmModalProps) {
  const t = useTranslations("Dashboard.account");
  const [password, setPassword] = useState("");
  const [phrase, setPhrase] = useState("");
  const [visible, setVisible] = useState(false);

  function handleClose() {
    if (busy) return;
    setPassword("");
    setPhrase("");
    setVisible(false);
    onClose();
  }

  const phraseOk = !typeToConfirm || phrase.trim() === typeToConfirm;
  const canConfirm = password.trim().length > 0 && phraseOk && !busy;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canConfirm) return;
    onConfirm(password);
  }

  return (
    <Modal
      open={open}
      title={title}
      busy={busy}
      onClose={handleClose}
      footer={
        <>
          <button
            type="button"
            disabled={busy}
            onClick={handleClose}
            className="rounded-lg border border-[var(--tott-card-border)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--tott-muted)] transition-colors hover:bg-[var(--tott-dash-control-bg)] disabled:opacity-50"
          >
            {t("modal.cancel")}
          </button>
          <button
            type="submit"
            form="password-confirm-form"
            disabled={!canConfirm}
            className="rounded-lg border border-red-900/60 bg-red-950/50 px-4 py-2 text-sm font-medium text-red-200 transition-colors hover:bg-red-950/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? confirmBusyLabel : confirmLabel}
          </button>
        </>
      }
    >
      <form id="password-confirm-form" onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-[var(--tott-muted)]">{description}</p>

        <div>
          <label className="mb-1.5 block text-xs text-[var(--tott-muted)]">
            {t("modal.passwordLabel")}
          </label>
          <div className={inputWrapClass}>
            <input
              type={visible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("modal.passwordPlaceholder")}
              className={inputClass}
              autoComplete="current-password"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-[var(--tott-muted)] transition-colors hover:bg-[var(--tott-dash-control-hover)] hover:text-foreground"
              aria-label={visible ? t("modal.hidePassword") : t("modal.showPassword")}
            >
              {visible ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {typeToConfirm ? (
          <div>
            <label className="mb-1.5 block text-xs text-[var(--tott-muted)]">
              {t("modal.typeToConfirmLabel", { phrase: typeToConfirm })}
            </label>
            <div className={inputWrapClass}>
              <input
                type="text"
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                placeholder={typeToConfirm}
                className="w-full border-0 bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-[var(--tott-muted)] outline-none"
                autoComplete="off"
              />
            </div>
          </div>
        ) : null}

        {error ? (
          <p
            className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200"
            role="alert"
          >
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
