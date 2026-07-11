"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { XIcon } from "@/components/ui/icons";
import { routing } from "@/i18n/routing";
import { LocaleNameFields } from "./LocaleNameFields";

const ACCENT = "var(--tott-stat-icon)";

/** name_i18n = canonical default-locale name + any non-empty other-language names. */
function buildNameI18n(
  defaultName: string,
  others: Record<string, string>,
): Record<string, string> {
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

function slugWithoutSlash(s: string) {
  return s.trim().replace(/^\//, "");
}

function toStoredSlug(input: string) {
  const core = slugWithoutSlash(input);
  return core ? `/${core}` : "";
}

type CategoryFormModalProps = {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  /** When editing, pass id so parent can update the right row */
  categoryId?: string;
  initialName?: string;
  initialSlug?: string;
  /** Existing per-language names (edit mode), keyed by locale. */
  initialNameI18n?: Record<string, string>;
  onSave: (payload: {
    id?: string;
    name: string;
    slug: string;
    name_i18n?: Record<string, string>;
  }) => void;
};

export function CategoryFormModal({
  open,
  onClose,
  mode,
  categoryId,
  initialName = "",
  initialSlug = "",
  initialNameI18n,
  onSave,
}: CategoryFormModalProps) {
  const t = useTranslations("Dashboard.systemSettings");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  // Other-language names (excludes the default locale, which is `name`).
  const [i18n, setI18n] = useState<Record<string, string>>({});

  // Reset form fields each time the modal opens. React 19 prefers
  // adjusting state during render over doing it in an effect.
  const openKey = open
    ? `${mode}|${initialName}|${initialSlug}|${JSON.stringify(initialNameI18n ?? {})}`
    : null;
  const [prevOpenKey, setPrevOpenKey] = useState<string | null>(null);
  if (openKey && openKey !== prevOpenKey) {
    setPrevOpenKey(openKey);
    if (mode === "edit") {
      setName(initialName);
      setSlug(slugWithoutSlash(initialSlug));
      setI18n(nonDefaultI18n(initialNameI18n));
    } else {
      setName("");
      setSlug("");
      setI18n({});
    }
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

  const title = mode === "add" ? t("categoryModal.addTitle") : t("categoryModal.editTitle");
  const subtitle =
    mode === "add" ? t("categoryModal.addSubtitle") : t("categoryModal.editSubtitle");
  const primaryLabel = mode === "add" ? t("categoryModal.createLabel") : t("categoryModal.saveLabel");
  const titleId = "category-form-modal-title";

  const submit = () => {
    const stored = toStoredSlug(slug);
    if (!name.trim() || !stored) return;
    onSave({
      id: categoryId,
      name: name.trim(),
      slug: stored,
      name_i18n: buildNameI18n(name.trim(), i18n),
    });
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

        <div className="space-y-4 px-6 py-5">
          <div>
            <label htmlFor="category-name" className="block text-sm font-medium text-foreground">
              {t("categoryModal.nameLabel")}
            </label>
            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={mode === "add" ? t("categoryModal.namePlaceholder") : undefined}
              className="mt-2 w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-3 py-2.5 text-sm text-foreground placeholder:text-[var(--tott-muted)] focus:border-[var(--tott-card-border)] focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="category-slug" className="block text-sm font-medium text-foreground">
              {t("categoryModal.slugLabel")}
            </label>
            <input
              id="category-slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={mode === "add" ? t("categoryModal.slugPlaceholder") : undefined}
              className="mt-2 w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-3 py-2.5 text-sm text-foreground placeholder:text-[var(--tott-muted)] focus:border-[var(--tott-card-border)] focus:outline-none"
            />
            <p className="mt-1.5 text-xs text-[var(--tott-muted)]">{t("categoryModal.slugHint")}</p>
          </div>
          <LocaleNameFields
            values={i18n}
            onChange={(loc, val) => setI18n((prev) => ({ ...prev, [loc]: val }))}
            inputClassName={inputClass}
            labelClassName={labelClass}
          />
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
            disabled={!name.trim() || !slugWithoutSlash(slug)}
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
