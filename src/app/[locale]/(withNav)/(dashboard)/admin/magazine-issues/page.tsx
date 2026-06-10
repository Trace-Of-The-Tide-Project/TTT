"use client";

import { Suspense } from "react";
import { MagazineIssuesManagementContent } from "@/components/dashboard/admin/magazine/MagazineIssuesManagementContent";
import { SkeletonTable } from "@/components/ui/SkeletonTable";

export default function AdminMagazineIssuesPage() {
  return (
    <div className="my-4 mx-10">
      <Suspense fallback={<SkeletonTable />}>
        <MagazineIssuesManagementContent />
      </Suspense>
    </div>
  );
}
