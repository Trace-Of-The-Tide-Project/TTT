"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { DashboardHeader } from "@/components/dashboard/shared/DashboardHeader";
import { CreatePageFilters } from "@/components/dashboard/admin/articles/articles-create/CreatePageFilters";
import { TemplateCard } from "@/components/dashboard/admin/articles/articles-create/TemplateCard";
import {
  createTemplateFilterIds,
  createTemplates,
} from "@/components/dashboard/admin/articles/data/create-template-data";

export default function CreateArticlePage() {
  const t = useTranslations("Dashboard.articles");
  const [selectedFilter, setSelectedFilter] = useState("all");

  const filterOptions = useMemo(
    () =>
      createTemplateFilterIds.map((id) => ({
        id,
        label: t(`create.filters.${id}`),
      })),
    [t],
  );

  const filteredTemplates = useMemo(() => {
    if (selectedFilter === "all") return createTemplates;
    return createTemplates.filter((template) => template.category === selectedFilter);
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
          />
        }
      />
      <div className="px-6 py-8 sm:px-8">
        <div className="grid grid-cols-2 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard
              key={template.number}
              number={template.number}
              title={t(`create.templates.${template.templateKey}.title`)}
              description={t(`create.templates.${template.templateKey}.description`)}
              icon={template.icon}
              href={template.href}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
