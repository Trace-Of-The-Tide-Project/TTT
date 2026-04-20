"use client";

import { useCallback, useId, useState, type FormEvent } from "react";
import { isAxiosError } from "axios";
import { useTranslations } from "next-intl";
import { EyeIcon } from "@/components/ui/icons";
import { theme } from "@/lib/theme";
import { changePassword } from "@/services/auth.service";
import { settingsCardClass } from "./SettingsPrimitives";

const inputWrapClass =
  "relative flex items-center rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] focus-within:border-[#C9A96E]";
const inputClass =
  "w-full border-0 bg-transparent py-3 pl-4 pr-12 text-sm text-foreground placeholder:text-gray-500 outline-none";

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

type PasswordFieldProps = {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: "current-password" | "new-password";
  showLabel: string;
  hideLabel: string;
  visible: boolean;
  onToggleVisible: () => void;
};

function PasswordField({
  id,
  label,
  placeholder,
  value,
  onChange,
  autoComplete,
  showLabel,
  hideLabel,
  visible,
  onToggleVisible,
}: PasswordFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs text-gray-500">
        {label}
      </label>
      <div className={inputWrapClass}>
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputClass}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={onToggleVisible}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-gray-500 transition-colors hover:bg-[var(--tott-dash-control-hover)] hover:text-foreground"
          aria-label={visible ? hideLabel : showLabel}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  );
}

function changePasswordErrMessage(e: unknown, fallback: string): string {
  if (isAxiosError(e)) {
    const d = e.response?.data;
    if (typeof d === "string" && d.trim()) return d;
    if (d && typeof d === "object") {
      const o = d as Record<string, unknown>;
      const nested = o.data;
      if (nested && typeof nested === "object") {
        const m = (nested as Record<string, unknown>).message;
        if (typeof m === "string" && m.trim()) return m;
      }
      if (typeof o.message === "string" && o.message.trim()) return o.message;
      if (typeof o.error === "string" && o.error.trim()) return o.error;
    }
    return e.message || fallback;
  }
  if (e instanceof Error) return e.message;
  return fallback;
}

export function AdminChangePassword() {
  const t = useTranslations("Dashboard.changePassword");
  const baseId = useId();
  const currentId = `${baseId}-current`;
  const newId = `${baseId}-new`;
  const confirmId = `${baseId}-confirm`;
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      setSuccessMessage(null);

      if (!current.trim() || !next.trim() || !confirm.trim()) {
        setError(t("validation.allFields"));
        return;
      }
      if (next.length < 8) {
        setError(t("validation.minLength"));
        return;
      }
      if (next !== confirm) {
        setError(t("validation.mismatch"));
        return;
      }

      setSubmitting(true);
      try {
        const { message } = await changePassword({
          currentPassword: current,
          newPassword: next,
        });
        setSuccessMessage(message);
        setCurrent("");
        setNext("");
        setConfirm("");
        window.setTimeout(() => setSuccessMessage(null), 4000);
      } catch (err) {
        setError(changePasswordErrMessage(err, t("errors.generic")));
      } finally {
        setSubmitting(false);
      }
    },
    [current, next, confirm, t],
  );

  return (
    <div className="mx-auto max-w-3xl">
      <form
        onSubmit={handleSubmit}
        className={settingsCardClass}
        style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}
      >
        <h1 className="text-lg font-bold text-foreground">{t("title")}</h1>

        <div className="mt-6 space-y-5">
          <PasswordField
            id={currentId}
            label={t("currentPassword")}
            placeholder={t("currentPasswordPlaceholder")}
            value={current}
            onChange={setCurrent}
            autoComplete="current-password"
            showLabel={t("showPassword")}
            hideLabel={t("hidePassword")}
            visible={showCurrent}
            onToggleVisible={() => setShowCurrent((v) => !v)}
          />
          <PasswordField
            id={newId}
            label={t("newPassword")}
            placeholder={t("newPasswordPlaceholder")}
            value={next}
            onChange={setNext}
            autoComplete="new-password"
            showLabel={t("showPassword")}
            hideLabel={t("hidePassword")}
            visible={showNew}
            onToggleVisible={() => setShowNew((v) => !v)}
          />
          <PasswordField
            id={confirmId}
            label={t("confirmPassword")}
            placeholder={t("confirmPasswordPlaceholder")}
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
            showLabel={t("showPassword")}
            hideLabel={t("hidePassword")}
            visible={showConfirm}
            onToggleVisible={() => setShowConfirm((v) => !v)}
          />
        </div>

        {error ? (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        {successMessage ? (
          <p className="mt-4 text-sm text-green-700" role="status">
            {successMessage}
          </p>
        ) : null}

        <div className="mt-8">
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg py-3.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ backgroundColor: theme.accentGold }}
          >
            {submitting ? t("submitting") : t("submit")}
          </button>
        </div>
      </form>
    </div>
  );
}
