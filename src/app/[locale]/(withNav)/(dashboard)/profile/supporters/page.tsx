"use client";

import { useTranslations } from "next-intl";
import { DashboardHeader } from "@/components/dashboard/shared/DashboardHeader";
import { SupportersContent } from "@/components/dashboard/profile/SupportersContent";

export default function SupportersPage() {
  const t = useTranslations("Dashboard.profileSupporters");

  return (
    <div>
      <DashboardHeader title={t("title")} subtitle={t("subtitle")} />
      <SupportersContent />
    </div>
  );
}
