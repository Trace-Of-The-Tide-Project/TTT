"use client";

import { useTranslations } from "next-intl";
import { DashboardHeader } from "./DashboardHeader";

/** Keys under `Dashboard.placeholders.pages` in `shell.json`. */
export type PlaceholderPageKey =
  | "profileSettings"
  | "password"
  | "account"
  | "notifications"
  | "privacy"
  | "availabilityProfile"
  | "availabilityAdmin"
  | "profileArticles"
  | "createArticle"
  | "profileAnalytics";

type PlaceholderPageProps = {
  pageKey: PlaceholderPageKey;
};

export function PlaceholderPage({ pageKey }: PlaceholderPageProps) {
  const t = useTranslations("Dashboard.placeholders");
  const title = t(`pages.${pageKey}.title`);
  const subtitle = t(`pages.${pageKey}.subtitle`);

  return (
    <div>
      <DashboardHeader title={title} subtitle={subtitle} />
      <div className="flex items-center justify-center p-16">
        <div className="text-center">
          <div className="mb-4 text-5xl text-gray-700">🏗</div>
          <p className="text-lg font-medium text-gray-500">{t("comingSoon")}</p>
          <p className="mt-1 text-sm text-gray-600">{t("pageSoon", { title })}</p>
        </div>
      </div>
    </div>
  );
}
