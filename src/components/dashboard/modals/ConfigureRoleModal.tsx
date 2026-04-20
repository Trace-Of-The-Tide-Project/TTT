"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { XIcon } from "@/components/ui/icons";
import { PermissionToggle } from "@/components/dashboard/admin/roles/PermissionToggle";
import {
  configureRolePermissionRows,
  type ConfigurePermissionId,
} from "@/lib/dashboard/roles-constants";

const TOGGLE_GOLD = "#E8DDC0";

function initialAllEnabled(): Record<ConfigurePermissionId, boolean> {
  return Object.fromEntries(
    configureRolePermissionRows.map((r) => [r.id, true]),
  ) as Record<ConfigurePermissionId, boolean>;
}

type ConfigureRoleModalProps = {
  open: boolean;
  onClose: () => void;
  roleDisplayName?: string;
};

export function ConfigureRoleModal({
  open,
  onClose,
  roleDisplayName,
}: ConfigureRoleModalProps) {
  const t = useTranslations("Dashboard.rolesPermissions.configureModal");
  const tRoles = useTranslations("Dashboard.rolesPermissions");
  const resolvedRoleName = roleDisplayName ?? tRoles("superAdminRoleName");

  const [perms, setPerms] = useState<Record<ConfigurePermissionId, boolean>>(initialAllEnabled);

  useEffect(() => {
    if (open) setPerms(initialAllEnabled());
  }, [open, resolvedRoleName]);

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

  if (!open) return null;

  const setPerm = (id: ConfigurePermissionId, value: boolean) => {
    setPerms((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label={t("closeModalAria")}
      />

      <div
        className="relative flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col rounded-2xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="configure-role-title"
      >
        <div className="flex shrink-0 items-start justify-between border-b border-[var(--tott-card-border)] px-6 py-5">
          <div>
            <h2 id="configure-role-title" className="text-lg font-bold text-foreground">
              {t("title", { role: resolvedRoleName })}
            </h2>
            <p className="mt-1 text-sm text-gray-500">{t("subtitle")}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-foreground transition-colors hover:bg-[var(--tott-dash-ghost-hover)]"
            aria-label={t("closeAria")}
          >
            <span className="[&_svg]:h-5 [&_svg]:w-5">
              <XIcon />
            </span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-2">
          <ul className="divide-y divide-[var(--tott-card-border)]">
            {configureRolePermissionRows.map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-4 py-4 first:pt-2">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">
                    {(t as (key: string) => string)(`rows.${row.id}.title`)}
                  </p>
                  <p className="mt-0.5 text-sm text-gray-500">
                    {(t as (key: string) => string)(`rows.${row.id}.description`)}
                  </p>
                </div>
                <PermissionToggle
                  checked={perms[row.id] ?? false}
                  onChange={(v) => setPerm(row.id, v)}
                  checkedColor={TOGGLE_GOLD}
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="flex shrink-0 justify-end gap-3 border-t border-[var(--tott-card-border)] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)]"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-5 py-2.5 text-sm font-semibold text-gray-900 transition-opacity hover:opacity-90"
            style={{ backgroundColor: TOGGLE_GOLD }}
          >
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
