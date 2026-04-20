"use client";

import { DashboardLayout } from "@/components/dashboard/shared/DashboardLayout";
import { userConfig } from "@/lib/dashboard/user-config";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout config={userConfig}>{children}</DashboardLayout>;
}
