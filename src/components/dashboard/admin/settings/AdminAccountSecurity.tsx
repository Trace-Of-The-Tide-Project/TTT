"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { TrashIcon } from "@/components/ui/icons";
import { settingsCardClass } from "./SettingsPrimitives";

export function AdminAccountSecurity() {
  const t = useTranslations("Dashboard.adminAccount");
  const [busy, setBusy] = useState(false);

  const onDeactivate = useCallback(() => {
    const ok = window.confirm(t("deactivateConfirm"));
    if (!ok) return;
    setBusy(true);
    window.setTimeout(() => setBusy(false), 1200);
  }, [t]);

  return (
    <div className="mx-auto max-w-3xl">
      <div className={settingsCardClass} style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}>
        <h1 className="text-lg font-bold text-foreground">{t("pageTitle")}</h1>

        <div className="mt-6 flex flex-col gap-4 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)]/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{t("deactivateTitle")}</p>
            <p className="mt-2 text-sm text-gray-500">{t("deactivateDescription")}</p>
          </div>
          <button
            type="button"
            onClick={onDeactivate}
            disabled={busy}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <TrashIcon />
            {t("deactivateButton")}
          </button>
        </div>
      </div>
    </div>
  );
}
