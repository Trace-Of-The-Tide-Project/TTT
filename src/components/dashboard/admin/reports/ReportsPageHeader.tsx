"use client";

import { useTranslations } from "next-intl";
import {
  AlertTriangleIcon,
  FlagIcon,
  SquareCheckIcon,
  UsersIcon,
} from "@/components/ui/icons";

export function ReportsPageHeader() {
  const t = useTranslations("Dashboard.headers.reports");
  return (
    <div className="px-6 py-6 sm:px-8 sm:py-8">
      <div className="pb-6">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">{t("title")}</h1>
        <p className="mt-1 text-sm text-gray-500">{t("subtitle")}</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-5">
          <span className="text-[#E8DDC0]">
            <FlagIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">8</span>
          <span className="text-xs text-gray-500">{t("cards.pendingReports")}</span>
        </div>

        <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-5">
          <span className="text-[#E8DDC0]">
            <AlertTriangleIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">3</span>
          <span className="text-xs text-gray-500">{t("cards.contentFlagged")}</span>
        </div>

        <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-5">
          <span className="text-[#E8DDC0]">
            <UsersIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">2</span>
          <span className="text-xs text-gray-500">{t("cards.usersReported")}</span>
        </div>

        <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-5">
          <span className="text-[#E8DDC0]">
            <SquareCheckIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">24</span>
          <span className="text-xs text-gray-500">{t("cards.resolvedToday")}</span>
        </div>
      </div>
    </div>
  );
}
