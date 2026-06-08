"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { isAxiosError } from "axios";
import { AvailableBlocks, type BlockType } from "./AvailableBlocks";
import { ContentBlocks, type ContentBlock } from "./ContentBlocks";
import {
  ContentSettings,
  type ArticleWorkflowStatus,
} from "./ArticleSettings";
import { ContentEditorFooter } from "./ContentEditorFooter";
import { EditorToolbar } from "./EditorToolbar";
import { EditorRegistryProvider } from "./lib/editor-registry";
import { ScheduleArticleModal } from "./modals/ScheduleArticleModal";
import { buildOpenCallContentBlocksAndMainMedia } from "./lib/build-open-call-payload";
import { buildArticleBlocksFromEditor } from "./lib/build-api-blocks";
import { openCallConfig, openCallAllowedBlockTypes } from "./content-form-config";
import {
  localizeContentFormConfig,
  localizeMainMediaEditorCopy,
} from "@/lib/dashboard/localize-article-editor-config";
import { ApplicationFormBuilder } from "./open-call/ApplicationFormBuilder";
import { ApplicationFormPreview } from "./open-call/ApplicationFormPreview";
import { invalidateAdminArticlesListCache } from "@/lib/dashboard/admin-articles-list-cache";
import { useAdminTags } from "@/hooks/queries/admin-tags";
import { createArticle, getArticleById } from "@/services/articles.service";
import { articleDetailBlocksToContentBlocks } from "@/components/dashboard/admin/articles/articles-editor/lib/api-blocks-to-content-blocks";
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

/**
 * When adding a translation of an existing open call, we must reuse the
 * original open call's id rather than creating a new one. The ref is populated
 * at mount; if the fetch hasn't resolved by the time the user saves, we fetch
 * inline here so the save path is always correct.
 */
async function resolveOpenCallId(
  translationOf: string | undefined,
  ref: React.MutableRefObject<string | null | undefined>,
  ocPayload: Parameters<typeof createOpenCall>[0],
): Promise<string | undefined> {
  if (translationOf) {
    // Use cached value if already resolved.
    if (ref.current !== undefined) return ref.current ?? undefined;
    // Fetch inline if mount effect hasn't completed yet.
    const original = await getArticleById(translationOf);
    const id = original?.open_call_id ?? null;
    ref.current = id;
    return id ?? undefined;
  }
  // Not a translation — create a new open call as usual.
  return extractOpenCallId(await createOpenCall(ocPayload)) ?? undefined;
}

const ADMIN_ARTICLES_PATH = "/admin/articles";

function apiLanguage(lang: string): "en" | "ar" | "es" | "fr" {
  const l = lang.trim().toLowerCase();
  if (l === "ar") return "ar";
  if (l === "es") return "es";
  if (l === "fr") return "fr";
  return "en";
}

type OpenCallEditorLayoutProps = {
  initialTranslationOf?: string;
  initialLanguage?: string;
};

