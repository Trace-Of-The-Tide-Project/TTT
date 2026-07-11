"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
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
  type ArticleAccessLevel,
} from "@/services/articles.service";
import { useArticle } from "@/hooks/queries/articles";
import { useTranslations as useTranslationGroup } from "@/hooks/queries/translations";
import type { LanguageTabStatus } from "@/components/dashboard/admin/translations/LanguageFormTabs";
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
  /** Create the article inside this magazine issue (magazine product). */
  initialIssueId?: string;
  /** Parent magazine — passed alongside initialIssueId. */
  initialMagazineId?: string;
  returnTo?: string;
};

const ADMIN_ARTICLES_PATH = "/admin/articles";
const SUCCESS_TOAST_MS = 3200;

/** Per-locale (translatable) form state — Pattern 2 language tabs. Everything
 * else (category, tags, cover, access, scheduling) is shared from the primary. */
type LangForm = {
  title: string;
  blocks: ContentBlock[];
  seoTitle: string;
  metaDescription: string;
};

const langFormFingerprint = (f: LangForm) => JSON.stringify(f);

export function useArticleEditor({
  config: configFromProps,
  articleId,
  initialTranslationOf,
  initialLanguage,
  initialIssueId,
  initialMagazineId,
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
  // Primary language of the piece; in edit mode this is the loaded article's
  // language and never changes with tab switches.
  const [language, setLanguage] = useState(initialLanguage || "en");
  // In-place language tabs (Pattern 2, see LanguageFormTabs docblock): the
  // ACTIVE tab lives in the regular title/blocks/seo states; inactive tabs are
  // stashed here on switch. A locale absent from the buffers has never been
  // opened.
  const [activeLang, setActiveLang] = useState(initialLanguage || "en");
  const activeLangRef = useRef(activeLang);
  activeLangRef.current = activeLang;
  const languageBuffersRef = useRef<Record<string, LangForm>>({});
  // Per-locale pristine fingerprints; a tab whose form differs from its
  // baseline is "dirty" and gets saved as a sibling version.
  const langBaselineRef = useRef<Record<string, string>>({});
  const [translationOf, setTranslationOf] = useState<string | undefined>(initialTranslationOf);
  const [originalTitle, setOriginalTitle] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [accessLevel, setAccessLevel] = useState<ArticleAccessLevel>("open");
  const [previewBlockCount, setPreviewBlockCount] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [currency, setCurrency] = useState("USD");
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

  // Live form of the ACTIVE tab (the regular states) + ref for async readers.
  const liveForm: LangForm = { title, blocks, seoTitle, metaDescription };
  const liveFormRef = useRef(liveForm);
  liveFormRef.current = liveForm;

  // Capture a per-tab pristine baseline shortly after a tab is (re)seeded.
  // ponytail: same 1.5s settle window as the global dirty baseline — rich-text
  // editors normalize their HTML right after mounting.
  const [langBaselineTick, setLangBaselineTick] = useState(0);
  useEffect(() => {
    const loc = activeLang;
    if (langBaselineRef.current[loc]) return;
    const id = setTimeout(() => {
      langBaselineRef.current[loc] = langFormFingerprint(liveFormRef.current);
    }, 1500);
    return () => clearTimeout(id);
  }, [activeLang, langBaselineTick]);

  // Existing sibling versions of the translation group (edit mode).
  const groupType = config.contentType === "open-call" ? "open-call" : "article";
  const groupQuery = useTranslationGroup(groupType, articleId);
  const versionIds = useMemo(() => {
    const map: Record<string, string> = {};
    for (const v of groupQuery.data?.versions ?? []) map[v.language] = v.id;
    return map;
  }, [groupQuery.data]);

  const applyLangForm = useCallback((f: LangForm) => {
    setTitle(f.title);
    setBlocks(f.blocks);
    setSeoTitle(f.seoTitle);
    setMetaDescription(f.metaDescription);
  }, []);

  /** Tab switch (also wired to the settings language select). Stashes the
   * active tab and restores/seed the target: a previously opened tab restores
   * its buffer; an existing sibling (edit mode) is lazily fetched; a brand-new
   * tab keeps the current content on screen as the translation starting point. */
  const switchLanguage = useCallback(
    (next: string) => {
      if (next === activeLang || busy) return;
      languageBuffersRef.current[activeLang] = { title, blocks, seoTitle, metaDescription };
      const buf = languageBuffersRef.current[next];
      if (buf) {
        applyLangForm(buf);
      } else if (isEditMode && versionIds[next]) {
        // Existing sibling never opened this session — fetch it. The current
        // content stays visible until the fetch lands; if the admin already
        // started typing in the tab, the fetch never clobbers their work.
        const cloneFp = langFormFingerprint({ title, blocks, seoTitle, metaDescription });
        getArticleById(versionIds[next]).then((a) => {
          if (!a || activeLangRef.current !== next) return;
          if (langFormFingerprint(liveFormRef.current) !== cloneFp) return;
          const mapped = articleDetailBlocksToContentBlocks(a.blocks);
          const f: LangForm = {
            title: a.title ?? "",
            blocks: mapped.length
              ? mapped
              : [{ id: crypto.randomUUID(), type: "paragraph", content: "" }],
            seoTitle: a.seo_title?.trim() ?? "",
            metaDescription: a.meta_description?.trim() ?? "",
          };
          applyLangForm(f);
          // Re-capture the pristine baseline from the fetched content.
          delete langBaselineRef.current[next];
          setLangBaselineTick((n) => n + 1);
        });
      }
      // else: clone-in-place — current content is the starting point.
      setActiveLang(next);
    },
    [activeLang, busy, title, blocks, seoTitle, metaDescription, isEditMode, versionIds, applyLangForm],
  );

  /** Create mode only: the settings language select re-tags which language is
   * the PRIMARY (the one required and saved first). Follows the tab switch. */
  const changePrimaryLanguage = useCallback(
    (next: string) => {
      if (isEditMode) return;
      switchLanguage(next);
      setLanguage(next.trim() || "en");
    },
    [isEditMode, switchLanguage],
  );

  /** A tab is dirty when its form differs from its pristine baseline. */
  const langDirtyFor = useCallback(
    (loc: string): boolean => {
      const base = langBaselineRef.current[loc];
      if (!base) return false;
      const f = loc === activeLangRef.current ? liveFormRef.current : languageBuffersRef.current[loc];
      return f ? langFormFingerprint(f) !== base : false;
    },
    [],
  );

  // Computed per render so typing updates the dot immediately.
  const tabStatus: Record<string, LanguageTabStatus> = {};
  for (const loc of routing.locales) {
    tabStatus[loc] = langDirtyFor(loc)
      ? "dirty"
      : loc === language
        ? "primary"
        : versionIds[loc] || languageBuffersRef.current[loc]
          ? "existing"
          : "empty";
  }

  // ── Dirty tracking ──
  // Fingerprint of everything the admin can edit; the baseline is captured
  // after each hydration (mount, article load, translation prefill) and
  // anything different afterwards counts as unsaved work.
  const editorFingerprint = JSON.stringify({
    title, category, language, visibility, accessLevel, previewBlockCount,
    price, currency, seoTitle, metaDescription, collectionId, tagIds,
    coverImage, blocks, workflowStatus,
  });
  const dirtyBaselineRef = useRef<string | null>(null);
  const fingerprintRef = useRef(editorFingerprint);
  fingerprintRef.current = editorFingerprint;
  const [rebaselineTick, setRebaselineTick] = useState(0);
  useEffect(() => {
    // The rich-text editors normalize their HTML shortly after mounting,
    // which mutates blocks without any user input. Capture the baseline
    // after that settles so a freshly loaded article reads as pristine.
    // ponytail: fixed 1.5s settle window; edits made inside it are absorbed.
    dirtyBaselineRef.current = null;
    const id = setTimeout(() => {
      dirtyBaselineRef.current = fingerprintRef.current;
    }, 1500);
    return () => clearTimeout(id);
  }, [rebaselineTick]);
  const isDirty =
    dirtyBaselineRef.current !== null &&
    dirtyBaselineRef.current !== editorFingerprint;

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
    const loadedLang = (a.language || "en").trim() || "en";
    setLanguage(loadedLang);
    setActiveLang(loadedLang);
    languageBuffersRef.current = {};
    langBaselineRef.current = {};
    setLangBaselineTick((n) => n + 1);
    setTranslationOf(a.translation_of?.trim() || undefined);
    setVisibility((a.visibility || "public").toLowerCase() === "private" ? "private" : "public");
    const level = (a.access_level || "open").trim().toLowerCase();
    setAccessLevel(
      (["open", "preview", "subscriber", "paid"] as const).includes(level as ArticleAccessLevel)
        ? (level as ArticleAccessLevel)
        : "open",
    );
    setPreviewBlockCount(a.preview_block_count ?? null);
    setPrice(a.price ?? null);
    setCurrency(a.currency?.trim() || "USD");
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
    setRebaselineTick((n) => n + 1); // loaded values are the pristine state
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
      setRebaselineTick((n) => n + 1); // prefilled translation = pristine
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
  // Translate wizard retired — sibling languages are authored in-place via the
  // tabs, so saving always returns to the list (or the caller's return URL).
  const destinationAfterSave = useCallback(
    () => safeReturnTo ?? ADMIN_ARTICLES_PATH,
    [safeReturnTo],
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

  const removeBlock = useCallback((id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  /** Save always builds from the PRIMARY tab — the active tab may be a sibling. */
  const getPrimaryForm = useCallback(
    (): LangForm =>
      activeLangRef.current === language
        ? liveFormRef.current
        : (languageBuffersRef.current[language] ?? liveFormRef.current),
    [language],
  );

  const buildPayload = useCallback(async (f: LangForm) => {
    const apiBlocks = await buildArticleBlocksFromEditor(f.blocks, { onUploading: setMediaUploading });
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
      title: f.title.trim(),
      content_type: config.contentType,
      category: category.trim(),
      language: language.trim() || undefined,
      visibility,
      access_level: accessLevel,
      preview_block_count: accessLevel === "preview" ? (previewBlockCount ?? undefined) : undefined,
      price: accessLevel === "paid" ? (price ?? undefined) : undefined,
      currency: accessLevel === "paid" ? currency : undefined,
      seo_title: f.seoTitle.trim() || undefined,
      meta_description: f.metaDescription.trim() || undefined,
      collection_id: cid || undefined,
      tag_ids: tagIds.length ? tagIds : undefined,
      cover_image: resolvedCover || undefined,
      blocks: apiBlocks,
      translation_of: translationOf || undefined,
      // Issue-scoped create: backend forces product=magazine when issue_id set.
      issue_id: initialIssueId || undefined,
      magazine_id: initialMagazineId || undefined,
    };
  }, [
    config.contentType, category, language, visibility,
    accessLevel, previewBlockCount, price, currency,
    collectionId, tagIds, coverImage, coverFile, translationOf,
    initialIssueId, initialMagazineId,
  ]);

  /** After the primary saves: persist each OTHER dirty tab. An existing
   * sibling version is PATCHed; a new locale is POSTed as a draft linked to
   * the translation group. Best effort — a failed sibling never blocks the
   * primary. Siblings stay drafts even when the primary publishes. */
  const saveDirtySiblings = useCallback(
    async (payload: Awaited<ReturnType<typeof buildPayload>>, groupId: string | null | undefined) => {
      for (const loc of routing.locales) {
        if (loc === language || !langDirtyFor(loc)) continue;
        const f =
          loc === activeLangRef.current ? liveFormRef.current : languageBuffersRef.current[loc];
        if (!f) continue;
        try {
          const built = await buildArticleBlocksFromEditor(f.blocks, {
            onUploading: setMediaUploading,
          });
          const sibId = versionIds[loc];
          if (sibId) {
            await updateArticle(sibId, {
              title: f.title.trim() || undefined,
              blocks: built.length ? built : undefined,
              seo_title: f.seoTitle.trim() || undefined,
              meta_description: f.metaDescription.trim() || undefined,
            });
          } else if (groupId) {
            await createArticle({
              ...payload,
              language: loc,
              translation_of: groupId,
              title: f.title.trim() || payload.title,
              // All-empty tab body → copy the primary's blocks.
              blocks: built.length ? built : payload.blocks,
              seo_title: f.seoTitle.trim() || undefined,
              meta_description: f.metaDescription.trim() || undefined,
            });
          }
        } catch {
          /* sibling may already exist or fail validation — primary stands */
        }
      }
    },
    [language, langDirtyFor, versionIds],
  );

  const handleSaveDraft = useCallback(async () => {
    const pf = getPrimaryForm();
    if (!pf.title.trim()) { setError(tLayout("validationTitle")); return; }
    if (!category.trim()) { setError(tLayout("validationCategory")); return; }
    setError(null);
    setBusy(true);
    try {
      const payload = await buildPayload(pf);
      if (payload.blocks.length === 0) { setError(tLayout("validationBlocksDraft")); return; }
      if (isEditMode && articleId) {
        const status: ArticleLifecycleStatus =
          workflowStatus === "draft" ? "draft"
          : workflowStatus === "published" ? "published"
          : "scheduled";
        await updateArticle(articleId, { ...editPatchFromPayload(payload), status });
        await saveDirtySiblings(payload, articleId);
        notifySuccessAndLeave(tLayout("successChangesSaved"), destinationAfterSave());
        return;
      }
      const res = await createArticle(payload);
      const id = getArticleIdFromCreateResponse(res);
      await saveDirtySiblings(payload, translationOf ?? id);
      notifySuccessAndLeave(tLayout("successDraftSaved"), destinationAfterSave());
    } catch (e) {
      setError(translateErr(e));
    } finally {
      if (!pendingDelayedNavRef.current) setBusy(false);
    }
  }, [
    getPrimaryForm, category, buildPayload, notifySuccessAndLeave, destinationAfterSave,
    isEditMode, articleId, workflowStatus, tLayout, translateErr,
    saveDirtySiblings, translationOf,
  ]);

  const handlePublish = useCallback(async () => {
    if (workflowStatus !== "published" && workflowStatus !== "scheduled") return;
    const pf = getPrimaryForm();
    if (!pf.title.trim()) { setError(tLayout("validationTitle")); return; }
    if (!category.trim()) { setError(tLayout("validationCategory")); return; }
    setError(null);
    setBusy(true);
    try {
      const payload = await buildPayload(pf);
      if (payload.blocks.length === 0) { setError(tLayout("validationBlocksPublish")); return; }
      if (isEditMode && articleId) {
        await updateArticle(articleId, editPatchFromPayload(payload));
        if (initialWasDraftRef.current || workflowStatus === "scheduled") {
          await publishArticle(articleId);
          initialWasDraftRef.current = false;
        }
        await saveDirtySiblings(payload, articleId);
        notifySuccessAndLeave(tLayout("successArticleSubmitted"), destinationAfterSave());
        return;
      }
      const res = await createArticle(payload);
      const id = getArticleIdFromCreateResponse(res);
      if (!id) { setError(tLayout("errorCreateNoIdPublish")); return; }
      await publishArticle(id);
      // Siblings stay drafts even when the original publishes — they still
      // need translating before going live.
      await saveDirtySiblings(payload, translationOf ?? id);
      notifySuccessAndLeave(tLayout("successArticleSubmitted"), destinationAfterSave());
    } catch (e) {
      setError(translateErr(e));
    } finally {
      if (!pendingDelayedNavRef.current) setBusy(false);
    }
  }, [
    workflowStatus, getPrimaryForm, category, buildPayload, notifySuccessAndLeave,
    destinationAfterSave, isEditMode, articleId, tLayout, translateErr,
    saveDirtySiblings, translationOf,
  ]);

  const handleScheduleConfirm = useCallback(
    async (iso: string) => {
      if (workflowStatus !== "published" && workflowStatus !== "scheduled") return;
      const pf = getPrimaryForm();
      if (!pf.title.trim()) { setError(tLayout("validationTitle")); setScheduleModalOpen(false); return; }
      if (!category.trim()) { setError(tLayout("validationCategory")); setScheduleModalOpen(false); return; }
      setError(null);
      setBusy(true);
      try {
        const payload = await buildPayload(pf);
        if (payload.blocks.length === 0) { setError(tLayout("validationBlocksSchedule")); setScheduleModalOpen(false); return; }
        if (isEditMode && articleId) {
          await updateArticle(articleId, { ...editPatchFromPayload(payload), status: "scheduled" });
          await scheduleArticle(articleId, iso);
          await saveDirtySiblings(payload, articleId);
          setScheduleModalOpen(false);
          notifySuccessAndLeave(tLayout("successArticleScheduled"), destinationAfterSave());
          return;
        }
        const res = await createArticle(payload);
        const id = getArticleIdFromCreateResponse(res);
        if (!id) { setError(tLayout("errorCreateNoIdSchedule")); setScheduleModalOpen(false); return; }
        await scheduleArticle(id, iso);
        await saveDirtySiblings(payload, translationOf ?? id);
        setScheduleModalOpen(false);
        notifySuccessAndLeave(tLayout("successArticleScheduled"), destinationAfterSave());
      } catch (e) {
        setError(translateErr(e));
        setScheduleModalOpen(false);
      } finally {
        if (!pendingDelayedNavRef.current) setBusy(false);
      }
    },
    [
      workflowStatus, getPrimaryForm, category, buildPayload, notifySuccessAndLeave,
      destinationAfterSave, isEditMode, articleId, tLayout, translateErr,
      saveDirtySiblings, translationOf,
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
    activeLang,
    switchLanguage,
    changePrimaryLanguage,
    tabStatus,
    isDirty,
    translationOf,
    originalTitle,
    visibility, setVisibility,
    accessLevel, setAccessLevel,
    previewBlockCount, setPreviewBlockCount,
    price, setPrice,
    currency, setCurrency,
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
    removeBlock,
    handleSaveDraft,
    handlePublish,
    handleScheduleConfirm,
    handleTranslationOfChange,
    setCoverFile,
    setCoverImage,
  };
}
