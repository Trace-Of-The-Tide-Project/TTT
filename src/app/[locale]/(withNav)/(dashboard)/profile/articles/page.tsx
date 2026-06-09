import { DashboardHeader } from "@/components/dashboard/shared/DashboardHeader";
import { ProfileArticlesPageContent } from "@/components/dashboard/profile/articles/ProfileArticlesPageContent";

export default function ArticlesPage() {
  return (
    <div>
      <DashboardHeader
        title="All Articles"
        subtitle="View and manage your published articles."
        compactPadding
      />
      <ProfileArticlesPageContent />
    </div>
  );
}
