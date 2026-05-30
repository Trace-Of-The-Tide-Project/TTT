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
import {
  EyeIcon,
  RefreshCwIcon,
} from "@/components/ui/icons";
import { MagazineHero } from "@/components/home/magazine/MagazineHero";
import { MagazineManifesto } from "@/components/home/magazine/MagazineManifesto";
import {
  MagazineEditorialBoard,
} from "@/components/home/magazine/MagazineEditorialBoard";
import { MagazineNewsletter } from "@/components/home/magazine/MagazineNewsletter";
import { MagazineSupport } from "@/components/home/magazine/MagazineSupport";
import {
  useEnsureMagazinePage,
} from "@/hooks/queries/cms";
import {
  usePublishCmsPage,
  useToggleCmsSection,
  useUpdateCmsSection,
} from "@/hooks/mutations/cms";
import {
  MAGAZINE_SECTION_TYPES,
  SUPPORTED_LOCALES,
  parseHeroConfig,
  parseManifestoConfig,
  parseFounderConfig,
  parseNewsletterConfig,
  parseSupportConfig,
  type HeroConfig,
  type HeroLocaleFields,
  type ManifestoConfig,
  type ManifestoLocaleFields,
  type FounderQuoteConfig,
  type FounderQuoteLocaleFields,
  type NewsletterCopyConfig,
  type NewsletterCopyLocaleFields,
  type SupportConfig,
  type SupportLocaleFields,
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
  { key: "manifesto", labelKey: "sections.manifesto", hasForm: true },
  { key: "founderQuote", labelKey: "sections.founderQuote", hasForm: true },
  {
    key: "newsletterCopy",
    labelKey: "sections.newsletterCopy",
    hasForm: true,
  },
  {
    key: "supportCuration",
    labelKey: "sections.supportCuration",
    hasForm: true,
  },
];

