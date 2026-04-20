"use client";

import { useTranslations } from "next-intl";
import { TrendingUpIcon } from "@/components/ui/icons";
import { ArticlesStatCards } from "./ArticlesStatCards";
import { articleStats } from "@/lib/dashboard/articles-constants";

export function ArticlesPageHeader() {
  const t = useTranslations("Dashboard.articles.page");
  return (
    <div className="pb-6">
      <div className="flex flex-col gap-2 py-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">{t("title")}</h1>
          <p className="mt-1 text-sm text-gray-500">{t("subtitle")}</p>
        </div>
        <span className="flex items-center gap-2 text-sm font-medium text-emerald-400">
          <TrendingUpIcon />
          {t("lastUpdated")}
        </span>
      </div>

      <ArticlesStatCards stats={articleStats} />
    </div>
  );
}
