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
import { LanguageFormTabs } from "@/components/dashboard/admin/translations";
import type { LanguageTabStatus } from "@/components/dashboard/admin/translations/LanguageFormTabs";
import { routing } from "@/i18n/routing";
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
import { createArticle, getArticleById, getArticleIdFromCreateResponse } from "@/services/articles.service";
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

/** Per-locale (translatable) state. Structural settings — category, tags,
 * visibility, application form, schedule — stay shared from the primary. */
type LangForm = {
  title: string;
  blocks: ContentBlock[];
  seoTitle: string;
  metaDescription: string;
};

function emptyLangForm(): LangForm {
  return {
    title: "",
    blocks: openCallConfig.defaultBlocks,
    seoTitle: "",
    metaDescription: "",
  };
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

  const primaryLang = apiLanguage(initialLanguage ?? "en");
  // Multi-language authoring (Pattern 2, see WriterFormContent): one LangForm
  // per opened locale. A locale absent from `forms` has never been opened;
  // opening it clones the primary tab. `dirty` tracks which tabs the admin
  // actually touched — untouched tabs never submit.
  const [activeLang, setActiveLang] = useState<string>(primaryLang);
  const [forms, setForms] = useState<Record<string, LangForm>>(() => ({
    [primaryLang]: emptyLangForm(),
  }));
  const [dirty, setDirty] = useState<Record<string, boolean>>({});

  const form = forms[activeLang] ?? emptyLangForm();
  const { title, blocks, seoTitle, metaDescription } = form;

  const [workflowStatus, setWorkflowStatus] = useState<ArticleWorkflowStatus>("draft");
  const [scheduledAt, setScheduledAt] = useState<string | null>(null);
  const [category, setCategory] = useState("");
  const [translationOf] = useState(initialTranslationOf);
  const [originalTitle, setOriginalTitle] = useState<string | null>(null);
  // Resolved at mount; also re-fetched inline at save time if still null.
  const existingOpenCallIdRef = useRef<string | null | undefined>(undefined);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [collectionId, setCollectionId] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [applicationFields, setApplicationFields] = useState<ApplicationFormField[]>(() =>
    DEFAULT_OPEN_CALL_APPLICATION_FIELDS.map((f) => JSON.parse(JSON.stringify(f))),
  );
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingFormBlock, setEditingFormBlock] = useState(false);

  // All per-locale writes go through here so dirty-tracking can't be missed.
  const updateForm = useCallback(
    (mutate: (prev: LangForm) => LangForm) => {
      setForms((prev) => ({
        ...prev,
        [activeLang]: mutate(prev[activeLang] ?? emptyLangForm()),
      }));
      setDirty((prev) => (prev[activeLang] ? prev : { ...prev, [activeLang]: true }));
    },
    [activeLang],
  );

  const setTitle = useCallback(
    (v: string) => updateForm((prev) => ({ ...prev, title: v })),
    [updateForm],
  );
  const setSeoTitle = useCallback(
    (v: string) => updateForm((prev) => ({ ...prev, seoTitle: v })),
    [updateForm],
  );
  const setMetaDescription = useCallback(
    (v: string) => updateForm((prev) => ({ ...prev, metaDescription: v })),
    [updateForm],
  );
  const setBlocks = useCallback(
    (updater: React.SetStateAction<ContentBlock[]>) =>
      updateForm((prev) => ({
        ...prev,
        blocks: typeof updater === "function" ? updater(prev.blocks) : updater,
      })),
    [updateForm],
  );

  // Translation create mode: pre-fill the primary tab from the original so the
  // translator starts with content rather than a blank page.
  useEffect(() => {
    if (!translationOf) return;
    getArticleById(translationOf).then((a) => {
      if (!a) return;
      existingOpenCallIdRef.current = a.open_call_id ?? null;
      setOriginalTitle(a.title ?? null);
      setCategory(a.category ?? "");
      const mapped = articleDetailBlocksToContentBlocks(a.blocks ?? []);
      setForms((prev) => ({
        ...prev,
        [primaryLang]: {
          title: a.title ?? "",
          seoTitle: a.seo_title?.trim() ?? "",
          metaDescription: a.meta_description?.trim() ?? "",
          blocks: mapped.length ? mapped : (prev[primaryLang]?.blocks ?? openCallConfig.defaultBlocks),
        },
      }));
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tab switch — clone the primary tab into a never-opened locale.
  const handleSelectLang = useCallback(
    (loc: string) => {
      if (loc === activeLang || busy) return;
      setForms((prev) =>
        prev[loc] ? prev : { ...prev, [loc]: { ...(prev[primaryLang] ?? emptyLangForm()) } },
      );
      setActiveLang(loc);
    },
    [activeLang, busy, primaryLang],
  );

  const tabStatus = useMemo(() => {
    const map: Record<string, LanguageTabStatus> = {};
    for (const loc of routing.locales) {
      map[loc] = dirty[loc]
        ? "dirty"
        : loc === primaryLang
          ? "primary"
          : forms[loc]
            ? "existing"
            : "empty";
    }
    return map;
  }, [dirty, primaryLang, forms]);

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
  }, [setBlocks]);

  const addCoverBlock = useCallback(() => {
    setBlocks((prev) => [{ id: crypto.randomUUID(), type: "image" as const }, ...prev]);
  }, [setBlocks]);

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
  }, [setBlocks]);

  const updateBlock = useCallback((id: string, patch: Partial<ContentBlock>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }, [setBlocks]);

  const removeBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }, [setBlocks]);

  const { data: adminTagsData = [] } = useAdminTags();

  // Save always builds from the PRIMARY tab — the active tab may be a sibling.
  const primaryForm = forms[primaryLang] ?? emptyLangForm();

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
        buildOpenCallContentBlocksAndMainMedia(primaryForm.blocks),
        buildArticleBlocksFromEditor(primaryForm.blocks),
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
        title: primaryForm.title.trim(),
        content_blocks,
        main_media,
        application_form: { fields: applicationFields },
        settings: {
          status: opts.settingsStatus,
          category: category.trim(),
          tags,
          language: apiLanguage(primaryLang),
          visibility,
          ...(translationOf ? { translation_of: translationOf } : {}),
        },
        seo: {
          title: primaryForm.seoTitle.trim() || primaryForm.title.trim(),
          meta_description: primaryForm.metaDescription.trim(),
        },
        action: opts.action,
        scheduled_at: opts.scheduled_at,
      };

      return { openCall, articleBlocks, coverImage, excerpt };
    },
    [primaryForm, applicationFields, category, primaryLang, visibility, tagIds, adminTagsData, translationOf],
  );

  const createArticleFromBlocks = useCallback(
    async (
      articleBlocks: Awaited<ReturnType<typeof buildArticleBlocksFromEditor>>,
      extra: {
        openCallId?: string;
        coverImage?: string;
        excerpt?: string;
        scheduledAt?: string | null;
        /** Sibling tab: create this locale's version linked to the original,
         * with that tab's authored text. */
        asTranslation?: {
          language: string;
          of: string;
          title?: string;
          seoTitle?: string;
          metaDescription?: string;
        };
      } = {},
    ) => {
      const sibTitle = extra.asTranslation?.title?.trim() || primaryForm.title.trim();
      const sibSeo = extra.asTranslation?.seoTitle?.trim() ?? primaryForm.seoTitle.trim();
      const sibMeta = extra.asTranslation?.metaDescription?.trim() ?? primaryForm.metaDescription.trim();
      const res = await createArticle({
        title: sibTitle,
        content_type: "open_call",
        category: category.trim(),
        language: apiLanguage(extra.asTranslation?.language ?? primaryLang),
        visibility,
        seo_title: sibSeo || sibTitle,
        meta_description: sibMeta,
        collection_id: collectionId.trim() || undefined,
        tag_ids: tagIds.length ? tagIds : undefined,
        blocks: articleBlocks,
        open_call_id: extra.openCallId,
        cover_image: extra.coverImage,
        excerpt: extra.excerpt,
        scheduled_at: extra.scheduledAt,
        translation_of: extra.asTranslation?.of ?? translationOf ?? undefined,
      });
      return getArticleIdFromCreateResponse(res);
    },
    [primaryForm, category, primaryLang, visibility, collectionId, tagIds, translationOf],
  );

  /** After the primary tab saves: create each OTHER dirty tab as a draft
   * sibling in that locale. They share the open call record and join the
   * primary article's translation group. Best effort per sibling. */
  const createDirtySiblings = useCallback(
    async (
      extra: { openCallId?: string; coverImage?: string; excerpt?: string },
      originalId: string | null,
    ) => {
      const groupId = translationOf ?? originalId;
      if (!groupId) return;
      for (const loc of routing.locales) {
        if (apiLanguage(loc) === primaryLang || !dirty[loc]) continue;
        const f = forms[loc];
        if (!f) continue;
        try {
          const sibBlocks = await buildArticleBlocksFromEditor(f.blocks, {});
          await createArticleFromBlocks(sibBlocks, {
            ...extra,
            asTranslation: {
              language: loc,
              of: groupId,
              title: f.title,
              seoTitle: f.seoTitle,
              metaDescription: f.metaDescription,
            },
          });
        } catch {
          /* sibling may already exist — the primary stands */
        }
      }
    },
    [translationOf, primaryLang, dirty, forms, createArticleFromBlocks],
  );

  const validateBeforeSubmit = useCallback(() => {
    if (!primaryForm.title.trim()) return tAppForm("editorOpenCall.titleRequired");
    if (!category.trim()) return tAppForm("editorOpenCall.categoryRequired");
    const issue = validateOpenCallApplicationFields(applicationFields);
    if (issue)
      return formatApplicationFormValidationIssue(issue, tAppForm, (n) => {
        const f = applicationFields.find((x) => x.name === n);
        return f ? resolveFieldParticipantLabel(f, tAppForm) : resolveApplicationFieldLabel(n, tAppForm);
      });
    return null;
  }, [primaryForm, category, applicationFields, tAppForm]);

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
      const originalId = await createArticleFromBlocks(articleBlocks, { openCallId: ocId, coverImage, excerpt });
      await createDirtySiblings({ openCallId: ocId, coverImage, excerpt }, originalId);
      invalidateAdminArticlesListCache();
      router.push(ADMIN_ARTICLES_PATH);
    } catch (e) {
      setError(translateErr(e));
    } finally {
      setBusy(false);
    }
  }, [validateBeforeSubmit, buildPayloads, createArticleFromBlocks, createDirtySiblings, router, translateErr, tLayout, translationOf, existingOpenCallIdRef]);

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
      const originalId = await createArticleFromBlocks(articleBlocks, { openCallId: ocId, coverImage, excerpt });
      // Siblings are plain drafts even when the primary publishes.
      await createDirtySiblings({ openCallId: ocId, coverImage, excerpt }, originalId);
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
    createDirtySiblings,
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
        const originalId = await createArticleFromBlocks(articleBlocks, {
          openCallId: ocId,
          coverImage,
          excerpt,
          scheduledAt: iso,
        });
        await createDirtySiblings({ openCallId: ocId, coverImage, excerpt }, originalId);
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
      createDirtySiblings,
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

  const isRtl = activeLang === "ar";

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

      {/* In-place language tabs (Pattern 2): each tab holds its own text;
          untouched tabs never submit. */}
      <div className="mb-4 flex flex-wrap items-center justify-end gap-3 border-b border-[var(--tott-card-border)] pb-4 shrink-0">
        <LanguageFormTabs
          active={activeLang}
          onSelect={handleSelectLang}
          status={tabStatus}
          disabled={busy}
        />
      </div>

      <div className="flex flex-1 flex-col gap-6 lg:flex-row lg:overflow-hidden">
        <div
          className="min-w-0 flex-1 space-y-6 lg:overflow-y-auto"
          dir={isRtl ? "rtl" : "ltr"}
          lang={isRtl ? "ar" : undefined}
        >
          {translationOf && originalTitle ? (
            <div className="flex items-center gap-2 rounded-lg border border-[var(--tott-accent-gold)]/30 bg-[var(--tott-accent-gold)]/5 px-3 py-2 text-xs text-[var(--tott-muted)]" dir="ltr">
              <span>Translating from:</span>
              <span className="font-medium text-[var(--tott-dash-gold-text)]">{originalTitle}</span>
              <span className="text-[var(--tott-muted)]">·</span>
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
            dir={isRtl ? "rtl" : "ltr"}
            lang={isRtl ? "ar" : undefined}
          />
          <ContentBlocks
            blocks={blocks}
            onUpdateBlock={updateBlock}
            onAddCoverBlock={addCoverBlock}
            onReorderBlock={reorderBlocks}
            onRemoveBlock={removeBlock}
            config={localizedConfig}
            mainMediaCopy={localizedMainMedia}
          />

          {/* Public form preview (matches the SVG). The pencil header toggles
              into the field-configuration builder so admins can still edit. */}
          <div dir="ltr">
            <hr className="mb-4 border-[var(--tott-card-border)]" />
            <button
              type="button"
              onClick={() => setEditingFormBlock((v) => !v)}
              className="mb-3 inline-flex items-center gap-2 text-sm text-[var(--tott-muted)] transition-colors hover:text-foreground"
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
            language={activeLang}
            onLanguageChange={handleSelectLang}
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
