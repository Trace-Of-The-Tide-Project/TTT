"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { XIcon } from "@/components/ui/icons";
import { theme } from "@/lib/theme";
import type { Badge } from "@/lib/dashboard/engagements-constants";

type AwardBadgeModalProps = {
  open: boolean;
  badge: Badge | null;
  onClose: () => void;
  onAward: (payload: { badgeId: string; userQuery: string; description: string; criteria: string }) => void;
};

export function AwardBadgeModal({ open, badge, onClose, onAward }: AwardBadgeModalProps) {
  const ta = useTranslations("Dashboard.engagementsPage.awardBadgeModal");
  const [userQuery, setUserQuery] = useState("");
  const [description, setDescription] = useState("");
  const [criteria, setCriteria] = useState("");

  const canSubmit = useMemo(
    () => Boolean(badge) && userQuery.trim().length > 0,
    [badge, userQuery],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
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

  useEffect(() => {
    if (!open) return;
    setUserQuery("");
    setDescription("");
    setCriteria("");
  }, [open, badge?.id]);

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
            <h2 className="text-lg font-bold text-foreground">{ta("title", { name: badge.name })}</h2>
            <p className="mt-1 text-sm text-gray-500">{badge.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
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
            <label className="mb-1.5 block text-sm font-medium text-foreground">{ta("searchUser")}</label>
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder={ta("userPlaceholder")}
              className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2.5 text-sm placeholder:text-gray-500 outline-none transition-colors focus:border-gray-500"
              style={{ color: "#e5e7eb" }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{ta("description")}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={ta("descriptionPlaceholder")}
              rows={4}
              className="w-full resize-y rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2.5 text-sm placeholder:text-gray-500 outline-none transition-colors focus:border-gray-500"
              style={{ color: "#e5e7eb" }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{ta("criteria")}</label>
            <textarea
              value={criteria}
              onChange={(e) => setCriteria(e.target.value)}
              placeholder={ta("criteriaPlaceholder")}
              rows={4}
              className="w-full resize-y rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2.5 text-sm placeholder:text-gray-500 outline-none transition-colors focus:border-gray-500"
              style={{ color: "#e5e7eb" }}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-6 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-gray-500 hover:text-foreground"
            >
              {ta("cancel")}
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-lg px-6 py-2 text-sm font-medium text-black transition-colors disabled:opacity-50"
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

