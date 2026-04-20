"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { NotificationsAdminPage } from "@/components/dashboard/admin/notifications/NotificationsAdminPage";

function NotificationsRouteFallback() {
  const t = useTranslations("Dashboard.notificationsPage");
  return <div className="p-6 text-sm text-gray-500">{t("loading")}</div>;
}

export default function NotificationsPage() {
  return (
    <Suspense fallback={<NotificationsRouteFallback />}>
      <NotificationsAdminPage />
    </Suspense>
  );
}
