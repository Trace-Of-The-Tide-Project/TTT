"use client";

import { useLocale, useTranslations } from "next-intl";

import { EyeIcon, FileTextIcon, PenLineIcon } from "@/components/ui/icons";
import { HexIconOutlined } from "@/components/dashboard/admin/articles/articles-create/HexIconOutlined";
import { useCmsPages } from "@/hooks/queries/cms";
import { useRouter } from "@/i18n/navigation";
import { isReservedPublicSlug } from "@/lib/cms/reserved-slugs";
import type { CmsPage } from "@/services/cms.service";

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function StaticPagesTab() {
  const t = useTranslations("Dashboard.cmsStatic");
  const locale = useLocale();
  const router = useRouter();
  const { data: allPages, isPending: loading } = useCmsPages();
  // Hide the homepage and any page whose slug is served by a hardcoded route:
  // those never render their CMS `content`, so listing them as editable would
  // silently discard the author's edits (see reserved-slugs.ts).
  const pages = (allPages ?? []).filter(
    (p) => p.page_type !== "homepage" && !isReservedPublicSlug(p.slug)
  );

  const handlePreview = (page: CmsPage) => {
    window.open(`/${page.language ?? locale}/${page.slug}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="rounded-xl border border-[var(--tott-card-border)] p-6">
      {loading && pages.length === 0 ? (
        <p className="py-12 text-center text-sm text-[var(--tott-muted)]">{t("loading")}</p>
      ) : (
        <div className="space-y-4">
          {pages.map((page) => (
            <div
              key={page.id}
              className="flex w-full items-center justify-between gap-4 rounded-lg border border-[var(--tott-card-border)] px-4 py-4"
            >
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <HexIconOutlined size="sm">
                  <FileTextIcon />
                </HexIconOutlined>
                <div>
                  <p className="font-medium text-foreground">{page.title}</p>
                  <p className="text-xs text-[var(--tott-muted)]">
                    {t("lastEdited", { date: formatDate(page.updatedAt, locale) })}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`text-sm font-medium ${
                    page.status === "published" ? "text-emerald-500" : "text-yellow-500"
                  }`}
                >
                  {page.status === "published" ? t("published") : t("draft")}
                </span>
                <button
                  type="button"
                  onClick={() => router.push(`/admin/cms/${page.id}`)}
                  className="flex items-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)]"
                >
                  <span className="[&_svg]:h-4 [&_svg]:w-4">
                    <PenLineIcon />
                  </span>
                  {t("edit")}
                </button>
                <button
                  type="button"
                  onClick={() => handlePreview(page)}
                  disabled={page.status !== "published"}
                  title={page.status !== "published" ? t("previewDraftHint") : undefined}
                  className="flex items-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[var(--tott-dash-control-bg)]"
                >
                  <span className="[&_svg]:h-4 [&_svg]:w-4">
                    <EyeIcon />
                  </span>
                  {t("preview")}
                </button>
              </div>
            </div>
          ))}
          {!loading && pages.length === 0 && (
            <p className="py-12 text-center text-sm text-[var(--tott-muted)]">{t("emptyState")}</p>
          )}
        </div>
      )}
    </div>
  );
}
