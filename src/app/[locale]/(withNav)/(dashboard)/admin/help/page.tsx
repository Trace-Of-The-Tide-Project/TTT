import { Suspense } from "react";
import { HelpCenterContent } from "@/components/dashboard/admin/help/HelpCenterContent";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

export default function AdminHelpPage() {
  return (
    <Suspense fallback={<SkeletonCard />}>
      <HelpCenterContent />
    </Suspense>
  );
}
