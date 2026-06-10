import { Suspense } from "react";
import { SystemSettingsContent } from "@/components/dashboard/admin/system-settings/SystemSettingsContent";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

export default function SystemSettingsPage() {
  return (
    <Suspense fallback={<SkeletonCard />}>
      <SystemSettingsContent />
    </Suspense>
  );
}
