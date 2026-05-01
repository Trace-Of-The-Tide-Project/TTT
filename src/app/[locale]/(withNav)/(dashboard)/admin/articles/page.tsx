"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { AdminArticlesPageContent } from "@/components/dashboard/admin/articles/AdminArticlesPageContent";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";

export default function AdminArticlesPage() {
  const t = useTranslations("Dashboard.articles.list");
  return (
    <Suspense
      fallback={
        <div className="relative my-4 mx-10 px-5 py-12 text-center text-sm text-gray-500">
          <ChamferedFrame />
          {t("loading")}
        </div>
      }
    >
      <AdminArticlesPageContent />
    </Suspense>
  );
}
