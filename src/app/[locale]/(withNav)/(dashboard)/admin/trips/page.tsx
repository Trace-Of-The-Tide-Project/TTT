"use client";

import { Suspense } from "react";
import { TripsManagementContent } from "@/components/dashboard/admin/trips/TripsManagementContent";

export default function AdminTripsPage() {
  return (
    <div className="my-4 mx-10">
      <Suspense fallback={<div className="text-sm text-gray-500">Loading…</div>}>
        <TripsManagementContent />
      </Suspense>
    </div>
  );
}
