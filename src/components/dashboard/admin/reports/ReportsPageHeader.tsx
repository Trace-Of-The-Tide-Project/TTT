"use client";

import { useTranslations } from "next-intl";
import {
  AlertTriangleIcon,
  FlagIcon,
  SquareCheckIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";

export function ReportsPageHeader() {
  const t = useTranslations("Dashboard.headers.reports");
  return (
    <div className="px-6 py-6 sm:px-8 sm:py-8">
      <div className="pb-6">
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">{t("title")}</h1>
        <p className="mt-1 text-sm text-gray-500">{t("subtitle")}</p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative flex flex-col items-center gap-2 px-4 py-7"><ChamferedFrame />
          <span className="text-[var(--tott-stat-icon)]">
            <FlagIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">8</span>
          <span className="text-xs text-gray-500">{t("cards.pendingReports")}</span>
        </div>

        <div className="relative flex flex-col items-center gap-2 px-4 py-7"><ChamferedFrame />
          <span className="text-[var(--tott-stat-icon)]">
            <AlertTriangleIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">3</span>
          <span className="text-xs text-gray-500">{t("cards.contentFlagged")}</span>
        </div>

        <div className="relative flex flex-col items-center gap-2 px-4 py-7"><ChamferedFrame />
          <span className="text-[var(--tott-stat-icon)]">
            <UsersIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">2</span>
          <span className="text-xs text-gray-500">{t("cards.usersReported")}</span>
        </div>

        <div className="relative flex flex-col items-center gap-2 px-4 py-7"><ChamferedFrame />
          <span className="text-[var(--tott-stat-icon)]">
            <SquareCheckIcon />
          </span>
          <span className="text-2xl font-bold text-foreground">24</span>
          <span className="text-xs text-gray-500">{t("cards.resolvedToday")}</span>
        </div>
      </div>
    </div>
  );
}
