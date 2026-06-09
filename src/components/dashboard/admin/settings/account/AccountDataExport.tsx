"use client";

import { useTranslations } from "next-intl";
import { DownloadIcon } from "@/components/ui/icons";
import { useExportAccountData } from "@/hooks/mutations/account";
import { accountErrorMessage } from "@/services/account.service";
import { settingsCardClass } from "../SettingsPrimitives";

export function AccountDataExport() {
  const t = useTranslations("Dashboard.account");
  const exportMutation = useExportAccountData();

  return (
    <section className={settingsCardClass} style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-foreground">{t("export.title")}</h2>
          <p className="mt-1 text-sm text-gray-500">{t("export.subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => exportMutation.mutate()}
          disabled={exportMutation.isPending}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <DownloadIcon />
          {exportMutation.isPending ? t("export.exporting") : t("export.download")}
        </button>
      </div>

      {exportMutation.isError ? (
        <p className="mt-4 text-sm text-[var(--tott-dash-negative)]" role="alert">
          {accountErrorMessage(exportMutation.error, t("export.error"))}
        </p>
      ) : null}
      {exportMutation.isSuccess ? (
        <p className="mt-4 text-sm text-[var(--tott-dash-positive)]" role="status">
          {t("export.success")}
        </p>
      ) : null}
    </section>
  );
}
