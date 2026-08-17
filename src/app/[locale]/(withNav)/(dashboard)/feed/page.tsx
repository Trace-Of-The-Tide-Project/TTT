"use client";

import { useTranslations } from "next-intl";
import { DashboardLayout } from "@/components/dashboard/shared/DashboardLayout";
import { DashboardHeader } from "@/components/dashboard/shared/DashboardHeader";
import { FeedStream } from "@/components/feed/FeedStream";
import { userConfig } from "@/lib/dashboard/user-config";

export default function FollowingFeedPage() {
  const t = useTranslations("Feed");

  return (
    <DashboardLayout config={userConfig}>
      <DashboardHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="mx-auto mt-2 w-full max-w-[640px]">
        <FeedStream />
      </div>
    </DashboardLayout>
  );
}
