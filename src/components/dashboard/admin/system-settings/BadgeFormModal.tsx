"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { XIcon } from "@/components/ui/icons";
import { BADGE_ICON_OPTIONS } from "@/components/dashboard/admin/system-settings/badge-icon-options";
import type { BadgeIconId } from "@/lib/dashboard/system-settings-constants";
import { routing } from "@/i18n/routing";
import { LocaleNameFields } from "./LocaleNameFields";

const ACCENT = "#E8DDC0";

const DEFAULT_ICON: BadgeIconId = "gift";

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

type BadgeFormModalProps = {
  open: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  badgeId?: string;
  initialIconId?: BadgeIconId;
  initialName?: string;
  initialMilestone?: string;
  /** Existing per-language names (edit mode), keyed by locale. */
  initialNameI18n?: Record<string, string>;
  onSave: (payload: {
    id?: string;
    iconId: BadgeIconId;
    name: string;
    milestone: string;
    name_i18n?: Record<string, string>;
  }) => void;
};

export function BadgeFormModal({
  open,
  onClose,
  mode,
  badgeId,
  initialIconId = DEFAULT_ICON,
  initialName = "",
  initialMilestone = "",
  initialNameI18n,
  onSave,
}: BadgeFormModalProps) {
  const t = useTranslations("Dashboard.systemSettings");
  const [iconId, setIconId] = useState<BadgeIconId>(DEFAULT_ICON);
  const [name, setName] = useState("");
  const [milestone, setMilestone] = useState("");
  const [i18n, setI18n] = useState<Record<string, string>>({});

  // Reset form fields each time the modal opens. React 19 prefers
  // adjusting state during render over doing it in an effect.
  const openKey = open
    ? `${mode}|${initialIconId}|${initialName}|${initialMilestone}|${JSON.stringify(initialNameI18n ?? {})}`
    : null;
  const [prevOpenKey, setPrevOpenKey] = useState<string | null>(null);
  if (openKey && openKey !== prevOpenKey) {
    setPrevOpenKey(openKey);
    if (mode === "edit") {
      setIconId(initialIconId);
      setName(initialName);
      setMilestone(initialMilestone);
      setI18n(nonDefaultI18n(initialNameI18n));
    } else {
      setIconId(DEFAULT_ICON);
      setName("");
      setMilestone("");
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

  const title = mode === "add" ? t("badgeModal.addTitle") : t("badgeModal.editTitle");
  const subtitle =
    mode === "add" ? t("badgeModal.addSubtitle") : t("badgeModal.editSubtitle");
  const primaryLabel = mode === "add" ? t("badgeModal.createLabel") : t("saveChanges");
  const titleId = "badge-form-modal-title";

  const submit = () => {
    const n = name.trim();
    const m = milestone.trim();
    if (!n || !m) return;
    onSave({ id: badgeId, iconId, name: n, milestone: m, name_i18n: buildNameI18n(n, i18n) });
    onClose();
  };

  const inputClass =
    "mt-2 w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2.5 text-sm text-foreground placeholder:text-[var(--tott-muted)] focus:border-[var(--tott-card-border)] focus:outline-none";
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
        className="relative max-h-[min(90vh,640px)] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] shadow-xl"
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

        <div className="space-y-5 px-6 py-5">
          <div>
            <p className="text-sm font-medium text-foreground">{t("badgeModal.iconLabel")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {BADGE_ICON_OPTIONS.map(({ id, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setIconId(id)}
                  className={`flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] text-[var(--tott-muted)] transition-colors ${
                    iconId === id ? "border-[var(--tott-accent-gold)]" : "border-[var(--tott-card-border)] hover:border-[var(--tott-card-border)]"
                  }`}
                  aria-label={t("badgeModal.selectIconAria", { id })}
                  aria-pressed={iconId === id}
                >
                  <span className="[&_svg]:h-[18px] [&_svg]:w-[18px]">
                    <Icon />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="badge-name" className="block text-sm font-medium text-foreground">
              {t("badgeModal.nameLabel")}
            </label>
            <input
              id="badge-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={mode === "add" ? t("badgeModal.namePlaceholder") : undefined}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="badge-milestone" className="block text-sm font-medium text-foreground">
              {t("badgeModal.milestoneLabel")}
            </label>
            <input
              id="badge-milestone"
              type="text"
              value={milestone}
              onChange={(e) => setMilestone(e.target.value)}
              placeholder={mode === "add" ? t("badgeModal.milestonePlaceholder") : undefined}
              className={inputClass}
            />
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
            disabled={!name.trim() || !milestone.trim()}
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
