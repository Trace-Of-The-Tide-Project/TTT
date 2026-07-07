"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { XIcon } from "@/components/ui/icons";
import { RichTextEditor, EditorToolbar, EditorRegistryProvider } from "@/components/ui/rich-text";
import { theme } from "@/lib/theme";
import type { Badge } from "@/lib/dashboard/engagements-constants";

type AwardBadgeModalProps = {
  open: boolean;
  badge: Badge | null;
  onClose: () => void;
  onAward: (payload: {
    badgeId: string;
    userQuery: string;
    description: string;
    criteria: string;
  }) => void;
};

export function AwardBadgeModal({ open, badge, onClose, onAward }: AwardBadgeModalProps) {
  const ta = useTranslations("Dashboard.engagementsPage.awardBadgeModal");
  const [userQuery, setUserQuery] = useState("");
  const [description, setDescription] = useState("");
  const [criteria, setCriteria] = useState("");

  const canSubmit = useMemo(
    () => Boolean(badge) && userQuery.trim().length > 0,
    [badge, userQuery]
  );

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

  // Reset form fields each time the modal opens or the target badge
  // changes. React 19 prefers adjusting state during render (with a
  // previous-value tracker) over doing it in an effect.
  const openKey = open ? (badge?.id ?? "open") : null;
  const [prevOpenKey, setPrevOpenKey] = useState<string | null>(null);
  if (openKey && openKey !== prevOpenKey) {
    setPrevOpenKey(openKey);
    setUserQuery("");
    setDescription("");
    setCriteria("");
  } else if (!openKey && prevOpenKey !== null) {
    setPrevOpenKey(null);
  }

  if (!open || !badge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={ta("closeModalAria")}
      />

      <div className="relative mx-4 w-full max-w-lg rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6">
        <div className="mb-5 flex items-start justify-between border-b border-[var(--tott-card-border)] pb-5">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {ta("title", { name: badge.name })}
            </h2>
            <p className="mt-1 text-sm text-[var(--tott-muted)]">{badge.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-[var(--tott-muted)] transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
            aria-label={ta("closeAria")}
          >
            <XIcon />
          </button>
        </div>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) return;
            onAward({
              badgeId: badge.id,
              userQuery: userQuery.trim(),
              description: description.trim(),
              criteria: criteria.trim(),
            });
            onClose();
          }}
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              {ta("searchUser")}
            </label>
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder={ta("userPlaceholder")}
              className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2.5 text-sm placeholder:text-[var(--tott-muted)] outline-none transition-colors focus:border-[var(--tott-card-border)]"
              style={{ color: "var(--foreground)" }}
            />
          </div>

          <EditorRegistryProvider>
            <div className="rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)]">
              <EditorToolbar />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {ta("description")}
              </label>
              <div className="overflow-hidden rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)]">
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder={ta("descriptionPlaceholder")}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                {ta("criteria")}
              </label>
              <div className="overflow-hidden rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)]">
                <RichTextEditor
                  value={criteria}
                  onChange={setCriteria}
                  placeholder={ta("criteriaPlaceholder")}
                />
              </div>
            </div>
          </EditorRegistryProvider>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-6 py-2 text-sm font-medium text-[var(--tott-muted)] transition-colors hover:border-[var(--tott-card-border)] hover:text-foreground"
            >
              {ta("cancel")}
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-lg px-6 py-2 text-sm font-medium text-[var(--tott-on-accent)] transition-colors disabled:opacity-50"
              style={{ backgroundColor: theme.accentGoldFocus }}
            >
              {ta("submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
