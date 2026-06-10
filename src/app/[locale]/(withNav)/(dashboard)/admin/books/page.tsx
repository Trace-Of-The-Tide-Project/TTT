"use client";

import { Suspense } from "react";
import { AdminBooksPageContent } from "@/components/dashboard/admin/books";
import { SkeletonTable } from "@/components/ui/SkeletonTable";

export default function AdminBooksPage() {
  return (
    <Suspense fallback={<SkeletonTable />}>
      <div className="my-4 mx-10">
        <AdminBooksPageContent />
      </div>
    </Suspense>
  );
}
