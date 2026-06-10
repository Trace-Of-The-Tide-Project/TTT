"use client";

import { Suspense } from "react";
import { NotificationsAdminPage } from "@/components/dashboard/admin/notifications/NotificationsAdminPage";
import { SkeletonTable } from "@/components/ui/SkeletonTable";

export default function NotificationsPage() {
  return (
    <Suspense fallback={<SkeletonTable rows={5} />}>
      <NotificationsAdminPage />
    </Suspense>
  );
}
