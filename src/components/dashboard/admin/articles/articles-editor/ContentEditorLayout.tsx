"use client";

import { Link } from "@/i18n/navigation";
import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import { useRouter } from "@/i18n/navigation";
import {
  AvailableBlocks,
  type BlockType,
} from "@/components/dashboard/admin/articles/articles-editor/AvailableBlocks";
import {
  ContentBlocks,
  type ContentBlock,
} from "@/components/dashboard/admin/articles/articles-editor/ContentBlocks";
import {
  ContentSettings,
  type ArticleWorkflowStatus,
} from "@/components/dashboard/admin/articles/articles-editor/ArticleSettings";
import { ContentEditorFooter } from "@/components/dashboard/admin/articles/articles-editor/ContentEditorFooter";
import { ScheduleArticleModal } from "@/components/dashboard/admin/articles/articles-editor/modals/ScheduleArticleModal";
import { buildArticleBlocksFromEditor } from "@/components/dashboard/admin/articles/articles-editor/lib/build-api-blocks";
import { articleDetailBlocksToContentBlocks } from "@/components/dashboard/admin/articles/articles-editor/lib/api-blocks-to-content-blocks";
import {
  articleConfig,
  contentFormConfigForType,
  type ContentFormConfig,
} from "./content-form-config";
import {
  localizeContentFormConfig,
  localizeMainMediaEditorCopy,
} from "@/lib/dashboard/localize-article-editor-config";
import { invalidateAdminArticlesListCache } from "@/lib/dashboard/admin-articles-list-cache";
import {
  createArticle,
  getArticleById,
  getArticleIdFromCreateResponse,
  publishArticle,
  scheduleArticle,
  updateArticle,
  type ArticleLifecycleStatus,
  type CreateArticlePayload,
} from "@/services/articles.service";
import { isAxiosError } from "axios";
import { previewHrefForContentType } from "@/lib/content/public-article-preview-href";

const titleClass =
  "w-full border-0 bg-transparent px-0 py-2 text-lg text-foreground placeholder:text-foreground outline-none";

function editPatchFromPayload(payload: CreateArticlePayload) {
  return {
    title: payload.title || undefined,
    category: payload.category || undefined,
    collection_id: payload.collection_id?.trim() ? payload.collection_id.trim() : null,
    blocks: payload.blocks,
    tag_ids: payload.tag_ids,
  };
}

export type ContentEditorLayoutProps = {
  /** Create mode */
  config?: ContentFormConfig;
  /** Edit mode — same editor UI, loads article into the form */
  articleId?: string;
};

const ADMIN_ARTICLES_PATH = "/admin/articles";

const SUCCESS_TOAST_MS = 3200;

