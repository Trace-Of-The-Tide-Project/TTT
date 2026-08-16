"use client";

import { Suspense } from "react";
import { SessionsManagementContent } from "@/components/dashboard/admin/sessions/SessionsManagementContent";
import { SkeletonTable } from "@/components/ui/SkeletonTable";

export default function AdminSessionsPage() {
  return (
    <div className="my-4 mx-10">
      <Suspense fallback={<SkeletonTable />}>
        <SessionsManagementContent />
      </Suspense>
    </div>
  );
}
