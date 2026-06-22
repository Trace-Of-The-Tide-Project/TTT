"use client";

import { createPortal } from "react-dom";
import { Link } from "@/i18n/navigation";
import { AvailableBlocks } from "@/components/dashboard/admin/articles/articles-editor/AvailableBlocks";
import { EditorToolbar } from "@/components/dashboard/admin/articles/articles-editor/EditorToolbar";
import { EditorRegistryProvider } from "@/components/dashboard/admin/articles/articles-editor/lib/editor-registry";
import { ContentBlocks } from "@/components/dashboard/admin/articles/articles-editor/ContentBlocks";
import { ContentSettings } from "@/components/dashboard/admin/articles/articles-editor/ArticleSettings";
import { ContentEditorFooter } from "@/components/dashboard/admin/articles/articles-editor/ContentEditorFooter";
import { ScheduleArticleModal } from "@/components/dashboard/admin/articles/articles-editor/modals/ScheduleArticleModal";
import { TranslationsPanel } from "@/components/dashboard/admin/translations/TranslationsPanel";
import { previewHrefForContentType } from "@/lib/content/public-article-preview-href";
import {
  useArticleEditor,
  type ContentEditorLayoutProps,
} from "./hooks/useArticleEditor";

export type { ContentEditorLayoutProps };

const ADMIN_ARTICLES_PATH = "/admin/articles";

const titleClass =
  "w-full border-0 bg-transparent px-0 py-2 text-lg text-foreground placeholder:text-foreground outline-none";

export function ContentEditorLayout(props: ContentEditorLayoutProps) {
  const {
    t, tLayout, isEditMode, localizedConfig, localizedMainMedia, config,
    articleLoading, loadError,
    title, setTitle,
    blocks,
    workflowStatus, setWorkflowStatus,
    scheduledAt,
    category, setCategory,
    language, setLanguage,
    translationOf, originalTitle,
    visibility, setVisibility,
    seoTitle, setSeoTitle,
    metaDescription, setMetaDescription,
    collectionId, setCollectionId,
    tagIds, setTagIds,
    coverImage,
    scheduleModalOpen, setScheduleModalOpen,
    busy, error,
    loadKey, setLoadKey,
    portalReady,
    mediaUploading,
    successToast, toastEntered,
    addBlock, addCoverBlock, reorderBlocks, updateBlock,
    handleSaveDraft, handlePublish, handleScheduleConfirm, handleTranslationOfChange,
    setCoverFile, setCoverImage,
  } = useArticleEditor(props);

  const { articleId } = props;

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

  if (!isEditMode && !props.config) {
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
    <EditorRegistryProvider>
      <div className="flex min-h-0 flex-col">
        {uploadOverlay}
        {successToastPortal}
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

        {isEditMode && articleId ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--tott-card-border)] pb-4 shrink-0">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Link href={ADMIN_ARTICLES_PATH} className="text-[#C9A96E] hover:underline">
                {tLayout("backToArticles")}
              </Link>
              <span className="text-gray-500">{tLayout("editArticle")}</span>
            </div>
            <div className="flex items-center gap-3">
              <TranslationsPanel
                contentType="article"
                contentId={articleId}
                currentLanguage={language}
                createBasePath={`/admin/articles/create/${config.contentType}`}
              />
              <Link
                href={previewHrefForContentType(config.contentType, articleId)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-[#C9A96E]/50 hover:bg-[#252525]"
              >
                {tLayout("preview")}
              </Link>
            </div>
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
          </div>

          <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-64 lg:overflow-y-auto">
            <AvailableBlocks
              onAddBlock={addBlock}
              allowedBlockTypes={config.allowedBlockTypes}
              imageBlockLabel={
                config.disableHero
                  ? undefined
                  : config.contentType === "video" || config.contentType === "audio"
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
              translationOf={translationOf}
              onTranslationOfChange={handleTranslationOfChange}
              excludeId={articleId}
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
              coverImage={coverImage}
              onCoverFileSelect={(file) => {
                setCoverFile(file);
                setCoverImage(URL.createObjectURL(file));
              }}
              onCoverRemove={() => {
                setCoverFile(null);
                setCoverImage(null);
              }}
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
    </EditorRegistryProvider>
  );
}
