"use client";

import { useTranslations } from "next-intl";
import { DashboardHeader } from "@/components/dashboard/shared/DashboardHeader";

export function ContentLibraryPageHeader() {
  const t = useTranslations("Dashboard.headers.contentLibrary");
  return <DashboardHeader title={t("title")} subtitle={t("subtitle")} />;
}
