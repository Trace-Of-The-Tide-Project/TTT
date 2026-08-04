"use client";

import { DashboardLayout } from "@/components/dashboard/shared/DashboardLayout";
import { MessagesContent } from "@/components/messages/MessagesContent";
import { userConfig } from "@/lib/dashboard/user-config";

export default function MessagesPage() {
  return (
    <DashboardLayout config={userConfig}>
      <MessagesContent />
    </DashboardLayout>
  );
}
