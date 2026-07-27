import { getTranslations } from "next-intl/server";
import { DashboardHeader } from "@/components/dashboard/shared/DashboardHeader";
import { SavedArticlesPageContent } from "@/components/dashboard/profile/saved/SavedArticlesPageContent";

export default async function SavedArticlesPage() {
  const t = await getTranslations("Dashboard.savedArticles");
  return (
    <div>
      <DashboardHeader title={t("title")} subtitle={t("subtitle")} compactPadding />
      <SavedArticlesPageContent />
    </div>
  );
}
