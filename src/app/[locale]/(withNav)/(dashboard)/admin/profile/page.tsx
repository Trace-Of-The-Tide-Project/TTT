import { Suspense } from "react";
import { AdminProfileInformation } from "@/components/dashboard/admin/profile/AdminProfileInformation";
import { SkeletonCard } from "@/components/ui/SkeletonCard";

export default function ProfilePage() {
  return (
    <Suspense fallback={<SkeletonCard />}>
      <AdminProfileInformation />
    </Suspense>
  );
}
