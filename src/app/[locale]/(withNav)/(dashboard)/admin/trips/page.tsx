"use client";

import { Suspense } from "react";
import { TripsManagementContent } from "@/components/dashboard/admin/trips/TripsManagementContent";
import { SkeletonTable } from "@/components/ui/SkeletonTable";

export default function AdminTripsPage() {
  return (
    <div className="my-4 mx-10">
      <Suspense fallback={<SkeletonTable />}>
        <TripsManagementContent />
      </Suspense>
    </div>
  );
}
