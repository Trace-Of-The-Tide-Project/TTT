"use client";

import { Suspense } from "react";
import { MagazineArticlesContent } from "@/components/dashboard/admin/magazine/MagazineArticlesContent";
import { SkeletonTable } from "@/components/ui/SkeletonTable";

export default function AdminMagazineArticlesPage() {
  return (
    <div className="my-4 mx-10">
      <Suspense fallback={<SkeletonTable />}>
        <MagazineArticlesContent />
      </Suspense>
    </div>
  );
}
