"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { XIcon } from "@/components/ui/icons";
import { routing } from "@/i18n/routing";
import { EXTENDED_TRANSLATIONS_ENABLED } from "@/services/translations.service";
import { LocaleNameFields } from "./LocaleNameFields";

const ACCENT = "#E8DDC0";

// See docs/backend-asks-translations.md — name_i18n only sent when the flag is
// on, so the current backend never receives an unknown column.
function buildNameI18n(
  defaultName: string,
  others: Record<string, string>,
): Record<string, string> | undefined {
  if (!EXTENDED_TRANSLATIONS_ENABLED) return undefined;
  const out: Record<string, string> = { [routing.defaultLocale]: defaultName };
  for (const [loc, val] of Object.entries(others)) {
    if (val.trim()) out[loc] = val.trim();
  }
  return out;
}

function nonDefaultI18n(src?: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  if (!src) return out;
  for (const [loc, val] of Object.entries(src)) {
    if (loc !== routing.defaultLocale && val) out[loc] = val;
  }
  return out;
}

type TagFormModalProps = {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  tagId?: string;
  initialLabel?: string;
  /** Existing per-language names (edit mode), keyed by locale. */
  initialNameI18n?: Record<string, string>;
  onSave: (payload: {
    id?: string;
    label: string;
    name_i18n?: Record<string, string>;
  }) => void;
};

export function TagFormModal({
  open,
  onClose,
  mode,
  tagId,
  initialLabel = "",
  initialNameI18n,
  onSave,
}: TagFormModalProps) {
  const t = useTranslations("Dashboard.systemSettings");
  const [label, setLabel] = useState("");
  const [i18n, setI18n] = useState<Record<string, string>>({});

  // Reset the label each time the modal opens. React 19 prefers
  // adjusting state during render over doing it in an effect.
  const openKey = open
    ? `${mode}|${initialLabel}|${JSON.stringify(initialNameI18n ?? {})}`
    : null;
  const [prevOpenKey, setPrevOpenKey] = useState<string | null>(null);
  if (openKey && openKey !== prevOpenKey) {
    setPrevOpenKey(openKey);
    setLabel(mode === "edit" ? initialLabel : "");
    setI18n(mode === "edit" ? nonDefaultI18n(initialNameI18n) : {});
  } else if (!openKey && prevOpenKey !== null) {
    setPrevOpenKey(null);
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const title = mode === "add" ? t("tagModal.addTitle") : t("tagModal.editTitle");
  const subtitle =
    mode === "add" ? t("tagModal.addSubtitle") : t("tagModal.editSubtitle");
  const primaryLabel = mode === "add" ? t("tagModal.createLabel") : t("saveChanges");
  const titleId = "tag-form-modal-title";

  const submit = () => {
    const trimmed = label.trim();
    if (!trimmed) return;
    onSave({ id: tagId, label: trimmed, name_i18n: buildNameI18n(trimmed, i18n) });
    onClose();
  };

  const inputClass =
    "mt-2 w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-3 py-2.5 text-sm text-foreground placeholder:text-[var(--tott-muted)] focus:border-[var(--tott-card-border)] focus:outline-none";
  const labelClass = "block text-sm font-medium text-foreground";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={t("modal.closeModal")}
      />

      <div
        className="relative w-full max-w-lg rounded-2xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="flex items-start justify-between border-b border-[var(--tott-card-border)] px-6 py-5">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-foreground">
              {title}
            </h2>
            <p className="mt-1 text-sm text-[var(--tott-muted)]">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-foreground transition-colors hover:bg-[var(--tott-dash-ghost-hover)]"
            aria-label={t("modal.close")}
          >
            <span className="[&_svg]:h-5 [&_svg]:w-5">
              <XIcon />
            </span>
          </button>
        </div>

        <div className="px-6 py-5">
          <label htmlFor="tag-label" className="block text-sm font-medium text-foreground">
            {t("tagModal.nameLabel")}
          </label>
          <input
            id="tag-label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder={mode === "add" ? t("tagModal.namePlaceholder") : undefined}
            className="mt-2 w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-3 py-2.5 text-sm text-foreground placeholder:text-[var(--tott-muted)] focus:border-[var(--tott-card-border)] focus:outline-none"
          />
          {EXTENDED_TRANSLATIONS_ENABLED ? (
            <div className="mt-4">
              <LocaleNameFields
                values={i18n}
                onChange={(loc, val) => setI18n((prev) => ({ ...prev, [loc]: val }))}
                inputClassName={inputClass}
                labelClassName={labelClass}
              />
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 border-t border-[var(--tott-card-border)] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-ghost-hover)]"
          >
            {t("modal.cancel")}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!label.trim()}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-[var(--tott-on-accent)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ backgroundColor: ACCENT }}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
