"use client";

import { Suspense } from "react";
import { PeopleManagementContent } from "@/components/dashboard/admin/people";
import { SkeletonTable } from "@/components/ui/SkeletonTable";

export default function AdminPeoplePage() {
  return (
    <div className="my-4 mx-10">
      <Suspense fallback={<SkeletonTable />}>
        <PeopleManagementContent />
      </Suspense>
    </div>
  );
}