export function MagazinePageEditorContent() {
  const t = useTranslations("Dashboard.magazinePageEditor");
  const { data: page, isLoading } = useEnsureMagazinePage();
  const updateSection = useUpdateCmsSection();
  const toggleSection = useToggleCmsSection();
  const publishPage = usePublishCmsPage();

  const [activeSection, setActiveSection] =
    useState<MagazineSectionKey>("hero");

  const sectionsByKey = useMemo(() => {
    const map = new Map<MagazineSectionKey, CmsSection>();
    if (!page) return map;
    for (const row of SECTION_ROWS) {
      const found = page.sections.find(
        (s) => s.section_type === MAGAZINE_SECTION_TYPES[row.key],
      );
      if (found) map.set(row.key, found);
    }
    return map;
  }, [page]);

  if (isLoading || !page) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-500">
        {t("loading")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-gray-500">{t("subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => publishPage.mutate(page.id)}
          disabled={publishPage.isPending}
          className="rounded-lg border border-[#C9A96E] bg-[#C9A96E] px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {publishPage.isPending ? t("publishing") : t("publish")}
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        {/* Section rail */}
        <aside>
          <h3 className="px-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">
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
                      className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-[#C9A96E]"
                    />
                  ) : null}
                  <div
                    className={`flex items-center gap-2 rounded-md pl-3 pr-2 py-2 transition-colors ${
                      isActive
                        ? "bg-[#C9A96E]/8"
                        : "hover:bg-[var(--tott-dash-control-hover)]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveSection(row.key)}
                      className={`flex-1 truncate text-left text-[13px] font-medium ${
                        isActive ? "text-[#C9A96E]" : "text-foreground"
                      }`}
                    >
                      {t(row.labelKey)}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        section &&
                        toggleSection.mutate({
                          pageId: page.id,
                          sectionId: section.id,
                        })
                      }
                      aria-label={
                        visible ? t("hideSection") : t("showSection")
                      }
                      className={`shrink-0 rounded p-1 transition-opacity hover:opacity-80 ${
                        visible ? "text-gray-400" : "text-gray-600 opacity-40"
                      }`}
                    >
                      <span className="[&_svg]:h-3.5 [&_svg]:w-3.5">
                        <EyeIcon />
                      </span>
                    </button>
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
                <div className="rounded-xl border border-[var(--tott-card-border)] p-12 text-center text-sm text-gray-500">
                  {t("comingSoonBody")}
                </div>
              );
            }
            const save = (configJson: string) =>
              updateSection.mutate({
                pageId: page.id,
                sectionId: activeRecord.id,
                data: { config: configJson },
              });
            const props = {
              section: activeRecord,
              onSave: save,
              isSaving: updateSection.isPending,
            };
            switch (activeSection) {
              case "hero":
                return <HeroEditor {...props} />;
              case "manifesto":
                return <ManifestoEditor {...props} />;
              case "founderQuote":
                return <FounderQuoteEditor {...props} />;
              case "newsletterCopy":
                return <NewsletterCopyEditor {...props} />;
              case "supportCuration":
                return <SupportEditor {...props} />;
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
  onSave: (configJson: string) => void;
  isSaving: boolean;
};

function HeroEditor({ section, onSave, isSaving }: EditorProps) {
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

  const isRtl = RTL_LOCALES.has(activeLocale);
  const setSharedField = (
    key: "artwork" | "primaryHref" | "secondaryHref",
    value: string,
  ) => setDraft((prev) => ({ ...prev, [key]: value || undefined }));

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
          <FieldGroup label={t("perLocaleHeading")}>
            <Field label={t("fields.headline")}>
              <TextInput
                value={localeFields.title ?? ""}
                onChange={(v) => setLocaleField("title", v)}
                placeholder={t("fields.headlinePlaceholder")}
                rtl={isRtl}
              />
            </Field>
            <Field label={t("fields.subheadline")}>
              <TextArea
                rows={3}
                value={localeFields.subtitle ?? ""}
                onChange={(v) => setLocaleField("subtitle", v)}
                placeholder={t("fields.subheadlinePlaceholder")}
                rtl={isRtl}
              />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label={t("fields.primaryCta")}>
                <TextInput
                  value={localeFields.primaryCtaLabel ?? ""}
                  onChange={(v) => setLocaleField("primaryCtaLabel", v)}
                  placeholder={t("fields.primaryCtaPlaceholder")}
                  rtl={isRtl}
                />
              </Field>
              <Field label={t("fields.secondaryCta")}>
                <TextInput
                  value={localeFields.secondaryCtaLabel ?? ""}
                  onChange={(v) => setLocaleField("secondaryCtaLabel", v)}
                  placeholder={t("fields.secondaryCtaPlaceholder")}
                  rtl={isRtl}
                />
              </Field>
            </div>
          </FieldGroup>

          <FieldGroup label={t("sharedHeading")}>
            <Field label={t("fields.artworkUrl")}>
              <TextInput
                value={draft.artwork ?? ""}
                onChange={(v) => setSharedField("artwork", v)}
                placeholder="/images/home/magazine-thumbnail.svg"
              />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label={t("fields.primaryHref")}>
                <TextInput
                  value={draft.primaryHref ?? ""}
                  onChange={(v) => setSharedField("primaryHref", v)}
                  placeholder="/magazine#magazine-content"
                />
              </Field>
              <Field label={t("fields.secondaryHref")}>
                <TextInput
                  value={draft.secondaryHref ?? ""}
                  onChange={(v) => setSharedField("secondaryHref", v)}
                  placeholder="/magazine#newsletter-heading"
                />
              </Field>
            </div>
          </FieldGroup>
        </div>
      </FormCard>

      <PreviewFrame locale={activeLocale}>
        <MagazineHero
          artwork={draft.artwork || undefined}
          title={localeFields.title}
          subtitle={localeFields.subtitle}
          primaryCtaLabel={localeFields.primaryCtaLabel}
          secondaryCtaLabel={localeFields.secondaryCtaLabel}
          primaryHref={draft.primaryHref || "/magazine#magazine-content"}
          secondaryHref={draft.secondaryHref || "/magazine#newsletter-heading"}
        />
      </PreviewFrame>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-400">
        {label}
      </label>
      {children}
    </div>
  );
}

const INPUT_CLASS =
  "w-full rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder-gray-600 focus:border-[#C9A96E]/60 focus:outline-none focus:ring-1 focus:ring-[#C9A96E]/30 transition";

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

function TextArea({
  value,
  onChange,
  placeholder,
  rtl,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rtl?: boolean;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      dir={rtl ? "rtl" : "ltr"}
      className={`${INPUT_CLASS} resize-none`}
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
          <h3 className="truncate text-base font-semibold text-foreground">
            {title}
          </h3>
          <p className="mt-0.5 truncate text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-0.5 rounded-lg bg-[var(--tott-elevated)] p-0.5">
            {SUPPORTED_LOCALES.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => onLocaleChange(loc)}
                className={`rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                  activeLocale === loc
                    ? "bg-[var(--tott-dash-surface-inset)] text-foreground shadow-sm"
                    : "text-[var(--tott-tab-inactive)] hover:text-foreground"
                }`}
              >
                {loc}
              </button>
            ))}
          </div>
          <span className="mx-1 h-5 w-px bg-[var(--tott-card-border)]" />
          <button
            type="button"
            onClick={onReset}
            disabled={!isDirty}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-[var(--tott-dash-surface-inset)] hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
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
            className="rounded-md bg-[#C9A96E] px-4 py-1.5 text-xs font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-30"
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
function PreviewFrame({
  locale,
  children,
}: {
  locale: MagazineLocale;
  children: React.ReactNode;
}) {
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
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">
          {t("previewHeading")}
        </span>
        <span className="rounded-full border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
          {locale}
        </span>
      </div>

      <div
        ref={frameRef}
        className="w-full overflow-hidden rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] shadow-lg"
      >
        <div className="flex items-center gap-1.5 border-b border-[var(--tott-card-border)] bg-[var(--tott-elevated)] px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]/70" />
          <span className="ml-3 truncate rounded bg-[var(--tott-dash-input-bg)] px-2 py-0.5 text-[10px] font-mono text-gray-500">
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
            dir={RTL_LOCALES.has(locale) ? "rtl" : "ltr"}
            style={{
              width: PREVIEW_DESIGN_WIDTH,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              userSelect: "none",
            }}
          >
            {children}
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

function FieldGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">
        {label}
      </p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

// ─── Generic locale-keyed editor hook ──────────────────────────────

function useLocalizedDraft<T extends object, C extends { copy: Record<string, T> }>(
  section: CmsSection,
  parse: (s: CmsSection) => C,
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
        }) as C,
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

// ─── Manifesto editor ──────────────────────────────────────────────

function ManifestoEditor({ section, onSave, isSaving }: EditorProps) {
  const t = useTranslations("Dashboard.magazinePageEditor.manifesto");
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
  } = useLocalizedDraft<ManifestoLocaleFields, ManifestoConfig>(
    section,
    parseManifestoConfig,
  );
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
            <Field label={t("fields.philosophyHeading")}>
              <TextInput
                value={localeFields.philosophyHeading ?? ""}
                onChange={(v) => setLocaleField("philosophyHeading", v)}
                rtl={isRtl}
              />
            </Field>
            <Field label={t("fields.philosophyQuote")}>
              <TextArea
                rows={3}
                value={localeFields.philosophyQuote ?? ""}
                onChange={(v) => setLocaleField("philosophyQuote", v)}
                rtl={isRtl}
              />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label={t("fields.visionHeading")}>
                <TextInput
                  value={localeFields.visionHeading ?? ""}
                  onChange={(v) => setLocaleField("visionHeading", v)}
                  rtl={isRtl}
                />
              </Field>
              <Field label={t("fields.missionHeading")}>
                <TextInput
                  value={localeFields.missionHeading ?? ""}
                  onChange={(v) => setLocaleField("missionHeading", v)}
                  rtl={isRtl}
                />
              </Field>
              <Field label={t("fields.visionBody")}>
                <TextArea
                  rows={4}
                  value={localeFields.visionBody ?? ""}
                  onChange={(v) => setLocaleField("visionBody", v)}
                  rtl={isRtl}
                />
              </Field>
              <Field label={t("fields.missionBody")}>
                <TextArea
                  rows={4}
                  value={localeFields.missionBody ?? ""}
                  onChange={(v) => setLocaleField("missionBody", v)}
                  rtl={isRtl}
                />
              </Field>
            </div>
            <Field label={t("fields.valuesHeading")}>
              <TextInput
                value={localeFields.valuesHeading ?? ""}
                onChange={(v) => setLocaleField("valuesHeading", v)}
                rtl={isRtl}
              />
            </Field>
            <Field label={t("fields.closingQuote")}>
              <TextArea
                rows={3}
                value={localeFields.closingQuote ?? ""}
                onChange={(v) => setLocaleField("closingQuote", v)}
                rtl={isRtl}
              />
            </Field>
          </FieldGroup>

          <FieldGroup label={tShared("sharedHeading")}>
            <Field label={t("fields.bannerUrl")}>
              <TextInput
                type="url"
                value={draft.banner ?? ""}
                onChange={(v) =>
                  setDraft((prev) => ({ ...prev, banner: v || undefined }))
                }
                placeholder="/images/home/hero-silk.png"
              />
            </Field>
          </FieldGroup>
        </div>
      </FormCard>

      <PreviewFrame locale={activeLocale}>
        <MagazineManifesto
          philosophyHeadingOverride={localeFields.philosophyHeading}
          philosophyQuoteOverride={localeFields.philosophyQuote}
          visionHeadingOverride={localeFields.visionHeading}
          visionBodyOverride={localeFields.visionBody}
          missionHeadingOverride={localeFields.missionHeading}
          missionBodyOverride={localeFields.missionBody}
          valuesHeadingOverride={localeFields.valuesHeading}
          closingQuoteOverride={localeFields.closingQuote}
          bannerOverride={draft.banner}
        />
      </PreviewFrame>
    </>
  );
}

// ─── Founder quote editor ──────────────────────────────────────────

function FounderQuoteEditor({ section, onSave, isSaving }: EditorProps) {
  const t = useTranslations("Dashboard.magazinePageEditor.founderQuote");
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
  } = useLocalizedDraft<FounderQuoteLocaleFields, FounderQuoteConfig>(
    section,
    parseFounderConfig,
  );
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
            <Field label={t("fields.quote")}>
              <TextArea
                rows={4}
                value={localeFields.quote ?? ""}
                onChange={(v) => setLocaleField("quote", v)}
                rtl={isRtl}
              />
            </Field>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label={t("fields.name")}>
                <TextInput
                  value={localeFields.name ?? ""}
                  onChange={(v) => setLocaleField("name", v)}
                  rtl={isRtl}
                />
              </Field>
              <Field label={t("fields.role")}>
                <TextInput
                  value={localeFields.role ?? ""}
                  onChange={(v) => setLocaleField("role", v)}
                  rtl={isRtl}
                />
              </Field>
            </div>
          </FieldGroup>

          <FieldGroup label={t("sharedHeading")}>
            <Field label={t("fields.avatarUrl")}>
              <TextInput
                type="url"
                value={draft.avatar ?? ""}
                onChange={(v) =>
                  setDraft((prev) => ({ ...prev, avatar: v || undefined }))
                }
              />
            </Field>
          </FieldGroup>
        </div>
      </FormCard>

      <PreviewFrame locale={activeLocale}>
        <MagazineEditorialBoard
          lessReadArticles={[]}
          writers={[]}
          founder={{
            quote: localeFields.quote ?? "",
            name: localeFields.name ?? "",
          }}
        />
      </PreviewFrame>
    </>
  );
}

// ─── Newsletter copy editor ────────────────────────────────────────

function NewsletterCopyEditor({ section, onSave, isSaving }: EditorProps) {
  const t = useTranslations("Dashboard.magazinePageEditor.newsletterCopy");
  const tShared = useTranslations("Dashboard.magazinePageEditor.hero");
  const {
    draft,
    activeLocale,
    setActiveLocale,
    localeFields,
    setLocaleField,
    isDirty,
    reset,
  } = useLocalizedDraft<NewsletterCopyLocaleFields, NewsletterCopyConfig>(
    section,
    parseNewsletterConfig,
  );
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
        <FieldGroup label={tShared("perLocaleHeading")}>
          <Field label={t("fields.title")}>
            <TextInput
              value={localeFields.title ?? ""}
              onChange={(v) => setLocaleField("title", v)}
              rtl={isRtl}
            />
          </Field>
          <Field label={t("fields.body")}>
            <TextArea
              rows={4}
              value={localeFields.body ?? ""}
              onChange={(v) => setLocaleField("body", v)}
              rtl={isRtl}
            />
          </Field>
        </FieldGroup>
      </FormCard>

      <PreviewFrame locale={activeLocale}>
        <MagazineNewsletter
          titleOverride={localeFields.title}
          bodyOverride={localeFields.body}
        />
      </PreviewFrame>
    </>
  );
}

// ─── Support / Collaborations editor ───────────────────────────────

const PREVIEW_COLLABS_PLACEHOLDER = [
  {
    id: "preview-1",
    title: "Sample Collaboration",
    type: "Co-writing",
    status: "Completed",
    timeline: "Mar 2025",
    description:
      "Placeholder collaboration shown only inside the editor preview — your live page draws from real contributions.",
  },
  {
    id: "preview-2",
    title: "Illustration partnership",
    type: "Illustration",
    status: "Active",
    timeline: "Q2 2025",
    description: "Another placeholder card to show the carousel layout.",
  },
];

function SupportEditor({ section, onSave, isSaving }: EditorProps) {
  const t = useTranslations("Dashboard.magazinePageEditor.support");
  const tShared = useTranslations("Dashboard.magazinePageEditor.hero");
  const {
    draft,
    activeLocale,
    setActiveLocale,
    localeFields,
    setLocaleField,
    isDirty,
    reset,
  } = useLocalizedDraft<SupportLocaleFields, SupportConfig>(
    section,
    parseSupportConfig,
  );
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
            <Field label={t("fields.subheading")}>
              <TextArea
                rows={2}
                value={localeFields.subheading ?? ""}
                onChange={(v) => setLocaleField("subheading", v)}
                rtl={isRtl}
              />
            </Field>
          </FieldGroup>
          <div className="rounded-lg border border-dashed border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] p-3 text-xs text-gray-500">
            {t("curationNote")}
          </div>
        </div>
      </FormCard>

      <PreviewFrame locale={activeLocale}>
        <MagazineSupport
          collaborations={PREVIEW_COLLABS_PLACEHOLDER}
          headingOverride={localeFields.heading}
          subheadingOverride={localeFields.subheading}
        />
      </PreviewFrame>
    </>
  );
}