export function ContentEditorLayout({ config: configFromProps, articleId }: ContentEditorLayoutProps) {
  const t = useTranslations("Dashboard.articles.editor");
  const tLayout = useTranslations("Dashboard.articles.editor.layout");

  const translateErr = useCallback(
    (e: unknown): string => {
      if (isAxiosError(e)) {
        const d = e.response?.data;
        if (typeof d === "string" && d.trim()) return d;
        if (d && typeof d === "object") {
          const o = d as Record<string, unknown>;
          if (typeof o.message === "string") return o.message;
          if (Array.isArray(o.message)) return o.message.map(String).join("; ");
          if (typeof o.error === "string") return o.error;
        }
        return e.message || tLayout("errorRequestFailed");
      }
      if (e instanceof Error) return e.message;
      return tLayout("errorGeneric");
    },
    [tLayout],
  );

  const router = useRouter();
  const invalidateArticlesListAndLeave = useCallback(() => {
    invalidateAdminArticlesListCache();
    router.push(ADMIN_ARTICLES_PATH);
  }, [router]);
  const isEditMode = Boolean(articleId);
  const initialWasDraftRef = useRef(true);
  const pendingDelayedNavRef = useRef(false);
  const [mediaUploading, setMediaUploading] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [toastEntered, setToastEntered] = useState(false);

  const [config, setConfig] = useState<ContentFormConfig>(() => configFromProps ?? articleConfig);

  const localizedConfig = useMemo(
    () => localizeContentFormConfig(config, (key) => t(key)),
    [config, t],
  );

  const localizedMainMedia = useMemo(
    () => localizeMainMediaEditorCopy(config.contentType, (key) => t(key)),
    [config.contentType, t],
  );

  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<ContentBlock[]>(() => configFromProps?.defaultBlocks ?? articleConfig.defaultBlocks);
  const [workflowStatus, setWorkflowStatus] = useState<ArticleWorkflowStatus>("draft");
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("en");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [seoTitle, setSeoTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [articleLoading, setArticleLoading] = useState(isEditMode);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadKey, setLoadKey] = useState(0);
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (configFromProps && !articleId) {
      setConfig(configFromProps);
      setBlocks(configFromProps.defaultBlocks);
    }
  }, [configFromProps, articleId]);

  useEffect(() => {
    if (!articleId) return;
    let cancelled = false;
    (async () => {
      setArticleLoading(true);
      setLoadError(null);
      try {
        const a = await getArticleById(articleId);
        if (cancelled) return;
        if (!a) {
          setLoadError(tLayout("articleNotFound"));
          return;
        }
        setConfig(contentFormConfigForType(a.content_type));
        setTitle(a.title ?? "");
        setCategory(a.category ?? "");
        const st = (a.status || "draft").trim().toLowerCase();
        initialWasDraftRef.current = st === "draft";
        const isScheduled =
          st === "scheduled" ||
          st === "schedule_pending" ||
          st === "scheduled_for_publish";
        setWorkflowStatus(
          isScheduled ? "scheduled" : st === "published" ? "published" : "draft",
        );
        const sat = a.scheduled_at?.trim();
        setScheduledAt(sat && sat.length ? sat : null);
        setLanguage((a.language || "en").trim() || "en");
        setVisibility((a.visibility || "public").toLowerCase() === "private" ? "private" : "public");
        setSeoTitle(a.seo_title?.trim() ?? "");
        setMetaDescription(a.meta_description?.trim() ?? "");
        setCollectionId(a.collection_id?.trim() ?? "");
        setTagIds(
          Array.isArray(a.tags)
            ? a.tags.map((tagItem) => tagItem.id).filter((id): id is string => typeof id === "string")
            : [],
        );
        const mapped = articleDetailBlocksToContentBlocks(a.blocks);
        setBlocks(
          mapped.length
            ? mapped
            : [{ id: crypto.randomUUID(), type: "paragraph", content: "" }],
        );
      } catch (e) {
        if (!cancelled) setLoadError(translateErr(e));
      } finally {
        if (!cancelled) setArticleLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [articleId, loadKey, tLayout, translateErr]);

  useEffect(() => {
    if (!successToast) {
      setToastEntered(false);
      return;
    }
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setToastEntered(true));
    });
    return () => window.cancelAnimationFrame(id);
  }, [successToast]);

  const notifySuccessAndLeave = useCallback(
    (message: string) => {
      pendingDelayedNavRef.current = true;
      setSuccessToast(message);
      window.setTimeout(() => {
        pendingDelayedNavRef.current = false;
        setSuccessToast(null);
        invalidateArticlesListAndLeave();
      }, SUCCESS_TOAST_MS);
    },
    [invalidateArticlesListAndLeave],
  );

  const addBlock = useCallback((type: BlockType) => {
    setBlocks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type,
        ...(type === "divider" ? {} : { content: "" }),
      },
    ]);
  }, []);

  const addCoverBlock = useCallback(() => {
    setBlocks((prev) => [
      {
        id: crypto.randomUUID(),
        type: "image" as const,
      },
      ...prev,
    ]);
  }, []);

  const reorderBlocks = useCallback((activeId: string, overId: string) => {
    setBlocks((prev) => {
      const from = prev.findIndex((b) => b.id === activeId);
      const to = prev.findIndex((b) => b.id === overId);
      if (from < 0 || to < 0 || from === to) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      // Insert at original target index (same rule as splice(from,1); splice(to,0) on a copy).
      next.splice(to, 0, item);
      return next;
    });
  }, []);

  const removeBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const duplicateBlock = useCallback((id: string) => {
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.id === id);
      if (i < 0) return prev;
      const b = prev[i]!;
      const copy: ContentBlock = {
        ...b,
        id: crypto.randomUUID(),
        file: undefined,
        files: b.files ? [...b.files] : undefined,
      };
      const next = [...prev];
      next.splice(i + 1, 0, copy);
      return next;
    });
  }, []);

  const updateBlock = useCallback((id: string, patch: Partial<ContentBlock>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }, []);

  const buildPayload = useCallback(async (): Promise<CreateArticlePayload> => {
    const apiBlocks = await buildArticleBlocksFromEditor(blocks, {
      onUploading: setMediaUploading,
    });
    const cid = collectionId.trim();
    return {
      title: title.trim(),
      content_type: config.contentType,
      category: category.trim(),
      language: language.trim() || undefined,
      visibility,
      seo_title: seoTitle.trim() || undefined,
      meta_description: metaDescription.trim() || undefined,
      collection_id: cid || undefined,
      tag_ids: tagIds.length ? tagIds : undefined,
      blocks: apiBlocks,
    };
  }, [
    blocks,
    title,
    config.contentType,
    category,
    language,
    visibility,
    seoTitle,
    metaDescription,
    collectionId,
    tagIds,
  ]);

  const handleSaveDraft = useCallback(async () => {
    if (!title.trim()) {
      setError(tLayout("validationTitle"));
      return;
    }
    if (!category.trim()) {
      setError(tLayout("validationCategory"));
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const payload = await buildPayload();
      if (payload.blocks.length === 0) {
        setError(tLayout("validationBlocksDraft"));
        return;
      }
      if (isEditMode && articleId) {
        const status: ArticleLifecycleStatus =
          workflowStatus === "draft"
            ? "draft"
            : workflowStatus === "published"
              ? "published"
              : "scheduled";
        await updateArticle(articleId, { ...editPatchFromPayload(payload), status });
        notifySuccessAndLeave(tLayout("successChangesSaved"));
        return;
      }
      await createArticle(payload);
      notifySuccessAndLeave(tLayout("successDraftSaved"));
    } catch (e) {
      setError(translateErr(e));
    } finally {
      if (!pendingDelayedNavRef.current) setBusy(false);
    }
  }, [
    title,
    category,
    buildPayload,
    notifySuccessAndLeave,
    isEditMode,
    articleId,
    workflowStatus,
    tLayout,
    translateErr,
  ]);

  const handlePublish = useCallback(async () => {
    if (workflowStatus !== "published" && workflowStatus !== "scheduled") return;
    if (!title.trim()) {
      setError(tLayout("validationTitle"));
      return;
    }
    if (!category.trim()) {
      setError(tLayout("validationCategory"));
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const payload = await buildPayload();
      if (payload.blocks.length === 0) {
        setError(tLayout("validationBlocksPublish"));
        return;
      }
      if (isEditMode && articleId) {
        await updateArticle(articleId, editPatchFromPayload(payload));
        if (initialWasDraftRef.current || workflowStatus === "scheduled") {
          await publishArticle(articleId);
          initialWasDraftRef.current = false;
        }
        notifySuccessAndLeave(tLayout("successArticleSubmitted"));
        return;
      }
      const res = await createArticle(payload);
      const id = getArticleIdFromCreateResponse(res);
      if (!id) {
        setError(tLayout("errorCreateNoIdPublish"));
        return;
      }
      await publishArticle(id);
      notifySuccessAndLeave(tLayout("successArticleSubmitted"));
    } catch (e) {
      setError(translateErr(e));
    } finally {
      if (!pendingDelayedNavRef.current) setBusy(false);
    }
  }, [
    workflowStatus,
    title,
    category,
    buildPayload,
    notifySuccessAndLeave,
    isEditMode,
    articleId,
    tLayout,
    translateErr,
  ]);

  const handleScheduleConfirm = useCallback(
    async (iso: string) => {
      if (workflowStatus !== "published" && workflowStatus !== "scheduled") return;
      if (!title.trim()) {
        setError(tLayout("validationTitle"));
        setScheduleModalOpen(false);
        return;
      }
      if (!category.trim()) {
        setError(tLayout("validationCategory"));
        setScheduleModalOpen(false);
        return;
      }
      setError(null);
      setBusy(true);
      try {
        const payload = await buildPayload();
        if (payload.blocks.length === 0) {
          setError(tLayout("validationBlocksSchedule"));
          setScheduleModalOpen(false);
          return;
        }
        if (isEditMode && articleId) {
          await updateArticle(articleId, {
            ...editPatchFromPayload(payload),
            status: "scheduled",
          });
          await scheduleArticle(articleId, iso);
          setScheduleModalOpen(false);
          notifySuccessAndLeave(tLayout("successArticleScheduled"));
          return;
        }
        const res = await createArticle(payload);
        const id = getArticleIdFromCreateResponse(res);
        if (!id) {
          setError(tLayout("errorCreateNoIdSchedule"));
          setScheduleModalOpen(false);
          return;
        }
        await scheduleArticle(id, iso);
        setScheduleModalOpen(false);
        notifySuccessAndLeave(tLayout("successArticleScheduled"));
      } catch (e) {
        setError(translateErr(e));
        setScheduleModalOpen(false);
      } finally {
        if (!pendingDelayedNavRef.current) setBusy(false);
      }
    },
    [
      workflowStatus,
      title,
      category,
      buildPayload,
      notifySuccessAndLeave,
      isEditMode,
      articleId,
      tLayout,
      translateErr,
    ],
  );

  if (isEditMode && articleLoading) {
    return (
      <div className="flex min-h-0 flex-col p-8 text-sm text-gray-500" role="status">
        {tLayout("loadingArticle")}
      </div>
    );
  }

  if (isEditMode && loadError) {
    return (
      <div className="flex min-h-0 flex-col gap-4 p-8 text-foreground">
        <Link href={ADMIN_ARTICLES_PATH} className="text-sm text-[#C9A96E] hover:underline">
          {tLayout("backToArticles")}
        </Link>
        <p className="text-sm text-red-300">{loadError}</p>
        <button
          type="button"
          onClick={() => setLoadKey((k: number) => k + 1)}
          className="w-fit text-sm text-gray-400 underline hover:text-foreground"
        >
          {tLayout("tryAgain")}
        </button>
      </div>
    );
  }

  if (!isEditMode && !configFromProps) {
    return (
      <div className="p-8 text-sm text-red-300">
        {tLayout("misconfigured")}
      </div>
    );
  }

  const uploadOverlay =
    portalReady && typeof document !== "undefined" && mediaUploading
      ? createPortal(
          <div
            className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
            role="alertdialog"
            aria-modal="true"
            aria-busy="true"
            aria-labelledby="article-editor-uploading-title"
          >
            <div className="max-w-sm rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-8 py-10 text-center shadow-xl">
              <div
                className="mx-auto mb-5 h-12 w-12 rounded-full border-2 border-[#C9A96E]/25 border-t-[#C9A96E] animate-spin"
                aria-hidden
              />
              <p id="article-editor-uploading-title" className="text-lg font-semibold text-foreground">
                {tLayout("uploadingTitle")}
              </p>
              <p className="mt-2 text-sm text-gray-400">{tLayout("uploadingDetail")}</p>
            </div>
          </div>,
          document.body,
        )
      : null;

  const successToastPortal =
    portalReady && typeof document !== "undefined" && successToast
      ? createPortal(
          <div
            className={`pointer-events-none fixed right-4 top-20 z-[301] max-w-sm sm:right-6 sm:top-24 ${
              toastEntered ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
            } transition-all duration-300 ease-out`}
            role="status"
            aria-live="polite"
          >
            <div className="pointer-events-auto rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-4 py-3 shadow-lg">
              <p className="text-sm font-semibold text-foreground">{successToast}</p>
              <p className="mt-0.5 text-xs text-gray-400">{tLayout("successRedirect")}</p>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="flex min-h-0 flex-col">
      {uploadOverlay}
      {successToastPortal}
      <ScheduleArticleModal
        open={scheduleModalOpen}
        busy={busy}
        onClose={() => !busy && setScheduleModalOpen(false)}
        onConfirm={handleScheduleConfirm}
      />

      <div className="flex flex-1 gap-6 overflow-hidden">
        <div className="min-w-0 flex-1 space-y-6 overflow-y-auto">
          {isEditMode && articleId ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--tott-card-border)] pb-4">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <Link href={ADMIN_ARTICLES_PATH} className="text-[#C9A96E] hover:underline">
                  {tLayout("backToArticles")}
                </Link>
                <span className="text-gray-500">{tLayout("editArticle")}</span>
              </div>
              <Link
                href={previewHrefForContentType(config.contentType, articleId)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-[#C9A96E]/50 hover:bg-[#252525]"
              >
                {tLayout("preview")}
              </Link>
            </div>
          ) : null}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={localizedConfig.titlePlaceholder}
            className={titleClass}
          />
          <ContentBlocks
            blocks={blocks}
            onRemoveBlock={removeBlock}
            onDuplicateBlock={duplicateBlock}
            onUpdateBlock={updateBlock}
            onAddCoverBlock={addCoverBlock}
            onReorderBlock={reorderBlocks}
            config={localizedConfig}
            mainMediaCopy={localizedMainMedia}
          />
        </div>

        <aside className="flex w-64 shrink-0 flex-col gap-4 overflow-y-auto">
          <AvailableBlocks
            onAddBlock={addBlock}
            imageBlockLabel={
              config.contentType === "video" || config.contentType === "audio"
                ? tLayout("imageBlockShort")
                : localizedMainMedia.blockName
            }
          />
          <ContentSettings
            title={localizedConfig.settingsTitle}
            workflowStatus={workflowStatus}
            onWorkflowStatusChange={setWorkflowStatus}
            scheduledAt={scheduledAt}
            category={category}
            onCategoryChange={setCategory}
            language={language}
            onLanguageChange={setLanguage}
            visibility={visibility}
            onVisibilityChange={setVisibility}
            seoTitle={seoTitle}
            onSeoTitleChange={setSeoTitle}
            metaDescription={metaDescription}
            onMetaDescriptionChange={setMetaDescription}
            collectionId={collectionId}
            onCollectionIdChange={setCollectionId}
            tagIds={tagIds}
            onTagIdsChange={setTagIds}
          />
        </aside>
      </div>

      <ContentEditorFooter
        primaryButtonLabel={localizedConfig.primaryButtonLabel}
        saveDraftLabel={isEditMode ? t("footer.defaults.saveChanges") : undefined}
        workflowStatus={workflowStatus}
        busy={busy}
        error={error}
        onPublish={handlePublish}
        onSaveDraft={handleSaveDraft}
        onOpenSchedule={() => setScheduleModalOpen(true)}
      />
    </div>
  );
}
