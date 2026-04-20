"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { isAxiosError } from "axios";
import { AvailableBlocks, type BlockType } from "./AvailableBlocks";
import { ContentBlocks, type ContentBlock } from "./ContentBlocks";
import {
  ContentSettings,
  type ArticleWorkflowStatus,
} from "./ArticleSettings";
import { ContentEditorFooter } from "./ContentEditorFooter";
import { ScheduleArticleModal } from "./modals/ScheduleArticleModal";
import { buildOpenCallContentBlocksAndMainMedia } from "./lib/build-open-call-payload";
import { buildArticleBlocksFromEditor } from "./lib/build-api-blocks";
import { openCallConfig, openCallAllowedBlockTypes } from "./content-form-config";
import {
  localizeContentFormConfig,
  localizeMainMediaEditorCopy,
} from "@/lib/dashboard/localize-article-editor-config";
import { ApplicationFormBuilder } from "./open-call/ApplicationFormBuilder";
import { invalidateAdminArticlesListCache } from "@/lib/dashboard/admin-articles-list-cache";
import { getAdminTags } from "@/services/admin-tags.service";
import { createArticle } from "@/services/articles.service";
import {
  createOpenCall,
  extractOpenCallId,
  DEFAULT_OPEN_CALL_APPLICATION_FIELDS,
  validateOpenCallApplicationFields,
  type ApplicationFormField,
  type CreateOpenCallPayload,
} from "@/services/open-calls.service";
import { resolveApplicationFieldLabel, resolveFieldParticipantLabel } from "@/lib/application-form-labels";
import { formatApplicationFormValidationIssue } from "@/lib/application-form-validation-messages";

const titleClass =
  "w-full border-0 bg-transparent px-0 py-2 text-lg text-foreground placeholder:text-foreground outline-none";

const ADMIN_ARTICLES_PATH = "/admin/articles";

function apiLanguage(lang: string): "en" | "ar" {
  return lang.trim().toLowerCase() === "ar" ? "ar" : "en";
}

