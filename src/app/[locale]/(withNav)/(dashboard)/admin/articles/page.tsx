"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { AdminArticlesPageContent } from "@/components/dashboard/admin/articles/AdminArticlesPageContent";

export default function AdminArticlesPage() {
  const t = useTranslations("Dashboard.articles.list");
  return (
    <Suspense
      fallback={
        <div className="my-4 mx-10 rounded-lg border border-[#444444] px-5 py-12 text-center text-sm text-gray-500">
          {t("loading")}
        </div>
      }
    >
      <AdminArticlesPageContent />
    </Suspense>
  );
}
