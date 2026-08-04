"use client";

/**
 * Admin editor for the public Magazine page (`/magazine`).
 *
 * Layout: three columns — section list (left), per-section editor
 * (middle), live preview of the actual public component bound to draft
 * state (right). Saving writes to the CMS section's `config` JSON;
 * publishing flips the whole page to "published".
 *
 * Hero is the only section with form fields wired in the first slice.
 * Other sections render in the list with visibility toggle only; their
 * forms come in the follow-up slice.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { formatApiError } from "@/lib/api/error-message";
import { CloudUploadIcon, EyeIcon, EyeOffIcon, RefreshCwIcon, PersonPlusIcon, GiftIcon, PenLineIcon } from "@/components/ui/icons";
// Previews render the SAME components the live /magazine page uses, so
// what an editor sees is what ships.
import { Hero } from "@/components/home/magazine-page/Hero";
import { ActionCard } from "@/components/home/magazine-page/InnerSectionCards";
import { SectionHeader } from "@/components/home/magazine-page/SectionHeader";
import { ShareStory } from "@/components/home/magazine-page/ShareStory";
import { LocaleTabs } from "@/components/dashboard/admin/translations";
import { HeroPickerModal } from "@/components/dashboard/admin/media-library/HeroPickerModal";
import { ImageFramingModal } from "@/components/dashboard/admin/media-library/ImageFramingModal";
import { resolveArticleMediaSrc } from "@/lib/content/article-media-url";
import type { ImageFraming } from "@/lib/image-framing";
import { useEnsureMagazinePage } from "@/hooks/queries/cms";
import { usePublishCmsPage, useToggleCmsSection, useUpdateCmsSection } from "@/hooks/mutations/cms";
import {
  MAGAZINE_SECTION_TYPES,
  SUPPORTED_LOCALES,
  parseHeroConfig,
  parseActionCardConfig,
  parseRailHeaderConfig,
  parseClosingCtaConfig,
  type HeroConfig,
  type HeroLocaleFields,
  type ActionCardConfig,
  type ActionCardLocaleFields,
  type RailHeaderConfig,
  type RailHeaderLocaleFields,
  type ClosingCtaConfig,
  type ClosingCtaLocaleFields,
  type MagazineLocale,
  type MagazineSectionKey,
} from "@/services/magazine-page.service";
import type { CmsSection } from "@/services/cms.service";

const RTL_LOCALES = new Set<MagazineLocale>(["ar"]);

type SectionRow = {
  key: MagazineSectionKey;
  labelKey: string;
  hasForm: boolean;
};

const SECTION_ROWS: SectionRow[] = [
  { key: "hero", labelKey: "sections.hero", hasForm: true },
  { key: "actionCardJoin", labelKey: "sections.actionCardJoin", hasForm: true },
  { key: "actionCardGift", labelKey: "sections.actionCardGift", hasForm: true },
  { key: "actionCardShare", labelKey: "sections.actionCardShare", hasForm: true },
  { key: "featuredHeader", labelKey: "sections.featuredHeader", hasForm: true },
  { key: "collectionsHeader", labelKey: "sections.collectionsHeader", hasForm: true },
  { key: "latestHeader", labelKey: "sections.latestHeader", hasForm: true },
  { key: "plansHeader", labelKey: "sections.plansHeader", hasForm: true },
  { key: "closingCta", labelKey: "sections.closingCta", hasForm: true },
];

function VisibilityToggleButton({
  visible,
  onClick,
  label,
}: {
  visible: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      aria-label={label}
      title={label}
      className={`relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-80 ${
        visible ? "text-[var(--tott-muted)]" : "text-[var(--tott-muted)] opacity-40"
      }`}
    >
      <span className="relative flex h-3.5 w-3.5 shrink-0 items-center justify-center [&_svg]:h-3.5 [&_svg]:w-3.5">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible ? (
            <motion.span
              key="eye"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 600, damping: 25 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <EyeIcon />
            </motion.span>
          ) : (
            <motion.span
              key="eyeOff"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 600, damping: 25 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <EyeOffIcon />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </motion.button>
  );
}

export function MagazinePageEditorContent() {
  const t = useTranslations("Dashboard.magazinePageEditor");
  const { data: page, isLoading } = useEnsureMagazinePage();
  const updateSection = useUpdateCmsSection();
  const toggleSection = useToggleCmsSection();
  const publishPage = usePublishCmsPage();

  const [activeSection, setActiveSection] = useState<MagazineSectionKey>("hero");

  // The active editor reports its dirty state + a save closure up
  // here so the global Publish button can save unsaved work before
  // flipping the page status. Without this users would click Publish
  // expecting it to commit their typed changes, when actually it only
  // changes the page-level status.
  const [activeDraftState, setActiveDraftState] = useState<{
    isDirty: boolean;
    save: () => Promise<void>;
  } | null>(null);

  const sectionsByKey = useMemo(() => {
    const map = new Map<MagazineSectionKey, CmsSection>();
    if (!page) return map;
    for (const row of SECTION_ROWS) {
      const found = page.sections.find((s) => s.section_type === MAGAZINE_SECTION_TYPES[row.key]);
      if (found) map.set(row.key, found);
    }
    return map;
  }, [page]);

  if (isLoading || !page) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-[var(--tott-muted)]">
        {t("loading")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{t("title")}</h1>
          <p className="mt-1 text-sm text-[var(--tott-muted)]">{t("subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          {activeDraftState?.isDirty ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--tott-dash-gold-text)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--tott-accent-gold)]" />
              {t("unsavedChanges")}
            </span>
          ) : null}
          <button
            type="button"
            onClick={async () => {
              // Save unsaved draft in the active section first so the
              // Publish click can't drop work the user typed.
              if (activeDraftState?.isDirty) {
                try {
                  await activeDraftState.save();
                } catch {
                  return; // save's own toast already surfaced the error
                }
              }
              publishPage.mutate(page.id, {
                onSuccess: () => toast.success(t("toast.published")),
                onError: (err) =>
                  toast.error(t("toast.publishError"), {
                    description: formatApiError(err, t("toast.errorBody")),
                  }),
              });
            }}
            disabled={publishPage.isPending}
            className="rounded-lg border border-[var(--tott-accent-gold)] bg-[var(--tott-accent-gold)] px-4 py-2 text-sm font-medium text-[var(--tott-on-accent)] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {publishPage.isPending
              ? t("publishing")
              : activeDraftState?.isDirty
                ? t("saveAndPublish")
                : t("publish")}
          </button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Section rail */}
        <aside>
          <h3 className="px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--tott-muted)]">
            {t("sectionsHeading")}
          </h3>
          <ul className="mt-3 flex flex-col">
            {SECTION_ROWS.map((row) => {
              const section = sectionsByKey.get(row.key);
              const isActive = activeSection === row.key;
              const visible = section?.is_visible ?? true;
              return (
                <li key={row.key} className="relative">
                  {isActive ? (
                    <span
                      aria-hidden
                      className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-[var(--tott-accent-gold)]"
                    />
                  ) : null}
                  <div
                    className={`flex items-center gap-2 rounded-md pl-3 pr-2 py-2 transition-colors ${
                      isActive ? "bg-[var(--tott-accent-gold)]/8" : "hover:bg-[var(--tott-dash-control-hover)]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveSection(row.key)}
                      className={`flex-1 truncate text-left text-[13px] font-medium ${
                        isActive ? "text-[var(--tott-dash-gold-text)]" : "text-foreground"
                      }`}
                    >
                      {t(row.labelKey)}
                    </button>
                    <VisibilityToggleButton
                      visible={visible}
                      onClick={() =>
                        section &&
                        toggleSection.mutate({
                          pageId: page.id,
                          sectionId: section.id,
                        })
                      }
                      label={visible ? t("hideSection") : t("showSection")}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Workspace — vertical stack: toolbar, form, preview */}
        <div className="min-w-0 space-y-4">
          {(() => {
            const activeRecord = sectionsByKey.get(activeSection);
            if (!activeRecord) {
              return (
                <div className="rounded-xl border border-[var(--tott-card-border)] p-12 text-center text-sm text-[var(--tott-muted)]">
                  {t("comingSoonBody")}
                </div>
              );
            }
            const save = async (configJson: string) => {
              try {
                await updateSection.mutateAsync({
                  pageId: page.id,
                  sectionId: activeRecord.id,
                  data: { config: configJson },
                });
                toast.success(t("toast.saved"));
              } catch (err) {
                toast.error(t("toast.saveError"), {
                  description: formatApiError(err, t("toast.errorBody")),
                });
                throw err;
              }
            };
            const props: EditorProps = {
              section: activeRecord,
              onSave: save,
              isSaving: updateSection.isPending,
              registerDraftState: setActiveDraftState,
            };
            switch (activeSection) {
              case "hero":
                return <HeroEditor {...props} />;
              case "actionCardJoin":
                return (
                  <ActionCardEditor
                    {...props}
                    icon={<PersonPlusIcon />}
                    defaultHref="/collectives"
                    titleKey="actionCard.title"
                    subtitleKey="actionCard.subtitle"
                  />
                );
              case "actionCardGift":
                return (
                  <ActionCardEditor
                    {...props}
                    icon={<GiftIcon />}
                    defaultHref="/subscribe"
                    titleKey="actionCard.title"
                    subtitleKey="actionCard.subtitle"
                  />
                );
              case "actionCardShare":
                return (
                  <ActionCardEditor
                    {...props}
                    icon={<PenLineIcon />}
                    defaultHref="/writing-room"
                    titleKey="actionCard.title"
                    subtitleKey="actionCard.subtitle"
                  />
                );
              case "featuredHeader":
                return <RailHeaderEditor {...props} viewMoreHref="/magazine" />;
              case "collectionsHeader":
                return <RailHeaderEditor {...props} viewMoreHref="/collections" />;
              case "latestHeader":
                return <RailHeaderEditor {...props} viewMoreHref="/magazine" />;
              case "plansHeader":
                return <RailHeaderEditor {...props} viewMoreHref="/subscribe" />;
              case "closingCta":
                return <ClosingCtaEditor {...props} />;
              default:
                return null;
            }
          })()}
        </div>
      </div>
    </div>
  );
}

// ─── Hero editor (form + live preview) ─────────────────────────────

type EditorProps = {
  section: CmsSection;
  onSave: (configJson: string) => Promise<void>;
  isSaving: boolean;
  /** Reports the active editor's dirty + save closure to the parent so
   * the global Publish button can save unsaved work first. */
  registerDraftState: (state: { isDirty: boolean; save: () => Promise<void> } | null) => void;
};

function HeroEditor({ section, onSave, isSaving, registerDraftState }: EditorProps) {
  const t = useTranslations("Dashboard.magazinePageEditor.hero");

  const {
    draft,
    setDraft,
    activeLocale,
    setActiveLocale,
    localeFields,
    setLocaleField,
    isDirty,
    reset,
  } = useLocalizedDraft<HeroLocaleFields, HeroConfig>(section, parseHeroConfig);
  useRegisterDraftState(registerDraftState, isDirty, draft, onSave);

  const isRtl = RTL_LOCALES.has(activeLocale);

  return (
    <>
      <EditorToolbar
        title={t("title")}
        subtitle={t("subtitle")}
        activeLocale={activeLocale}
        onLocaleChange={setActiveLocale}
        isDirty={isDirty}
        isSaving={isSaving}
        onReset={reset}
        onSave={() => onSave(JSON.stringify(draft))}
      />

      <FormCard>
        <div className="space-y-6">
          <div className="rounded-lg border border-dashed border-[var(--tott-status-amber)]/50 bg-[var(--tott-dash-surface-inset)] p-3 text-xs text-[var(--tott-muted)]">
            {t("issueWinsNote")}
          </div>
          <FieldGroup label={t("perLocaleHeading")}>
            <Field label={t("fields.headline")}>
              <TextInput
                value={localeFields.title ?? ""}
                onChange={(v) => setLocaleField("title", v)}
                placeholder={t("fields.headlinePlaceholder")}
                rtl={isRtl}
              />
            </Field>
            <FontSizeSlider
              label={t("fields.titleFontSize")}
              value={draft.titleFontSize}
              defaultPx={40}
              onChange={(v) => setDraft((prev) => ({ ...prev, titleFontSize: v }))}
            />
            <Field label={t("fields.standfirst")}>
              <TextInput
                value={localeFields.standfirst ?? ""}
                onChange={(v) => setLocaleField("standfirst", v)}
                placeholder={t("fields.standfirstPlaceholder")}
                rtl={isRtl}
              />
            </Field>
            <Field label={t("fields.ctaLabel")}>
              <TextInput
                value={localeFields.ctaLabel ?? ""}
                onChange={(v) => setLocaleField("ctaLabel", v)}
                placeholder={t("fields.ctaLabelPlaceholder")}
                rtl={isRtl}
              />
            </Field>
          </FieldGroup>

          <FieldGroup label={t("sharedHeading")}>
            <ImageUrlField
              label={t("fields.artworkUrl")}
              value={draft.artwork ?? ""}
              onChange={(v) => setDraft((prev) => ({ ...prev, artwork: v || undefined }))}
              placeholder="/images/home/magazine-thumbnail.svg"
              hint={t("fields.artworkUrlHint")}
              framing={draft.artworkFraming}
              onFramingChange={(f) =>
                setDraft((prev) => ({ ...prev, artworkFraming: f }))
              }
              frameAspect="16/9"
            />
          </FieldGroup>
        </div>
      </FormCard>

      <PreviewFrame locale={activeLocale}>
        <Hero
          eyebrow={undefined}
          title={localeFields.title?.trim() || t("fields.headlinePlaceholder")}
          standfirst={localeFields.standfirst?.trim() || ""}
          readCtaLabel={localeFields.ctaLabel?.trim() || t("fields.ctaLabelPlaceholder")}
          readCtaHref={null}
          noIssueLabel=""
          backgroundImage={draft.artwork || "/images/image.png"}
          backgroundFraming={draft.artworkFraming}
          issueLabel={null}
          slides={[]}
          carouselPrevLabel=""
          carouselNextLabel=""
          isRtl={isRtl}
          titleFontSize={draft.titleFontSize}
        />
      </PreviewFrame>
    </>
  );
}

// ─── Action card editor (generic — used for Join/Gift/Share) ──────

function ActionCardEditor({
  section,
  onSave,
  isSaving,
  registerDraftState,
  icon,
  defaultHref,
  titleKey,
  subtitleKey,
}: EditorProps & {
  icon: React.ReactNode;
  defaultHref: string;
  titleKey: string;
  subtitleKey: string;
}) {
  const t = useTranslations(`Dashboard.magazinePageEditor.${titleKey.split(".")[0]}`);
  const tShared = useTranslations("Dashboard.magazinePageEditor.hero");
  const {
    draft,
    setDraft,
    activeLocale,
    setActiveLocale,
    localeFields,
    setLocaleField,
    isDirty,
    reset,
  } = useLocalizedDraft<ActionCardLocaleFields, ActionCardConfig>(section, parseActionCardConfig);
  useRegisterDraftState(registerDraftState, isDirty, draft, onSave);
  const isRtl = RTL_LOCALES.has(activeLocale);

  return (
    <>
      <EditorToolbar
        title={t(titleKey.split(".")[1])}
        subtitle={t(subtitleKey.split(".")[1])}
        activeLocale={activeLocale}
        onLocaleChange={setActiveLocale}
        isDirty={isDirty}
        isSaving={isSaving}
        onReset={reset}
        onSave={() => onSave(JSON.stringify(draft))}
      />

      <FormCard>
        <div className="space-y-6">
          <FieldGroup label={tShared("perLocaleHeading")}>
            <Field label={t("fields.title")}>
              <TextInput
                value={localeFields.title ?? ""}
                onChange={(v) => setLocaleField("title", v)}
                rtl={isRtl}
              />
            </Field>
            <FontSizeSlider
              label={tShared("fields.titleFontSize")}
              value={draft.titleFontSize}
              defaultPx={16}
              onChange={(v) => setDraft((prev) => ({ ...prev, titleFontSize: v }))}
            />
            <Field label={t("fields.body")}>
              <TextInput
                value={localeFields.body ?? ""}
                onChange={(v) => setLocaleField("body", v)}
                rtl={isRtl}
              />
            </Field>
            <Field label={t("fields.ctaLabel")}>
              <TextInput
                value={localeFields.ctaLabel ?? ""}
                onChange={(v) => setLocaleField("ctaLabel", v)}
                rtl={isRtl}
              />
            </Field>
          </FieldGroup>
          <FieldGroup label={tShared("sharedHeading")}>
            <Field label={t("fields.ctaHref")}>
              <TextInput
                value={draft.ctaHref ?? ""}
                onChange={(v) => setDraft((prev) => ({ ...prev, ctaHref: v || undefined }))}
                placeholder={defaultHref}
              />
            </Field>
          </FieldGroup>
        </div>
      </FormCard>

      <PreviewFrame locale={activeLocale}>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 py-16 sm:px-10 md:grid-cols-3">
          <ActionCard
            icon={icon}
            title={localeFields.title?.trim() || t("fields.title")}
            body={localeFields.body?.trim() || ""}
            ctaLabel={localeFields.ctaLabel?.trim() || t("fields.ctaLabel")}
            ctaHref={draft.ctaHref || defaultHref}
            titleFontSize={draft.titleFontSize}
          />
        </div>
      </PreviewFrame>
    </>
  );
}

// ─── Rail header editor (generic — used for Featured/Collections/Latest/Plans) ──

function RailHeaderEditor({
  section,
  onSave,
  isSaving,
  registerDraftState,
  viewMoreHref,
}: EditorProps & { viewMoreHref: string }) {
  const t = useTranslations("Dashboard.magazinePageEditor.railHeader");
  const {
    draft,
    setDraft,
    activeLocale,
    setActiveLocale,
    localeFields,
    setLocaleField,
    isDirty,
    reset,
  } = useLocalizedDraft<RailHeaderLocaleFields, RailHeaderConfig>(section, parseRailHeaderConfig);
  useRegisterDraftState(registerDraftState, isDirty, draft, onSave);
  const isRtl = RTL_LOCALES.has(activeLocale);

  return (
    <>
      <EditorToolbar
        title={t("title")}
        subtitle={t("subtitle")}
        activeLocale={activeLocale}
        onLocaleChange={setActiveLocale}
        isDirty={isDirty}
        isSaving={isSaving}
        onReset={reset}
        onSave={() => onSave(JSON.stringify(draft))}
      />

      <FormCard>
        <FieldGroup label={t("perLocaleHeading")}>
          <Field label={t("fields.title")}>
            <TextInput
              value={localeFields.title ?? ""}
              onChange={(v) => setLocaleField("title", v)}
              rtl={isRtl}
            />
          </Field>
          <FontSizeSlider
            label={t("fields.titleFontSize")}
            value={draft.titleFontSize}
            defaultPx={24}
            onChange={(v) => setDraft((prev) => ({ ...prev, titleFontSize: v }))}
          />
          <Field label={t("fields.standfirst")}>
            <TextInput
              value={localeFields.standfirst ?? ""}
              onChange={(v) => setLocaleField("standfirst", v)}
              rtl={isRtl}
            />
          </Field>
        </FieldGroup>
      </FormCard>

      <PreviewFrame locale={activeLocale}>
        <div className="py-8">
          <SectionHeader
            id="preview-heading"
            title={localeFields.title?.trim() || t("fields.title")}
            standfirst={localeFields.standfirst?.trim() || ""}
            viewMoreLabel={t("viewMoreLabel")}
            viewMoreHref={viewMoreHref}
            titleFontSize={draft.titleFontSize}
          />
        </div>
      </PreviewFrame>
    </>
  );
}

// ─── Closing CTA editor ────────────────────────────────────────────

function ClosingCtaEditor({ section, onSave, isSaving, registerDraftState }: EditorProps) {
  const t = useTranslations("Dashboard.magazinePageEditor.closingCta");
  const tShared = useTranslations("Dashboard.magazinePageEditor.hero");
  const {
    draft,
    setDraft,
    activeLocale,
    setActiveLocale,
    localeFields,
    setLocaleField,
    isDirty,
    reset,
  } = useLocalizedDraft<ClosingCtaLocaleFields, ClosingCtaConfig>(section, parseClosingCtaConfig);
  useRegisterDraftState(registerDraftState, isDirty, draft, onSave);
  const isRtl = RTL_LOCALES.has(activeLocale);

  return (
    <>
      <EditorToolbar
        title={t("title")}
        subtitle={t("subtitle")}
        activeLocale={activeLocale}
        onLocaleChange={setActiveLocale}
        isDirty={isDirty}
        isSaving={isSaving}
        onReset={reset}
        onSave={() => onSave(JSON.stringify(draft))}
      />

      <FormCard>
        <div className="space-y-6">
          <FieldGroup label={tShared("perLocaleHeading")}>
            <Field label={t("fields.heading")}>
              <TextInput
                value={localeFields.heading ?? ""}
                onChange={(v) => setLocaleField("heading", v)}
                rtl={isRtl}
              />
            </Field>
            <FontSizeSlider
              label={tShared("fields.titleFontSize")}
              value={draft.titleFontSize}
              defaultPx={36}
              onChange={(v) => setDraft((prev) => ({ ...prev, titleFontSize: v }))}
            />
            <Field label={t("fields.standfirst")}>
              <TextInput
                value={localeFields.standfirst ?? ""}
                onChange={(v) => setLocaleField("standfirst", v)}
                rtl={isRtl}
              />
            </Field>
            <Field label={t("fields.ctaLabel")}>
              <TextInput
                value={localeFields.ctaLabel ?? ""}
                onChange={(v) => setLocaleField("ctaLabel", v)}
                rtl={isRtl}
              />
            </Field>
          </FieldGroup>
          <FieldGroup label={tShared("sharedHeading")}>
            <Field label={t("fields.ctaHref")}>
              <TextInput
                value={draft.ctaHref ?? ""}
                onChange={(v) => setDraft((prev) => ({ ...prev, ctaHref: v || undefined }))}
                placeholder="/writing-room"
              />
            </Field>
          </FieldGroup>
        </div>
      </FormCard>

      <PreviewFrame locale={activeLocale}>
        <ShareStory
          icon={<PenLineIcon />}
          heading={localeFields.heading?.trim() || t("fields.heading")}
          standfirst={localeFields.standfirst?.trim() || ""}
          ctaLabel={localeFields.ctaLabel?.trim() || t("fields.ctaLabel")}
          ctaHref={draft.ctaHref || "/writing-room"}
          titleFontSize={draft.titleFontSize}
        />
      </PreviewFrame>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-[var(--tott-muted)]">{label}</label>
      {children}
    </div>
  );
}

/**
 * Image URL field with a Media Library picker beside it. The picker
 * (HeroPickerModal) already carries both a library tab and an upload tab, so
 * an admin never has to leave the editor to paste a URL by hand — the field
 * stays editable for external URLs. `onPick` hands back a storage key, which
 * resolveArticleMediaSrc turns into the public URL the page will render.
 */
function ImageUrlField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  framing,
  onFramingChange,
  frameAspect = "16/9",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  /** Framing controls appear only when `onFramingChange` is supplied, so
   * fields that have nowhere to store framing are unaffected. */
  framing?: ImageFraming;
  onFramingChange?: (f: ImageFraming | undefined) => void;
  /** Aspect ratio of the live frame, so the adjust preview is honest. */
  frameAspect?: string;
}) {
  const tMedia = useTranslations("Dashboard.mediaLibrary.heroes");
  const tFraming = useTranslations("Dashboard.imageFraming");
  // null = closed; otherwise the tab the modal opens on, so "Upload" lands on
  // the upload tab instead of making admins hunt for it behind the library.
  const [picker, setPicker] = useState<"library" | "upload" | null>(null);
  const [framingOpen, setFramingOpen] = useState(false);

  // A crop tuned for one photo is meaningless on another, so swapping the
  // image drops its framing rather than silently re-applying it.
  const changeImage = (next: string) => {
    if (next !== value) onFramingChange?.(undefined);
    onChange(next);
  };

  const buttonClass =
    "shrink-0 whitespace-nowrap rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-[var(--tott-accent-gold)]/60 hover:text-[var(--tott-accent-gold)]";

  return (
    <Field label={label}>
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-[12rem] flex-1">
          <TextInput type="url" value={value} onChange={changeImage} placeholder={placeholder} />
        </div>
        <button type="button" onClick={() => setPicker("library")} className={buttonClass}>
          {tMedia("pickFromLibrary")}
        </button>
        <button
          type="button"
          onClick={() => setPicker("upload")}
          className={`${buttonClass} inline-flex items-center gap-1.5 [&_svg]:h-3.5 [&_svg]:w-3.5`}
        >
          <CloudUploadIcon />
          {tMedia("uploadNew")}
        </button>
        {onFramingChange && value ? (
          <button
            type="button"
            onClick={() => setFramingOpen(true)}
            className={framing ? `${buttonClass} !border-[var(--tott-accent-gold)] !text-[var(--tott-accent-gold)]` : buttonClass}
          >
            {tFraming("adjust")}
          </button>
        ) : null}
      </div>
      {hint ? <p className="mt-1 text-xs text-[var(--tott-muted)]">{hint}</p> : null}
      <HeroPickerModal
        open={picker !== null}
        initialMode={picker ?? "library"}
        onClose={() => setPicker(null)}
        title={label}
        onPick={(storageKey) => changeImage(resolveArticleMediaSrc(storageKey))}
      />
      {onFramingChange ? (
        <ImageFramingModal
          open={framingOpen}
          src={value}
          framing={framing}
          aspect={frameAspect}
          onClose={() => setFramingOpen(false)}
          onApply={onFramingChange}
        />
      ) : null}
    </Field>
  );
}

const INPUT_CLASS =
  "w-full rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--tott-muted)] focus:border-[var(--tott-accent-gold)]/60 focus:outline-none focus:ring-1 focus:ring-[var(--tott-accent-gold)]/30 transition";

/** Title font-size (px) control — slider + stepper, live value shown next
 * to the label. `defaultPx` is the component's own unstyled size (used as
 * the slider's starting position and shown as "(default)" until the admin
 * moves it). Sits directly under the field it resizes, not buried in a
 * shared group, so the effect of dragging is obvious from the label above. */
function FontSizeSlider({
  label,
  value,
  defaultPx,
  onChange,
}: {
  label: string;
  value: number | undefined;
  defaultPx: number;
  onChange: (v: number | undefined) => void;
}) {
  const shown = value ?? defaultPx;
  const step = (delta: number) =>
    onChange(Math.min(120, Math.max(10, shown + delta)));
  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => step(-1)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--tott-card-border)] text-sm text-foreground transition-colors hover:border-[var(--tott-accent-gold)]/60 hover:text-[var(--tott-accent-gold)]"
        >
          −
        </button>
        <input
          type="range"
          min={10}
          max={120}
          value={shown}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-1.5 flex-1 accent-[var(--tott-accent-gold)]"
        />
        <button
          type="button"
          onClick={() => step(1)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[var(--tott-card-border)] text-sm text-foreground transition-colors hover:border-[var(--tott-accent-gold)]/60 hover:text-[var(--tott-accent-gold)]"
        >
          +
        </button>
        <span className="w-16 shrink-0 text-end text-xs tabular-nums text-[var(--tott-muted)]">
          {shown}px{value === undefined ? " (default)" : ""}
        </span>
        {value !== undefined ? (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="shrink-0 text-xs text-[var(--tott-muted)] underline underline-offset-2 hover:text-foreground"
          >
            reset
          </button>
        ) : null}
      </div>
    </Field>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  rtl,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rtl?: boolean;
  type?: "text" | "url";
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      dir={rtl ? "rtl" : "ltr"}
      className={INPUT_CLASS}
    />
  );
}

// ─── Shared editor toolbar (sticky bar with title, locale, actions) ──

const PREVIEW_DESIGN_WIDTH = 1392;

function EditorToolbar({
  title,
  subtitle,
  activeLocale,
  onLocaleChange,
  isDirty,
  isSaving,
  onReset,
  onSave,
}: {
  title: string;
  subtitle: string;
  activeLocale: MagazineLocale;
  onLocaleChange: (l: MagazineLocale) => void;
  isDirty: boolean;
  isSaving: boolean;
  onReset: () => void;
  onSave: () => void;
}) {
  const t = useTranslations("Dashboard.magazinePageEditor.hero");
  return (
    <div className="sticky top-2 z-20 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] p-4 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-foreground">{title}</h3>
          <p className="mt-0.5 truncate text-xs text-[var(--tott-muted)]">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <LocaleTabs
            locales={SUPPORTED_LOCALES}
            active={activeLocale}
            onChange={onLocaleChange}
          />
          <span className="mx-1 h-5 w-px bg-[var(--tott-card-border)]" />
          <button
            type="button"
            onClick={onReset}
            disabled={!isDirty}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-[var(--tott-muted)] transition-colors hover:bg-[var(--tott-dash-surface-inset)] hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <span className="[&_svg]:h-3.5 [&_svg]:w-3.5">
              <RefreshCwIcon />
            </span>
            {t("reset")}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={!isDirty || isSaving}
            className="rounded-md bg-[var(--tott-accent-gold)] px-4 py-1.5 text-xs font-semibold text-[var(--tott-on-accent)] transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            {isSaving ? t("saving") : t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Preview frame — non-interactive desktop-browser mockup that shows
 * the real public component scaled to the workspace width.
 *
 * Width and content height are both measured live with a
 * ResizeObserver — no fixed `naturalHeight` guess. The outer mockup
 * width drives the scale (= containerWidth / 1392), and the scaled
 * body height = measuredContentHeight × scale so the entire component
 * is always visible regardless of how much copy admins type.
 */
function PreviewFrame({ locale, children }: { locale: MagazineLocale; children: React.ReactNode }) {
  const t = useTranslations("Dashboard.magazinePageEditor.hero");
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);
  const [bodyHeight, setBodyHeight] = useState(0);

  useEffect(() => {
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frame || !content) return;
    const measure = () => {
      const containerWidth = frame.clientWidth;
      const contentHeight = content.scrollHeight;
      const s = containerWidth / PREVIEW_DESIGN_WIDTH;
      setScale(s);
      setBodyHeight(contentHeight * s);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(frame);
    ro.observe(content);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex w-full flex-col gap-2 py-2">
      <div className="flex w-full items-center justify-between px-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--tott-muted)]">
          {t("previewHeading")}
        </span>
        <span className="rounded-full border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--tott-muted)]">
          {locale}
        </span>
      </div>

      {/* The whole mockup is dir="ltr", including under an Arabic admin UI.
          The scaled box is a fixed 1392px wide inside a frame of width W < 1392.
          An RTL parent aligns that box's RIGHT edge to the frame and lets it
          overflow leftward; `transform-origin: top left` then scales it about
          that off-frame edge, leaving only (2W - 1392) of the preview visible
          with a dead gutter on the right. Keeping the frame LTR makes the box
          start at x=0 so `scale(W/1392)` maps it exactly onto the frame.
          Locale direction is applied to the previewed content instead — see
          the inner wrapper below. It also keeps the browser chrome (traffic
          lights, then the URL) looking like a real browser in both UI locales. */}
      <div
        ref={frameRef}
        dir="ltr"
        className="w-full overflow-hidden rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] shadow-lg"
      >
        <div className="flex items-center gap-1.5 border-b border-[var(--tott-card-border)] bg-[var(--tott-elevated)] px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]/70" />
          <span className="ms-3 truncate rounded bg-[var(--tott-dash-input-bg)] px-2 py-0.5 text-[10px] font-mono text-[var(--tott-muted)]">
            /magazine
          </span>
        </div>

        <div
          className="relative"
          style={{
            backgroundColor: "var(--tott-home-surface)",
            height: bodyHeight,
          }}
        >
          <div
            ref={contentRef}
            aria-hidden
            style={{
              width: PREVIEW_DESIGN_WIDTH,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              userSelect: "none",
            }}
          >
            {/* Direction of the previewed page itself — the locale being
                edited, not the admin's own UI locale. */}
            <div dir={RTL_LOCALES.has(locale) ? "rtl" : "ltr"}>{children}</div>
          </div>
          {/* Click shield — sits above the scaled component and
              swallows every click/tap/focus, so links and buttons
              inside the preview can't navigate even when the public
              component sets pointer-events:auto on its own children. */}
          <div
            aria-hidden
            className="absolute inset-0 z-10"
            style={{ cursor: "default" }}
            onClickCapture={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseDownCapture={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchStartCapture={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Form card wrapper ─────────────────────────────────────────────

function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] p-6">
      {children}
    </div>
  );
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--tott-muted)]">
        {label}
      </p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

/**
 * Effect that publishes the current editor's dirty flag + save closure
 * up to the parent, so the global Publish button can flush unsaved
 * work before flipping the page status. Clears the registration on
 * unmount so navigating away leaves no stale closure behind.
 */
function useRegisterDraftState(
  register: EditorProps["registerDraftState"],
  isDirty: boolean,
  draft: unknown,
  onSave: (configJson: string) => Promise<void>
) {
  // Latest values held in refs so the registered save closure always
  // sees the current draft without re-registering on every keystroke.
  // React 19's refs rule disallows mutation during render, so we
  // assign inside effects.
  const draftRef = useRef(draft);
  const onSaveRef = useRef(onSave);
  useEffect(() => {
    draftRef.current = draft;
  });
  useEffect(() => {
    onSaveRef.current = onSave;
  });

  useEffect(() => {
    register({
      isDirty,
      save: () => onSaveRef.current(JSON.stringify(draftRef.current)),
    });
    return () => register(null);
  }, [register, isDirty]);
}

// ─── Generic locale-keyed editor hook ──────────────────────────────

function useLocalizedDraft<T extends object, C extends { copy: Record<string, T> }>(
  section: CmsSection,
  parse: (s: CmsSection) => C
) {
  const initial = useMemo(() => parse(section), [parse, section]);
  const [draft, setDraft] = useState<C>(initial);
  const [activeLocale, setActiveLocale] = useState<MagazineLocale>("en");

  const initialKey = JSON.stringify(initial);
  const [seedKey, setSeedKey] = useState(initialKey);
  if (seedKey !== initialKey) {
    setSeedKey(initialKey);
    setDraft(initial);
  }

  const localeFields = (draft.copy[activeLocale] ?? ({} as T)) as T;

  const setLocaleField = <K extends keyof T>(key: K, value: T[K]) => {
    setDraft(
      (prev) =>
        ({
          ...prev,
          copy: {
            ...prev.copy,
            [activeLocale]: { ...(prev.copy[activeLocale] ?? {}), [key]: value },
          },
        }) as C
    );
  };

  const isDirty = JSON.stringify(draft) !== JSON.stringify(initial);
  const reset = () => setDraft(initial);

  return {
    draft,
    setDraft,
    activeLocale,
    setActiveLocale,
    localeFields,
    setLocaleField,
    isDirty,
    reset,
    initial,
  };
}
