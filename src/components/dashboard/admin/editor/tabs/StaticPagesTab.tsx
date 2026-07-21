"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { EyeIcon, FileTextIcon, PenLineIcon } from "@/components/ui/icons";
import { HexIconOutlined } from "@/components/dashboard/admin/articles/articles-create/HexIconOutlined";
import { useCmsPages } from "@/hooks/queries/cms";
import { useRouter } from "@/i18n/navigation";
import type { CmsPage } from "@/services/cms.service";
import { CmsPreviewFrame } from "@/components/dashboard/admin/editor/preview/CmsPreviewFrame";
import { useVisualEditorTab } from "@/components/dashboard/admin/editor/VisualEditorTabContext";

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
}

export function StaticPagesTab() {
  const t = useTranslations("Dashboard.cmsStatic");
  const locale = useLocale();
  const router = useRouter();
  const { data: allPages, isPending: loading } = useCmsPages();
  const pages = (allPages ?? []).filter((p) => p.page_type !== "homepage");
  const [selected, setSelected] = useState<CmsPage | null>(null);
  const { registerDraftState } = useVisualEditorTab();

  // This tab has no inline draft to flush (edits happen on the dedicated
  // /admin/cms/[id] route) — register the selected page's id so the
  // header's Publish button can act on it, with a no-op save/isDirty.
  useEffect(() => {
    if (!selected) {
      registerDraftState(null);
      return () => registerDraftState(null);
    }
    registerDraftState({ isDirty: false, pageId: selected.id, save: async () => {} });
    return () => registerDraftState(null);
  }, [selected, registerDraftState]);

  const handlePreview = (page: CmsPage) => {
    window.open(`/${page.language ?? locale}/${page.slug}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-[var(--tott-card-border)] p-6">
        {loading && pages.length === 0 ? (
          <p className="py-12 text-center text-sm text-[var(--tott-muted)]">{t("loading")}</p>
        ) : (
          <div className="space-y-4">
            {pages.map((page) => (
              <div
                key={page.id}
                onClick={() => setSelected(page)}
                className={`flex w-full cursor-pointer items-center justify-between gap-4 rounded-lg border px-4 py-4 transition-colors ${
                  selected?.id === page.id ? "border-[var(--tott-accent-gold)]" : "border-[var(--tott-card-border)]"
                }`}
              >
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <HexIconOutlined size="sm">
                    <FileTextIcon />
                  </HexIconOutlined>
                  <div>
                    <p className="font-medium text-foreground">{page.title}</p>
                    <p className="text-xs text-[var(--tott-muted)]">{t("lastEdited", { date: formatDate(page.updatedAt, locale) })}</p>
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
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/admin/cms/${page.id}`);
                    }}
                    className="flex items-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)]"
                  >
                    <span className="[&_svg]:h-4 [&_svg]:w-4">
                      <PenLineIcon />
                    </span>
                    {t("edit")}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePreview(page);
                    }}
                    className="flex items-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)]"
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

      {/* Live preview — selecting a row (including a draft page, which the
          public route otherwise 404s) shows it here via the auth-gated
          ?cmsPreview=1 route. */}
      <div className="min-w-0">
        {selected ? (
          <CmsPreviewFrame
            src={`/${selected.language ?? locale}/${selected.slug}?cmsPreview=1`}
            locale={selected.language ?? locale}
            urlLabel={`/${selected.language ?? locale}/${selected.slug}`}
            draft={null}
          />
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-[var(--tott-card-border)] p-6 text-sm text-[var(--tott-muted)]">
            {t("emptyState")}
          </div>
        )}
      </div>
    </div>
  );
}
