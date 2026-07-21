"use client";

import { Suspense } from "react";
import { TasksManagementContent } from "@/components/dashboard/admin/tasks";
import { SkeletonTable } from "@/components/ui/SkeletonTable";

export default function AdminTasksPage() {
  return (
    <div className="my-4 mx-10">
      <Suspense fallback={<SkeletonTable />}>
        <TasksManagementContent />
      </Suspense>
    </div>
  );
}
