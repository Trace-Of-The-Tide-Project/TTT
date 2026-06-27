"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { isAxiosError } from "axios";
import { type BlockType } from "@/components/dashboard/admin/articles/articles-editor/AvailableBlocks";
import { type ContentBlock } from "@/components/dashboard/admin/articles/articles-editor/ContentBlocks";
import { type ContentFormConfig, articleConfig, contentFormConfigForType } from "../content-form-config";
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
} from "@/services/articles.service";
import { useArticle } from "@/hooks/queries/articles";
import { uploadArticleAssetPath } from "@/services/uploads.service";
import { buildArticleBlocksFromEditor } from "../lib/build-api-blocks";
import { articleDetailBlocksToContentBlocks } from "../lib/api-blocks-to-content-blocks";
import { editPatchFromPayload } from "../lib/edit-patch";
import type { ArticleWorkflowStatus } from "../ArticleSettings";

export type ContentEditorLayoutProps = {
  config?: ContentFormConfig;
  articleId?: string;
  initialTranslationOf?: string;
  initialLanguage?: string;
  returnTo?: string;
};

const ADMIN_ARTICLES_PATH = "/admin/articles";
const SUCCESS_TOAST_MS = 3200;

export function useArticleEditor({
  config: configFromProps,
  articleId,
  initialTranslationOf,
  initialLanguage,
  returnTo,
}: ContentEditorLayoutProps) {
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
  const invalidateArticlesListAndLeave = useCallback(
    (destination: string = ADMIN_ARTICLES_PATH) => {
      invalidateAdminArticlesListCache();
      router.push(destination);
    },
    [router],
  );

  const isEditMode = Boolean(articleId);
  const initialWasDraftRef = useRef(true);
  const pendingDelayedNavRef = useRef(false);

  const [mediaUploading, setMediaUploading] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [toastEntered, setToastEntered] = useState(false);
  const [config, setConfig] = useState<ContentFormConfig>(() => configFromProps ?? articleConfig);
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<ContentBlock[]>(() => configFromProps?.defaultBlocks ?? articleConfig.defaultBlocks);
  const [workflowStatus, setWorkflowStatus] = useState<ArticleWorkflowStatus>("draft");
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState(initialLanguage || "en");
  const [translationOf, setTranslationOf] = useState<string | undefined>(initialTranslationOf);
  const [originalTitle, setOriginalTitle] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [isPremium, setIsPremium] = useState(false);
  const [seoTitle, setSeoTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadKey, setLoadKey] = useState(0);
  const [portalReady, setPortalReady] = useState(false);

  const localizedConfig = useMemo(
    () => localizeContentFormConfig(config, (key) => t(key)),
    [config, t],
  );
  const localizedMainMedia = useMemo(
    () => localizeMainMediaEditorCopy(config.contentType, (key) => t(key)),
    [config.contentType, t],
  );

  useEffect(() => { setPortalReady(true); }, []);

  useEffect(() => {
    if (configFromProps && !articleId) {
      setConfig(configFromProps);
      setBlocks(configFromProps.defaultBlocks);
    }
  }, [configFromProps, articleId]);

  const articleQuery = useArticle(articleId);
  const articleLoading = isEditMode && articleQuery.isPending;
  const articleNotFound = articleQuery.isSuccess && articleQuery.data === null;
  const loadError = articleNotFound
    ? tLayout("articleNotFound")
    : articleQuery.error
      ? translateErr(articleQuery.error)
      : null;

  useEffect(() => {
    const a = articleQuery.data;
    if (!a) return;
    setConfig(contentFormConfigForType(a.content_type));
    setTitle(a.title ?? "");
    setCategory(a.category ?? "");
    const st = (a.status || "draft").trim().toLowerCase();
    initialWasDraftRef.current = st === "draft";
    const isScheduled =
      st === "scheduled" || st === "schedule_pending" || st === "scheduled_for_publish";
    setWorkflowStatus(
      isScheduled ? "scheduled" : st === "published" ? "published" : "draft",
    );
    const sat = a.scheduled_at?.trim();
    setScheduledAt(sat && sat.length ? sat : null);
    setLanguage((a.language || "en").trim() || "en");
    setTranslationOf(a.translation_of?.trim() || undefined);
    setVisibility((a.visibility || "public").toLowerCase() === "private" ? "private" : "public");
    setIsPremium(a.is_premium ?? false);
    setSeoTitle(a.seo_title?.trim() ?? "");
    setMetaDescription(a.meta_description?.trim() ?? "");
    setCollectionId(a.collection_id?.trim() ?? "");
    setCoverImage(a.cover_image ?? null);
    setCoverFile(null);
    setTagIds(
      Array.isArray(a.tags)
        ? a.tags.map((tagItem) => tagItem.id).filter((id): id is string => typeof id === "string")
        : [],
    );
    const mapped = articleDetailBlocksToContentBlocks(a.blocks);
    setBlocks(
      mapped.length ? mapped : [{ id: crypto.randomUUID(), type: "paragraph", content: "" }],
    );
  }, [articleQuery.data, loadKey]);

  useEffect(() => {
    if (!translationOf || articleId) return;
    getArticleById(translationOf).then((a) => {
      if (!a) return;
      setOriginalTitle(a.title ?? null);
      setTitle(a.title ?? "");
      setCategory(a.category ?? "");
      setSeoTitle(a.seo_title?.trim() ?? "");
      setMetaDescription(a.meta_description?.trim() ?? "");
      setCoverImage(a.cover_image ?? null);
      const mapped = articleDetailBlocksToContentBlocks(a.blocks);
      if (mapped.length) setBlocks(mapped);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!successToast) { setToastEntered(false); return; }
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setToastEntered(true));
    });
    return () => window.cancelAnimationFrame(id);
  }, [successToast]);

  const notifySuccessAndLeave = useCallback(
    (message: string, destination?: string) => {
      pendingDelayedNavRef.current = true;
      setSuccessToast(message);
      window.setTimeout(() => {
        pendingDelayedNavRef.current = false;
        setSuccessToast(null);
        invalidateArticlesListAndLeave(destination);
      }, SUCCESS_TOAST_MS);
    },
    [invalidateArticlesListAndLeave],
  );

  const safeReturnTo = returnTo && returnTo.startsWith("/admin/") ? returnTo : undefined;
  const destinationAfterSave = useCallback(
    (createdId?: string | null) => {
      if (safeReturnTo) return safeReturnTo;
      if (!isEditMode && !translationOf && createdId && config.contentType === "article") {
        return `/admin/articles/translate/${createdId}`;
      }
      return ADMIN_ARTICLES_PATH;
    },
    [safeReturnTo, isEditMode, translationOf, config.contentType],
  );

  const addBlock = useCallback((type: BlockType) => {
    setBlocks((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type, ...(type === "divider" ? {} : { content: "" }) },
    ]);
  }, []);

  const addCoverBlock = useCallback(() => {
    setBlocks((prev) => [{ id: crypto.randomUUID(), type: "image" as const }, ...prev]);
  }, []);

  const reorderBlocks = useCallback((activeId: string, overId: string) => {
    setBlocks((prev) => {
      const from = prev.findIndex((b) => b.id === activeId);
      const to = prev.findIndex((b) => b.id === overId);
      if (from < 0 || to < 0 || from === to) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }, []);

  const updateBlock = useCallback((id: string, patch: Partial<ContentBlock>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }, []);

  const buildPayload = useCallback(async () => {
    const apiBlocks = await buildArticleBlocksFromEditor(blocks, { onUploading: setMediaUploading });
    let resolvedCover = coverImage;
    if (coverFile) {
      setMediaUploading(true);
      try {
        resolvedCover = await uploadArticleAssetPath(coverFile);
        setCoverFile(null);
      } finally {
        setMediaUploading(false);
      }
    }
    const cid = collectionId.trim();
    return {
      title: title.trim(),
      content_type: config.contentType,
      category: category.trim(),
      language: language.trim() || undefined,
      visibility,
      is_premium: isPremium,
      seo_title: seoTitle.trim() || undefined,
      meta_description: metaDescription.trim() || undefined,
      collection_id: cid || undefined,
      tag_ids: tagIds.length ? tagIds : undefined,
      cover_image: resolvedCover || undefined,
      blocks: apiBlocks,
      translation_of: translationOf || undefined,
    };
  }, [
    blocks, title, config.contentType, category, language, visibility, isPremium,
    seoTitle, metaDescription, collectionId, tagIds, coverImage, coverFile, translationOf,
  ]);

  const handleSaveDraft = useCallback(async () => {
    if (!title.trim()) { setError(tLayout("validationTitle")); return; }
    if (!category.trim()) { setError(tLayout("validationCategory")); return; }
    setError(null);
    setBusy(true);
    try {
      const payload = await buildPayload();
      if (payload.blocks.length === 0) { setError(tLayout("validationBlocksDraft")); return; }
      if (isEditMode && articleId) {
        const status: ArticleLifecycleStatus =
          workflowStatus === "draft" ? "draft"
          : workflowStatus === "published" ? "published"
          : "scheduled";
        await updateArticle(articleId, { ...editPatchFromPayload(payload), status });
        notifySuccessAndLeave(tLayout("successChangesSaved"), destinationAfterSave());
        return;
      }
      const res = await createArticle(payload);
      const id = getArticleIdFromCreateResponse(res);
      notifySuccessAndLeave(tLayout("successDraftSaved"), destinationAfterSave(id));
    } catch (e) {
      setError(translateErr(e));
    } finally {
      if (!pendingDelayedNavRef.current) setBusy(false);
    }
  }, [
    title, category, buildPayload, notifySuccessAndLeave, destinationAfterSave,
    isEditMode, articleId, workflowStatus, tLayout, translateErr,
  ]);

  const handlePublish = useCallback(async () => {
    if (workflowStatus !== "published" && workflowStatus !== "scheduled") return;
    if (!title.trim()) { setError(tLayout("validationTitle")); return; }
    if (!category.trim()) { setError(tLayout("validationCategory")); return; }
    setError(null);
    setBusy(true);
    try {
      const payload = await buildPayload();
      if (payload.blocks.length === 0) { setError(tLayout("validationBlocksPublish")); return; }
      if (isEditMode && articleId) {
        await updateArticle(articleId, editPatchFromPayload(payload));
        if (initialWasDraftRef.current || workflowStatus === "scheduled") {
          await publishArticle(articleId);
          initialWasDraftRef.current = false;
        }
        notifySuccessAndLeave(tLayout("successArticleSubmitted"), destinationAfterSave());
        return;
      }
      const res = await createArticle(payload);
      const id = getArticleIdFromCreateResponse(res);
      if (!id) { setError(tLayout("errorCreateNoIdPublish")); return; }
      await publishArticle(id);
      notifySuccessAndLeave(tLayout("successArticleSubmitted"), destinationAfterSave(id));
    } catch (e) {
      setError(translateErr(e));
    } finally {
      if (!pendingDelayedNavRef.current) setBusy(false);
    }
  }, [
    workflowStatus, title, category, buildPayload, notifySuccessAndLeave,
    destinationAfterSave, isEditMode, articleId, tLayout, translateErr,
  ]);

  const handleScheduleConfirm = useCallback(
    async (iso: string) => {
      if (workflowStatus !== "published" && workflowStatus !== "scheduled") return;
      if (!title.trim()) { setError(tLayout("validationTitle")); setScheduleModalOpen(false); return; }
      if (!category.trim()) { setError(tLayout("validationCategory")); setScheduleModalOpen(false); return; }
      setError(null);
      setBusy(true);
      try {
        const payload = await buildPayload();
        if (payload.blocks.length === 0) { setError(tLayout("validationBlocksSchedule")); setScheduleModalOpen(false); return; }
        if (isEditMode && articleId) {
          await updateArticle(articleId, { ...editPatchFromPayload(payload), status: "scheduled" });
          await scheduleArticle(articleId, iso);
          setScheduleModalOpen(false);
          notifySuccessAndLeave(tLayout("successArticleScheduled"), destinationAfterSave());
          return;
        }
        const res = await createArticle(payload);
        const id = getArticleIdFromCreateResponse(res);
        if (!id) { setError(tLayout("errorCreateNoIdSchedule")); setScheduleModalOpen(false); return; }
        await scheduleArticle(id, iso);
        setScheduleModalOpen(false);
        notifySuccessAndLeave(tLayout("successArticleScheduled"), destinationAfterSave(id));
      } catch (e) {
        setError(translateErr(e));
        setScheduleModalOpen(false);
      } finally {
        if (!pendingDelayedNavRef.current) setBusy(false);
      }
    },
    [
      workflowStatus, title, category, buildPayload, notifySuccessAndLeave,
      destinationAfterSave, isEditMode, articleId, tLayout, translateErr,
    ],
  );

  const handleTranslationOfChange = useCallback(
    (id: string | undefined, title?: string | null) => {
      setTranslationOf(id || undefined);
      setOriginalTitle(id ? (title ?? null) : null);
    },
    [],
  );

  return {
    // derived
    t,
    tLayout,
    isEditMode,
    localizedConfig,
    localizedMainMedia,
    config,
    // query state
    articleLoading,
    loadError,
    // form state
    title, setTitle,
    blocks, setBlocks,
    workflowStatus, setWorkflowStatus,
    scheduledAt,
    category, setCategory,
    language, setLanguage,
    translationOf,
    originalTitle,
    visibility, setVisibility,
    isPremium, setIsPremium,
    seoTitle, setSeoTitle,
    metaDescription, setMetaDescription,
    collectionId, setCollectionId,
    tagIds, setTagIds,
    coverImage,
    coverFile,
    scheduleModalOpen, setScheduleModalOpen,
    busy,
    error,
    loadKey, setLoadKey,
    portalReady,
    mediaUploading,
    successToast,
    toastEntered,
    // handlers
    addBlock,
    addCoverBlock,
    reorderBlocks,
    updateBlock,
    handleSaveDraft,
    handlePublish,
    handleScheduleConfirm,
    handleTranslationOfChange,
    setCoverFile,
    setCoverImage,
  };
}
