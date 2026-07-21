"use client";

import { Suspense } from "react";
import { MyTasksContent } from "@/components/dashboard/profile/tasks/MyTasksContent";
import { SkeletonTable } from "@/components/ui/SkeletonTable";

export default function MyTasksPage() {
  return (
    <div className="my-4 mx-10">
      <Suspense fallback={<SkeletonTable />}>
        <MyTasksContent />
      </Suspense>
    </div>
  );
}