export function OpenCallEditorLayout({
  initialTranslationOf,
  initialLanguage,
}: OpenCallEditorLayoutProps = {}) {
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
  const [translationOf] = useState(initialTranslationOf);
  const [language, setLanguage] = useState(initialLanguage ?? "en");
  const [originalTitle, setOriginalTitle] = useState<string | null>(null);
  // Resolved at mount; also re-fetched inline at save time if still null.
  const existingOpenCallIdRef = useRef<string | null | undefined>(undefined);
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
  const [editingFormBlock, setEditingFormBlock] = useState(false);

  // Translation create mode: pre-fill form fields from the original so the
  // translator starts with content rather than a blank page.
  useEffect(() => {
    if (!translationOf) return;
    getArticleById(translationOf).then((a) => {
      if (!a) return;
      existingOpenCallIdRef.current = a.open_call_id ?? null;
      setOriginalTitle(a.title ?? null);
      setTitle(a.title ?? "");
      setCategory(a.category ?? "");
      setSeoTitle(a.seo_title?.trim() ?? "");
      setMetaDescription(a.meta_description?.trim() ?? "");
      const mapped = articleDetailBlocksToContentBlocks(a.blocks ?? []);
      if (mapped.length) setBlocks(mapped);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const updateBlock = useCallback((id: string, patch: Partial<ContentBlock>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }, []);

  const { data: adminTagsData = [] } = useAdminTags();

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
      const [{ content_blocks, main_media }, articleBlocks] = await Promise.all([
        buildOpenCallContentBlocksAndMainMedia(blocks),
        buildArticleBlocksFromEditor(blocks),
      ]);
      const adminTags = adminTagsData;
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
          ...(translationOf ? { translation_of: translationOf } : {}),
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
    [blocks, title, applicationFields, category, language, visibility, seoTitle, metaDescription, tagIds, adminTagsData, translationOf],
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
        translation_of: translationOf || undefined,
      });
    },
    [title, category, language, visibility, seoTitle, metaDescription, collectionId, tagIds, translationOf],
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
      const ocId = await resolveOpenCallId(translationOf, existingOpenCallIdRef, openCall);
      await createArticleFromBlocks(articleBlocks, { openCallId: ocId, coverImage, excerpt });
      invalidateAdminArticlesListCache();
      router.push(ADMIN_ARTICLES_PATH);
    } catch (e) {
      setError(translateErr(e));
    } finally {
      setBusy(false);
    }
  }, [validateBeforeSubmit, buildPayloads, createArticleFromBlocks, router, translateErr, tLayout, translationOf, existingOpenCallIdRef]);

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
      const ocId = await resolveOpenCallId(translationOf, existingOpenCallIdRef, openCall);
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
    translationOf,
    existingOpenCallIdRef,
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
        const ocId = await resolveOpenCallId(translationOf, existingOpenCallIdRef, openCall);
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
      translationOf,
      existingOpenCallIdRef,
    ],
  );

  useEffect(() => {
    if (workflowStatus !== "scheduled") setScheduledAt(null);
  }, [workflowStatus]);

  return (
    <EditorRegistryProvider>
    <div className="flex min-h-0 flex-col">
      <ScheduleArticleModal
        open={scheduleModalOpen}
        busy={busy}
        onClose={() => !busy && setScheduleModalOpen(false)}
        onConfirm={handleScheduleConfirm}
      />

      {config.showToolbar ? (
        <div className="mb-4 shrink-0">
          <EditorToolbar />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-6 lg:flex-row lg:overflow-hidden">
        <div className="min-w-0 flex-1 space-y-6 lg:overflow-y-auto">
          {translationOf && originalTitle ? (
            <div className="flex items-center gap-2 rounded-lg border border-[#C9A96E]/30 bg-[#C9A96E]/5 px-3 py-2 text-xs text-gray-400">
              <span>Translating from:</span>
              <span className="font-medium text-[#C9A96E]">{originalTitle}</span>
              <span className="text-gray-600">·</span>
              <Link
                href={`/admin/articles/edit/${translationOf}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                View original →
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
            onUpdateBlock={updateBlock}
            onAddCoverBlock={addCoverBlock}
            onReorderBlock={reorderBlocks}
            config={localizedConfig}
            mainMediaCopy={localizedMainMedia}
          />

          {/* Public form preview (matches the SVG). The pencil header toggles
              into the field-configuration builder so admins can still edit. */}
          <div>
            <hr className="mb-4 border-[var(--tott-card-border)]" />
            <button
              type="button"
              onClick={() => setEditingFormBlock((v) => !v)}
              className="mb-3 inline-flex items-center gap-2 text-sm text-gray-300 transition-colors hover:text-foreground"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              {editingFormBlock ? tAppForm("editorOpenCall.donePreview") : tAppForm("editorOpenCall.editFormBlock")}
            </button>
            {editingFormBlock ? (
              <ApplicationFormBuilder fields={applicationFields} onChange={setApplicationFields} />
            ) : (
              <ApplicationFormPreview fields={applicationFields} />
            )}
          </div>
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-64 lg:overflow-y-auto">
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
    </EditorRegistryProvider>
  );
}
