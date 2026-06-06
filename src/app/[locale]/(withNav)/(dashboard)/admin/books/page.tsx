"use client";

import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { AdminBooksPageContent } from "@/components/dashboard/admin/books";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";

export default function AdminBooksPage() {
  const t = useTranslations("Dashboard.books.list");
  return (
    <Suspense
      fallback={
        <div className="relative my-4 mx-10 px-5 py-12 text-center text-sm text-gray-500">
          <ChamferedFrame />
          {t("loading")}
        </div>
      }
    >
      <div className="my-4 mx-10">
        <AdminBooksPageContent />
      </div>
    </Suspense>
  );
}
