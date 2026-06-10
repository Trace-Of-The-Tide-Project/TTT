"use client";

import { Suspense } from "react";
import { UsersManagementContent } from "@/components/dashboard/admin/users/UsersManagementContent";
import { SkeletonTable } from "@/components/ui/SkeletonTable";

export default function UsersPage() {
  return (
    <Suspense fallback={<SkeletonTable />}>
      <UsersManagementContent />
    </Suspense>
  );
}
