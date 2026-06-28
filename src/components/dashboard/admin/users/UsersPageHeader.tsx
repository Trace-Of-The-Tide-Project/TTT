"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { DashboardHeader } from "@/components/dashboard/shared/DashboardHeader";
import { DownloadIcon, PlusIcon } from "@/components/ui/icons";
import { requestUsersCsvExport } from "@/lib/dashboard/users-export-events";
import { AddUserModal } from "./UserModals";

export function UsersPageHeader() {
  const t = useTranslations("Dashboard.headers.users");
  const [addOpen, setAddOpen] = useState(false);
  return (
    <>
      <DashboardHeader
          lastUpdated
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <div className="flex w-full min-w-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => requestUsersCsvExport()}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-surface-inset)] sm:w-auto sm:justify-start sm:py-2"
            >
              <DownloadIcon />
              {t("exportCsv")}
            </button>
            <button
              type="button"
              onClick={() => setAddOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors sm:w-auto sm:py-2"
              style={{ backgroundColor: "#C9A96E", color: "#000" }}
            >
              <PlusIcon />
              {t("addUser")}
            </button>
          </div>
        }
      />
      <AddUserModal open={addOpen} onClose={() => setAddOpen(false)} />
    </>
  );
}
