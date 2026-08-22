"use client";

import { Suspense, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/shared/DashboardHeader";
import { CreatePageFilters } from "@/components/dashboard/admin/articles/articles-create/CreatePageFilters";
import { TemplateCard } from "@/components/dashboard/admin/articles/articles-create/TemplateCard";
import {
  createTemplateFilterIds,
  magazineCreateTemplates,
} from "@/components/dashboard/admin/articles/data/create-template-data";

/** Type picker for magazine articles — mirrors /admin/articles/create but
 * scoped to magazine-compatible templates, and forwards issue_id/magazine_id/
 * return query params (set when authoring from inside an issue) onto the
 * chosen type's create route. useSearchParams needs a Suspense boundary. */
function MagazineCreateArticlePickerInner() {
  const t = useTranslations("Dashboard.articles");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const searchParams = useSearchParams();
  const forwardedQuery = searchParams.toString();

  const filterOptions = useMemo(
    () =>
      createTemplateFilterIds.map((id) => ({
        id,
        label: t(`create.filters.${id}`),
      })),
    [t],
  );

  const filteredTemplates = useMemo(() => {
    if (selectedFilter === "all") return magazineCreateTemplates;
    return magazineCreateTemplates.filter((template) => template.category === selectedFilter);
  }, [selectedFilter]);

  return (
    <div>
      <DashboardHeader
        compactPadding
        title={t("create.pageTitle")}
        subtitle={t("create.pageSubtitle")}
        actions={
          <CreatePageFilters
            options={filterOptions}
            selectedId={selectedFilter}
            onSelect={setSelectedFilter}
            variant="outlined"
          />
        }
      />

      <div className="px-6 pb-6 sm:px-8">
        <div className="grid grid-cols-2 gap-4">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.number}
              number={template.number}
              title={t(`create.templates.${template.templateKey}.title`)}
              description={t(`create.templates.${template.templateKey}.description`)}
              icon={template.icon}
              href={forwardedQuery ? `${template.href}?${forwardedQuery}` : template.href}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminMagazineArticleCreatePage() {
  return (
    <Suspense fallback={null}>
      <MagazineCreateArticlePickerInner />
    </Suspense>
  );
}
