"use client";

import { Suspense } from "react";
import { AdminArticlesPageContent } from "@/components/dashboard/admin/articles/AdminArticlesPageContent";
import { SkeletonTable } from "@/components/ui/SkeletonTable";

export default function AdminArticlesPage() {
  return (
    <Suspense fallback={<SkeletonTable />}>
      <AdminArticlesPageContent />
    </Suspense>
  );
}