export function OpenCallEditorLayout() {
  const router = useRouter();
  const t = useTranslations("Dashboard.articles.editor");
  const tLayout = useTranslations("Dashboard.articles.editor.layout");
  const tAppForm = useTranslations("Dashboard.applicationForm");

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

  const localizedConfig = useMemo(
    () => localizeContentFormConfig(openCallConfig, (key) => t(key)),
    [t],
  );

  const localizedMainMedia = useMemo(
    () => localizeMainMediaEditorCopy(openCallConfig.contentType, (key) => t(key)),
    [t],
  );

  const config = openCallConfig;

  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<ContentBlock[]>(() => openCallConfig.defaultBlocks);
  const [workflowStatus, setWorkflowStatus] = useState<ArticleWorkflowStatus>("draft");
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("en");
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [seoTitle, setSeoTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [applicationFields, setApplicationFields] = useState<ApplicationFormField[]>(() =>
    DEFAULT_OPEN_CALL_APPLICATION_FIELDS.map((f) => JSON.parse(JSON.stringify(f))),
  );
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addBlock = useCallback((type: BlockType) => {
    setBlocks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type,
        ...(type === "divider"
          ? {}
          : type === "quote"
            ? { content: "", quoteAttribution: "" }
            : type === "callout"
              ? { content: "", calloutTitle: "" }
              : { content: "" }),
      },
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
      next.splice(to, 0, item!);
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

  const buildPayloads = useCallback(
    async (opts: {
      action: "publish" | "draft" | "schedule";
      scheduled_at: string | null;
      settingsStatus: "draft" | "published" | "scheduled";
    }): Promise<{
      openCall: CreateOpenCallPayload;
      articleBlocks: Awaited<ReturnType<typeof buildArticleBlocksFromEditor>>;
      coverImage?: string;
      excerpt?: string;
    }> => {
      const [{ content_blocks, main_media }, articleBlocks, adminTags] = await Promise.all([
        buildOpenCallContentBlocksAndMainMedia(blocks),
        buildArticleBlocksFromEditor(blocks),
        getAdminTags(),
      ]);
      const tags = tagIds
        .map((id) => adminTags.find((t) => t.id === id)?.name)
        .filter((n): n is string => Boolean(n?.trim()));

      const coverImage = main_media?.type === "image" ? main_media.url : undefined;
      const firstParagraph = content_blocks.find(
        (cb) => cb.type === "paragraph" && typeof cb.value === "string" && cb.value.trim(),
      );
      const excerpt =
        firstParagraph && typeof firstParagraph.value === "string"
          ? firstParagraph.value.slice(0, 300)
          : undefined;

      const openCall: CreateOpenCallPayload = {
        title: title.trim(),
        content_blocks,
        main_media,
        application_form: { fields: applicationFields },
        settings: {
          status: opts.settingsStatus,
          category: category.trim(),
          tags,
          language: apiLanguage(language),
          visibility,
        },
        seo: {
          title: seoTitle.trim() || title.trim(),
          meta_description: metaDescription.trim(),
        },
        action: opts.action,
        scheduled_at: opts.scheduled_at,
      };

      return { openCall, articleBlocks, coverImage, excerpt };
    },
    [blocks, title, applicationFields, category, language, visibility, seoTitle, metaDescription, tagIds],
  );

  const createArticleFromBlocks = useCallback(
    async (
      articleBlocks: Awaited<ReturnType<typeof buildArticleBlocksFromEditor>>,
      extra: {
        openCallId?: string;
        coverImage?: string;
        excerpt?: string;
        scheduledAt?: string | null;
      } = {},
    ) => {
      await createArticle({
        title: title.trim(),
        content_type: "open_call",
        category: category.trim(),
        language: apiLanguage(language),
        visibility,
        seo_title: seoTitle.trim() || title.trim(),
        meta_description: metaDescription.trim(),
        collection_id: collectionId.trim() || undefined,
        tag_ids: tagIds.length ? tagIds : undefined,
        blocks: articleBlocks,
        open_call_id: extra.openCallId,
        cover_image: extra.coverImage,
        excerpt: extra.excerpt,
        scheduled_at: extra.scheduledAt,
      });
    },
    [title, category, language, visibility, seoTitle, metaDescription, collectionId, tagIds],
  );

  const validateBeforeSubmit = useCallback(() => {
    if (!title.trim()) return tAppForm("editorOpenCall.titleRequired");
    if (!category.trim()) return tAppForm("editorOpenCall.categoryRequired");
    const issue = validateOpenCallApplicationFields(applicationFields);
    if (issue)
      return formatApplicationFormValidationIssue(issue, tAppForm, (n) => {
        const f = applicationFields.find((x) => x.name === n);
        return f ? resolveFieldParticipantLabel(f, tAppForm) : resolveApplicationFieldLabel(n, tAppForm);
      });
    return null;
  }, [title, category, applicationFields, tAppForm]);

  const handleSaveDraft = useCallback(async () => {
    const v = validateBeforeSubmit();
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const { openCall, articleBlocks, coverImage, excerpt } = await buildPayloads({
        action: "draft",
        scheduled_at: null,
        settingsStatus: "draft",
      });
      if (openCall.content_blocks.length === 0) {
        setError(tLayout("validationOpenCallBlocksDraft"));
        return;
      }
      const ocRes = await createOpenCall(openCall);
      const ocId = extractOpenCallId(ocRes) ?? undefined;
      await createArticleFromBlocks(articleBlocks, { openCallId: ocId, coverImage, excerpt });
      invalidateAdminArticlesListCache();
      router.push(ADMIN_ARTICLES_PATH);
    } catch (e) {
      setError(translateErr(e));
    } finally {
      setBusy(false);
    }
  }, [validateBeforeSubmit, buildPayloads, createArticleFromBlocks, router, translateErr, tLayout]);

  const handlePublish = useCallback(async () => {
    if (workflowStatus !== "published" && workflowStatus !== "scheduled") return;
    const v = validateBeforeSubmit();
    if (v) {
      setError(v);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const { openCall, articleBlocks, coverImage, excerpt } = await buildPayloads({
        action: "publish",
        scheduled_at: null,
        settingsStatus: "published",
      });
      if (openCall.content_blocks.length === 0) {
        setError(tLayout("validationOpenCallBlocksPublish"));
        return;
      }
      const ocRes = await createOpenCall(openCall);
      const ocId = extractOpenCallId(ocRes) ?? undefined;
      await createArticleFromBlocks(articleBlocks, { openCallId: ocId, coverImage, excerpt });
      invalidateAdminArticlesListCache();
      router.push(ADMIN_ARTICLES_PATH);
    } catch (e) {
      setError(translateErr(e));
    } finally {
      setBusy(false);
    }
  }, [
    workflowStatus,
    validateBeforeSubmit,
    buildPayloads,
    createArticleFromBlocks,
    router,
    translateErr,
    tLayout,
  ]);

  const handleScheduleConfirm = useCallback(
    async (iso: string) => {
      if (workflowStatus !== "published" && workflowStatus !== "scheduled") return;
      const v = validateBeforeSubmit();
      if (v) {
        setError(v);
        setScheduleModalOpen(false);
        return;
      }
      setError(null);
      setBusy(true);
      try {
        const { openCall, articleBlocks, coverImage, excerpt } = await buildPayloads({
          action: "schedule",
          scheduled_at: iso,
          settingsStatus: "scheduled",
        });
        if (openCall.content_blocks.length === 0) {
          setError(tLayout("validationOpenCallBlocksSchedule"));
          setScheduleModalOpen(false);
          return;
        }
        const ocRes = await createOpenCall(openCall);
        const ocId = extractOpenCallId(ocRes) ?? undefined;
        await createArticleFromBlocks(articleBlocks, {
          openCallId: ocId,
          coverImage,
          excerpt,
          scheduledAt: iso,
        });
        invalidateAdminArticlesListCache();
        setScheduleModalOpen(false);
        router.push(ADMIN_ARTICLES_PATH);
      } catch (e) {
        setError(translateErr(e));
        setScheduleModalOpen(false);
      } finally {
        setBusy(false);
      }
    },
    [
      workflowStatus,
      validateBeforeSubmit,
      buildPayloads,
      createArticleFromBlocks,
      router,
      translateErr,
      tLayout,
    ],
  );

  useEffect(() => {
    if (workflowStatus !== "scheduled") setScheduledAt(null);
  }, [workflowStatus]);

  return (
    <div className="flex min-h-0 flex-col">
      <ScheduleArticleModal
        open={scheduleModalOpen}
        busy={busy}
        onClose={() => !busy && setScheduleModalOpen(false)}
        onConfirm={handleScheduleConfirm}
      />

      <div className="flex flex-1 gap-6 overflow-hidden">
        <div className="min-w-0 flex-1 space-y-6 overflow-y-auto">
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

          <ApplicationFormBuilder fields={applicationFields} onChange={setApplicationFields} />
        </div>

        <aside className="flex w-64 shrink-0 flex-col gap-4 overflow-y-auto">
          <AvailableBlocks
            onAddBlock={addBlock}
            allowedBlockTypes={openCallAllowedBlockTypes}
            imageBlockLabel={localizedMainMedia.blockName}
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
