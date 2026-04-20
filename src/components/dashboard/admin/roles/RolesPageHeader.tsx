"use client";

import { useTranslations } from "next-intl";
import { DashboardHeader } from "@/components/dashboard/shared/DashboardHeader";

export function RolesPageHeader() {
  const t = useTranslations("Dashboard.headers.roles");
  return <DashboardHeader title={t("title")} subtitle={t("subtitle")} />;
}
