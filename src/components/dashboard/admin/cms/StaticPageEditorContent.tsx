"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { RefreshCwIcon } from "@/components/ui/icons";
import { EditorRegistryProvider, EditorToolbar, RichTextEditor } from "@/components/ui/rich-text";
import { useCmsPage } from "@/hooks/queries/cms";
import { usePublishCmsPage, useUpdateCmsPage } from "@/hooks/mutations/cms";
import { dirFor } from "@/i18n/dir";

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2.5 text-sm text-foreground placeholder:text-[var(--tott-muted)] focus:border-[var(--tott-card-border)] focus:outline-none";

type Working = { title: string; content: string; seo_title: string; meta_description: string };

function seedFrom(page: { title: string; content?: string | null; seo_title?: string | null; meta_description?: string | null }): Working {
  return {
    title: page.title ?? "",
    content: page.content ?? "",
    seo_title: page.seo_title ?? "",
    meta_description: page.meta_description ?? "",
  };
}

export function StaticPageEditorContent({ pageId }: { pageId: string }) {
  const t = useTranslations("Dashboard.cmsPageEditor");
  const router = useRouter();
  const { data: page, isPending } = useCmsPage(pageId);
  const updatePage = useUpdateCmsPage();
  const publishPage = usePublishCmsPage();

  const [working, setWorking] = useState<Working | null>(null);
  const [seededId, setSeededId] = useState<string | null>(null);

  if (page && page.id !== seededId) {
    setSeededId(page.id);
    setWorking(seedFrom(page));
  }

  if (isPending || !page || !working) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-[var(--tott-muted)]">
        {t("loading")}
      </div>
    );
  }

  const dir = dirFor(page.language);
  const saving = updatePage.isPending;

  const handleSave = () => {
    updatePage.mutate({
      id: page.id,
      data: {
        title: working.title,
        content: working.content,
        seo_title: working.seo_title,
        meta_description: working.meta_description,
      },
    });
  };
  const handleReset = () => setWorking(seedFrom(page));
  const handlePreview = () => window.open(`/${page.language ?? "en"}/${page.slug}`, "_blank", "noopener,noreferrer");

  return (
    <div className="rounded-xl border border-[var(--tott-card-border)] p-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs font-medium text-[var(--tott-muted)] hover:text-foreground"
        >
          {t("back")}
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePreview}
            className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-3 py-1.5 text-xs font-medium text-foreground hover:bg-[var(--tott-dash-surface-inset)]"
          >
            {t("preview")}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-3 py-1.5 text-xs font-medium text-foreground hover:bg-[var(--tott-dash-surface-inset)]"
          >
            <span className="[&_svg]:h-3.5 [&_svg]:w-3.5">
              <RefreshCwIcon />
            </span>
            {t("reset")}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg border border-[var(--tott-accent-gold)]/40 bg-[var(--tott-accent-gold)]/20 px-3 py-1.5 text-xs font-medium text-[var(--tott-dash-gold-text)] hover:bg-[var(--tott-accent-gold)]/30 disabled:opacity-50"
          >
            {saving ? t("saving") : t("save")}
          </button>
          <button
            type="button"
            onClick={() => publishPage.mutate(page.id)}
            disabled={publishPage.isPending || page.status === "published"}
            className="rounded-lg border border-[var(--tott-accent-gold)]/40 bg-[var(--tott-accent-gold)]/20 px-3 py-1.5 text-xs font-medium text-[var(--tott-dash-gold-text)] hover:bg-[var(--tott-accent-gold)]/30 disabled:opacity-50"
          >
            {publishPage.isPending
              ? t("publishing")
              : page.status === "published"
                ? t("published")
                : t("publish")}
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-foreground">{t("fields.title")}</label>
          <input
            type="text"
            dir={dir}
            value={working.title}
            onChange={(e) => setWorking((w) => (w ? { ...w, title: e.target.value } : w))}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-foreground">{t("fields.content")}</label>
          <EditorRegistryProvider>
            <div className="mb-2 rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)]">
              <EditorToolbar />
            </div>
            <div className="overflow-hidden rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)]">
              <RichTextEditor
                value={working.content}
                onChange={(html) => setWorking((w) => (w ? { ...w, content: html } : w))}
                dir={dir}
              />
            </div>
          </EditorRegistryProvider>
        </div>

        <div className="border-t border-[var(--tott-card-border)] pt-4">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--tott-muted)]">{t("seo")}</p>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">{t("fields.seoTitle")}</label>
              <input
                type="text"
                dir={dir}
                value={working.seo_title}
                onChange={(e) => setWorking((w) => (w ? { ...w, seo_title: e.target.value } : w))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">{t("fields.metaDescription")}</label>
              <textarea
                rows={3}
                dir={dir}
                value={working.meta_description}
                onChange={(e) => setWorking((w) => (w ? { ...w, meta_description: e.target.value } : w))}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
