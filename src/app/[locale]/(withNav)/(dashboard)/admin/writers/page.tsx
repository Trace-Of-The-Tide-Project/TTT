"use client";

import { Suspense } from "react";
import { WritersManagementContent } from "@/components/dashboard/admin/writers";
import { SkeletonTable } from "@/components/ui/SkeletonTable";

export default function AdminWritersPage() {
  return (
    <div className="my-4 mx-10">
      <Suspense fallback={<SkeletonTable />}>
        <WritersManagementContent />
      </Suspense>
    </div>
  );
}
