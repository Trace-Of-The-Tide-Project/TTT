"use client";

import { useTranslations } from "next-intl";
import { DashboardHeader } from "@/components/dashboard/shared/DashboardHeader";

export function AdminSettingsPageHeader() {
  const t = useTranslations("Dashboard.headers.adminSettings");
  return <DashboardHeader lastUpdated title={t("title")} subtitle={t("subtitle")} />;
}
