import { getTranslations } from "next-intl/server";
import { DashboardHeader } from "@/components/dashboard/shared/DashboardHeader";
import { ProfileArticlesPageContent } from "@/components/dashboard/profile/articles/ProfileArticlesPageContent";

export default async function ArticlesPage() {
  const t = await getTranslations("Dashboard.analyticsExtra");
  return (
    <div>
      <DashboardHeader
        title={t("allArticlesTitle")}
        subtitle={t("allArticlesSubtitle")}
        compactPadding
      />
      <ProfileArticlesPageContent />
    </div>
  );
}
