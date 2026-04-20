"use client";

import { TopPerformingArticles } from "@/components/dashboard/admin/mainDashboard/TopPerformingArticles";
import { topPerformingArticles } from "@/lib/dashboard/admin-dashboard-constants";

export default function ContributionsAnalyticsPage() {
  return (
    <div>
      <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
        <TopPerformingArticles items={topPerformingArticles} />
      </div>
    </div>
  );
}
