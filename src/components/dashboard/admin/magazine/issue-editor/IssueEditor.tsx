"use client";

import { useCallback, useId, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";
import { ChevronLeftLargeIcon, StarIcon } from "@/components/ui/icons";
import { mutationToast } from "@/hooks/useMutationToast";
import { formatApiError } from "@/lib/api/error-message";
import { resolveArticleMediaSrc } from "@/lib/content/article-media-url";
import { dirFor } from "@/i18n/dir";
import { uploadArticleAssetKeyAndUrl } from "@/services/uploads.service";
import { RichTextEditor } from "@/components/ui/rich-text/RichTextEditor";
import { EditorRegistryProvider } from "@/components/ui/rich-text/editor-registry";
import { EditorToolbar } from "@/components/ui/rich-text/EditorToolbar";
import { LanguageFormTabs } from "@/components/dashboard/admin/translations";
import type { LanguageTabStatus } from "@/components/dashboard/admin/translations/LanguageFormTabs";
import { useMagazineIssues } from "@/hooks/queries/magazine-issues";
import { useMagazines } from "@/hooks/queries/magazines";
import {
  useCreateMagazineIssue,
  useUpdateMagazineIssue,
} from "@/hooks/mutations/magazine-issues";
import { useCreateMagazine } from "@/hooks/mutations/magazines";
import type {
  MagazineIssue,
  MagazineIssueInput,
} from "@/services/magazine-issues.service";
import { IssueArticlesPanel } from "../IssueArticlesPanel";
import { IssueContributorsPanel } from "../IssueContributorsPanel";

const KINDS = ["editorial", "crowdfunded"] as const;
const STATUSES = ["published", "draft", "archived"] as const;
const LANGS = ["en", "ar", "es", "fr"] as const;
const LIST_URL = "/admin/magazine-issues";
const DEFAULT_MAGAZINE_TITLE = "Trace of the Tide";

/** URL-safe, Unicode-aware slug (Arabic titles survive). */
function slugify(input: string): string {
  const base = input
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return base || "issue";
}

function normStatus(s: string | null | undefined): string {
  return (s ?? "draft").toLowerCase();
}

function groupIdOf(it: MagazineIssue): string {
  return it.translation_group_id ?? it.id;
}

type FormState = {
  title: string;
  subtitle: string;
  kind: string;
  status: string;
  language: string;
  is_premium: boolean;
  price: string;
  currency: string;
  pdf_path: string;
  funding_goal: string;
  funding_deadline: string;
  cover_image: string;
  excerpt: string;
  description: string;
  editors_letter: string;
  page_count: string;
  edition: string;
  category: string;
  published_at: string;
};

function toForm(item: MagazineIssue | null, defaultEdition: number): FormState {
  return {
    title: item?.title ?? "",
    subtitle: item?.subtitle ?? "",
    kind: item?.kind ?? "editorial",
    status: normStatus(item?.status ?? "draft"),
    language: item?.language ?? "",
    is_premium: item?.is_premium ?? false,
    price: item?.price != null ? String(item.price) : "",
    currency: item?.currency ?? "USD",
    pdf_path: (item as { pdf_path?: string | null })?.pdf_path ?? "",
    funding_goal: item?.funding_goal != null ? String(item.funding_goal) : "",
    funding_deadline: item?.funding_deadline ? item.funding_deadline.slice(0, 10) : "",
    cover_image: item?.cover_image ?? "",
    excerpt: item?.excerpt ?? "",
    description: item?.description ?? "",
    editors_letter: item?.editors_letter_html ?? "",
    page_count: item?.page_count != null ? String(item.page_count) : "",
    edition:
      item?.edition_number != null
        ? String(item.edition_number)
        : item?.edition ?? (item ? "" : String(defaultEdition)),
    category: item?.category ?? "",
    published_at: item?.published_at ? item.published_at.slice(0, 10) : "",
  };
}

function toPayload(f: FormState, lang: string): MagazineIssueInput {
  const toIso = (ymd: string): string | null => {
    if (!ymd) return null;
    const d = new Date(ymd);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  };
  const isCrowdfunded = f.kind === "crowdfunded";
  return {
    title: f.title.trim(),
    subtitle: f.subtitle.trim() || null,
    kind: f.kind || null,
    status: f.status || null,
    language: lang,
    is_premium: f.is_premium,
    price: f.price ? parseFloat(f.price) : null,
    currency: f.currency.trim() || "USD",
    pdf_path: f.pdf_path.trim() || null,
    cover_image: f.cover_image.trim() || null,
    excerpt: f.excerpt.trim() || null,
    description: f.description.trim() || null,
    editors_letter_html: f.editors_letter || null,
    page_count: f.page_count ? parseInt(f.page_count, 10) : null,
    edition_number: parseInt(f.edition, 10),
    category: f.category.trim() || null,
    published_at: toIso(f.published_at),
    funding_goal: isCrowdfunded && f.funding_goal ? parseFloat(f.funding_goal) : null,
    funding_deadline: isCrowdfunded ? toIso(f.funding_deadline) : null,
  };
}

type FieldErrors = Partial<Record<"title" | "edition" | "cover", string>>;

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground outline-none placeholder:text-[var(--tott-muted)] focus:border-[var(--tott-accent-gold)]";
const labelClass =
  "mb-1 block text-xs font-medium text-[var(--tott-dash-gold-label)]";

/**
 * Full-page issue composer — the article-editor pattern applied to a magazine
 * issue: cover at the top, bilingual title/theme, then the editor's letter in
 * the shared rich-text editor. Language tabs drive the translation-group model
 * (primary row + linked translations), exactly like the article editor.
 */
export function IssueEditor({ issueId }: { issueId?: string }) {
  const t = useTranslations("Dashboard.magazineIssues");
  const tTr = useTranslations("Dashboard.translations");
  const locale = useLocale();
  const router = useRouter();
  const isEdit = Boolean(issueId);

  // Seed from the admin list (full rows incl. pdf_path/editors_letter/is_current).
  // GET /:id is the decorated public read and strips pdf_path, which would wipe
  // it on save — so the editor never sources its seed from there.
  const issuesQuery = useMagazineIssues({ limit: 100 });
  const issues = useMemo(() => issuesQuery.data ?? [], [issuesQuery.data]);
  const item = useMemo(
    () => (issueId ? issues.find((i) => i.id === issueId) ?? null : null),
    [issues, issueId],
  );

  const magazinesQuery = useMagazines({ limit: 100 });
  const magazines = useMemo(() => magazinesQuery.data ?? [], [magazinesQuery.data]);
  const magazineName = magazines[0]?.name ?? magazines[0]?.title ?? null;

  const nextEdition = useMemo(
    () => issues.reduce((m, it) => Math.max(m, it.edition_number ?? 0), 0) + 1,
    [issues],
  );

  const create = useCreateMagazineIssue();
  const update = useUpdateMagazineIssue();
  const createMagazine = useCreateMagazine();

  // Every language row sharing this issue's group, keyed by language.
  const allVersions = useMemo(() => {
    if (!item) return {} as Record<string, MagazineIssue>;
    const gid = groupIdOf(item);
    const map: Record<string, MagazineIssue> = {};
    for (const it of issues) {
      if (groupIdOf(it) === gid) map[(it.language ?? "en").toLowerCase()] = it;
    }
    return map;
  }, [issues, item]);

  const initialLang =
    item?.language ?? ((LANGS as readonly string[]).includes(locale) ? locale : "en");
  const primaryLang = item?.language ?? initialLang;

  const [activeLang, setActiveLang] = useState(initialLang);
  const [forms, setForms] = useState<Record<string, FormState>>(() => {
    const base = toForm(item, nextEdition);
    base.language = initialLang;
    return { [initialLang]: base };
  });
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  // Freshly-uploaded signed URLs, per language — private bucket keys 403 until
  // propagation, so preview from the signed URL, persist the key.
  const [coverPreview, setCoverPreview] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [uploading, setUploading] = useState(false);
  const [seeded, setSeeded] = useState(false);

  // In edit mode the list resolves after mount; seed the primary form once.
  if (isEdit && item && !seeded) {
    const base = toForm(item, nextEdition);
    base.language = item.language ?? initialLang;
    setForms({ [base.language]: base });
    setActiveLang(base.language);
    setSeeded(true);
  }

  const form = forms[activeLang] ?? toForm(null, nextEdition);
  const saving = create.isPending || update.isPending || createMagazine.isPending;
  const busy = saving || uploading;

  const tabStatus = useMemo(() => {
    const map: Record<string, LanguageTabStatus> = {};
    for (const loc of LANGS) {
      map[loc] = dirty[loc]
        ? "dirty"
        : loc === primaryLang
          ? "primary"
          : allVersions[loc] || forms[loc]
            ? "existing"
            : "empty";
    }
    return map;
  }, [dirty, primaryLang, allVersions, forms]);

  const updateForm = useCallback(
    (mutate: (prev: FormState) => FormState) => {
      setForms((prev) => {
        const current = prev[activeLang] ?? toForm(null, nextEdition);
        return { ...prev, [activeLang]: mutate(current) };
      });
      setDirty((prev) => (prev[activeLang] ? prev : { ...prev, [activeLang]: true }));
    },
    [activeLang, nextEdition],
  );

  const switchLanguage = (next: string) => {
    if (next === activeLang) return;
    if (!forms[next]) {
      const existing = allVersions[next];
      setForms((prev) => ({
        ...prev,
        [next]: existing
          ? { ...toForm(existing, nextEdition), language: next }
          : { ...(prev[activeLang] ?? toForm(null, nextEdition)), language: next, status: "draft" },
      }));
    }
    setActiveLang(next);
  };

  const set =
    (field: keyof FormState) =>
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      updateForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleCoverFile = async (file: File) => {
    setUploading(true);
    try {
      const { key, url } = await mutationToast(
        () => uploadArticleAssetKeyAndUrl(file),
        {
          loading: t("editor.uploading"),
          success: t("editor.uploaded"),
          error: t("editor.uploadError"),
        },
      );
      setErrors((prev) => ({ ...prev, cover: undefined }));
      updateForm((prev) => ({ ...prev, cover_image: key }));
      if (url) setCoverPreview((prev) => ({ ...prev, [activeLang]: url }));
    } catch {
      /* surfaced via toast */
    } finally {
      setUploading(false);
    }
  };

  async function handleSave() {
    const primary = forms[primaryLang] ?? forms[activeLang] ?? form;
    const next: FieldErrors = {};
    if (!primary.title.trim()) next.title = t("editor.errors.titleRequired");
    if (!primary.edition.trim()) next.edition = t("editor.errors.editionRequired");
    else if (Number.isNaN(parseInt(primary.edition, 10)))
      next.edition = t("editor.errors.editionNumber");
    if (!primary.cover_image.trim()) next.cover = t("editor.errors.coverRequired");
    if (Object.keys(next).length > 0) {
      setErrors(next);
      setActiveLang(primaryLang);
      return;
    }

    // Primary first, then any dirty translation tab.
    const dirtyLocales = LANGS.filter((loc) => dirty[loc] && forms[loc]);
    const translationLocales = dirtyLocales.filter((l) => l !== primaryLang);

    let magazineId: string | null = item?.magazine_id ?? magazines[0]?.id ?? null;
    let createdPrimaryId: string | null = null;
    const failed: string[] = [];

    try {
      await mutationToast(
        async () => {
          // Primary
          if (item?.id) {
            await update.mutateAsync({ id: item.id, payload: toPayload(primary, primaryLang) });
            createdPrimaryId = item.id;
          } else {
            if (!magazineId) {
              const mag = await createMagazine.mutateAsync({
                name: DEFAULT_MAGAZINE_TITLE,
                title: DEFAULT_MAGAZINE_TITLE,
                slug: slugify(DEFAULT_MAGAZINE_TITLE),
                status: "published",
              });
              magazineId = mag?.id ?? null;
            }
            const created = await create.mutateAsync({
              ...toPayload(primary, primaryLang),
              magazine_id: magazineId,
              slug: `${slugify(primary.title)}-${Date.now().toString(36).slice(-5)}`,
            });
            createdPrimaryId = created?.id ?? null;
          }

          // Translations
          for (const loc of translationLocales) {
            const f = forms[loc];
            if (!f) continue;
            const existingId = allVersions[loc]?.id;
            try {
              if (existingId) {
                await update.mutateAsync({ id: existingId, payload: toPayload(f, loc) });
              } else if (createdPrimaryId) {
                await create.mutateAsync({
                  ...toPayload(f, loc),
                  status: "draft",
                  translation_of: createdPrimaryId,
                  magazine_id: magazineId,
                  slug: `${slugify(f.title || primary.title)}-${loc}-${Date.now().toString(36).slice(-5)}`,
                });
              }
            } catch {
              failed.push(loc);
            }
          }
          return createdPrimaryId;
        },
        {
          loading: t("editor.saving"),
          success: isEdit ? t("editor.saved") : t("editor.created"),
          error: t("editor.saveError"),
        },
      );
    } catch {
      return;
    }

    if (failed.length > 0) {
      toast.error(
        tTr("toasts.partialFailure", { languages: failed.join(", ").toUpperCase() }),
      );
    }

    // Fresh issue → move to its edit page so articles/contributors appear.
    if (!isEdit && createdPrimaryId) {
      router.replace(`${LIST_URL}/edit/${createdPrimaryId}`);
    } else {
      setDirty({});
    }
  }

  const loadError = issuesQuery.error
    ? formatApiError(issuesQuery.error, t("published.list.loadError"))
    : null;

  if (isEdit && issuesQuery.isLoading) {
    return (
      <p className="px-2 py-16 text-center text-sm text-[var(--tott-muted)]">
        {t("published.list.loading")}
      </p>
    );
  }
  if (isEdit && !item) {
    return (
      <div className="px-2 py-16 text-center text-sm text-[var(--tott-muted)]">
        <p>{loadError ?? t("editor.notFound")}</p>
        <Link href={LIST_URL} className="mt-3 inline-block text-[var(--tott-accent-gold)] underline">
          {t("editor.back")}
        </Link>
      </div>
    );
  }

  // Content fields follow the tab's language (may differ from the UI locale);
  // the form chrome itself stays in the UI direction set on <html>.
  const contentDir = dirFor(activeLang);

  return (
    <EditorRegistryProvider>
      <div className="mx-auto max-w-3xl">
        {/* Sticky action bar */}
        <div className="sticky top-0 z-20 -mx-2 mb-4 flex flex-wrap items-center gap-3 border-b border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)]/95 px-2 py-3 backdrop-blur">
          <Link
            href={LIST_URL}
            className="inline-flex items-center gap-1 text-sm text-[var(--tott-muted)] transition-colors hover:text-foreground [&_svg]:h-4 [&_svg]:w-4"
          >
            <ChevronLeftLargeIcon />
            {t("editor.back")}
          </Link>
          <div className="flex flex-1 items-center gap-2">
            <h1 className="text-base font-bold text-foreground">
              {isEdit ? t("editor.editTitle") : t("editor.createTitle")}
            </h1>
            {item?.is_current ? (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold [&_svg]:h-3 [&_svg]:w-3"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--tott-accent-gold) 16%, transparent)",
                  color: "var(--tott-accent-gold)",
                }}
              >
                <StarIcon />
                {t("editor.currentBadge")}
              </span>
            ) : null}
          </div>
          <LanguageFormTabs
            active={activeLang}
            onSelect={switchLanguage}
            status={tabStatus}
            disabled={busy}
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg border px-5 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{
              borderColor: "color-mix(in srgb, var(--tott-accent-gold) 60%, transparent)",
              backgroundColor: "color-mix(in srgb, var(--tott-accent-gold) 16%, transparent)",
              color: "var(--tott-accent-gold)",
            }}
          >
            {busy ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : null}
            {busy ? t("editor.saving") : isEdit ? t("editor.save") : t("editor.create")}
          </button>
        </div>

        <p className="mb-6 text-xs leading-relaxed text-[var(--tott-muted)]">
          {t("published.form.description")}
        </p>

        <div className="space-y-6">
          {/* Cover (required) */}
          <div>
            <label className={labelClass}>
              {t("published.form.fields.coverImage")} *
            </label>
            <IssueCoverUpload
              value={form.cover_image}
              previewSrc={coverPreview[activeLang]}
              uploading={uploading}
              onFile={handleCoverFile}
            />
            {errors.cover ? (
              <p className="mt-1 text-xs" style={{ color: "var(--tott-status-coral)" }}>
                {errors.cover}
              </p>
            ) : null}
          </div>

          {/* Title + theme */}
          <div className="space-y-4">
            <div>
              <label className={labelClass}>{t("published.form.fields.title")} *</label>
              <input
                type="text"
                dir={contentDir}
                className={`${inputClass} text-lg`}
                value={form.title}
                onChange={set("title")}
                placeholder={t("published.form.fields.titlePlaceholder")}
              />
              {errors.title ? (
                <p className="mt-1 text-xs" style={{ color: "var(--tott-status-coral)" }}>
                  {errors.title}
                </p>
              ) : null}
            </div>
            <div>
              <label className={labelClass}>{t("editor.fields.theme")}</label>
              <input
                type="text"
                dir={contentDir}
                className={inputClass}
                value={form.subtitle}
                onChange={set("subtitle")}
                placeholder={t("published.form.fields.subtitlePlaceholder")}
              />
            </div>
          </div>

          {!isEdit ? (
            <p className="text-xs" style={{ color: "var(--tott-muted)" }}>
              {magazineName
                ? t("published.form.publishingTo", { name: magazineName })
                : t("published.form.publishingToNew")}
            </p>
          ) : null}

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-4 rounded-lg border border-[var(--tott-card-border)] p-4">
            <div>
              <label className={labelClass}>{t("published.form.fields.kind")}</label>
              <select className={inputClass} value={form.kind} onChange={set("kind")}>
                {KINDS.map((k) => (
                  <option key={k} value={k}>{t(`kinds.${k}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t("published.form.fields.status")}</label>
              <select className={inputClass} value={form.status} onChange={set("status")}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{t(`statuses.${s}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t("published.form.fields.edition")} *</label>
              <input
                type="number"
                min="0"
                className={inputClass}
                value={form.edition}
                onChange={set("edition")}
                placeholder={t("published.form.fields.editionPlaceholder")}
              />
              {errors.edition ? (
                <p className="mt-1 text-xs" style={{ color: "var(--tott-status-coral)" }}>
                  {errors.edition}
                </p>
              ) : null}
            </div>
            <div>
              <label className={labelClass}>{t("published.form.fields.publishedAt")}</label>
              <input
                type="date"
                className={inputClass}
                value={form.published_at}
                onChange={set("published_at")}
              />
            </div>
            <div>
              <label className={labelClass}>{t("published.form.fields.category")}</label>
              <input
                type="text"
                dir={contentDir}
                className={inputClass}
                value={form.category}
                onChange={set("category")}
                placeholder={t("published.form.fields.categoryPlaceholder")}
              />
            </div>
            <div>
              <label className={labelClass}>{t("published.form.fields.pageCount")}</label>
              <input
                type="number"
                min="0"
                className={inputClass}
                value={form.page_count}
                onChange={set("page_count")}
              />
            </div>
          </div>

          {form.kind === "crowdfunded" ? (
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] p-3">
              <div>
                <label className={labelClass}>{t("published.form.fields.fundingGoal")}</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputClass}
                  value={form.funding_goal}
                  onChange={set("funding_goal")}
                  placeholder="5000"
                />
              </div>
              <div>
                <label className={labelClass}>{t("published.form.fields.fundingDeadline")}</label>
                <input
                  type="date"
                  className={inputClass}
                  value={form.funding_deadline}
                  onChange={set("funding_deadline")}
                />
              </div>
            </div>
          ) : null}

          {/* Commerce */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-foreground sm:col-span-3">
              <input
                type="checkbox"
                checked={form.is_premium}
                onChange={(e) => updateForm((prev) => ({ ...prev, is_premium: e.target.checked }))}
                className="h-4 w-4 accent-[var(--tott-accent-gold)]"
              />
              {t("published.form.fields.isPremium")}
            </label>
            <div>
              <label className={labelClass}>{t("published.form.fields.price")}</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={form.price}
                onChange={set("price")}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className={labelClass}>{t("published.form.fields.currency")}</label>
              <input
                type="text"
                className={inputClass}
                value={form.currency}
                onChange={set("currency")}
                placeholder="USD"
              />
            </div>
            <div>
              <label className={labelClass}>{t("published.form.fields.pdfPath")}</label>
              <input
                type="text"
                className={inputClass}
                value={form.pdf_path}
                onChange={set("pdf_path")}
                placeholder={t("published.form.fields.pdfPathPlaceholder")}
              />
            </div>
          </div>

          {/* Editor's letter — the rich-text intro */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className={labelClass}>{t("editor.fields.letter")}</label>
              <span className="text-[11px] text-[var(--tott-muted)]">
                {t("editor.fields.letterHint")}
              </span>
            </div>
            <div className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)]">
              <div className="border-b border-[var(--tott-card-border)]">
                <EditorToolbar />
              </div>
              <RichTextEditor
                key={activeLang}
                value={form.editors_letter}
                onChange={(html) => updateForm((prev) => ({ ...prev, editors_letter: html }))}
                dir={contentDir}
                placeholder={t("editor.fields.letterPlaceholder")}
              />
            </div>
          </div>

          {/* Assignments — edit mode only */}
          {isEdit && item ? (
            <div className="space-y-4 border-t border-[var(--tott-card-border)] pt-6" dir="ltr">
              <IssueArticlesPanel issueId={item.id} magazineId={item.magazine_id ?? null} />
              <IssueContributorsPanel issueId={item.id} />
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-[var(--tott-card-border)] px-4 py-3 text-xs text-[var(--tott-muted)]">
              {t("editor.saveToAssign")}
            </p>
          )}
        </div>
      </div>
    </EditorRegistryProvider>
  );
}

/** Cover drop/click upload. Persists the stable storage key; previews from the
 * fresh signed URL when present, else resolves the key for display. */
function IssueCoverUpload({
  value,
  previewSrc,
  uploading,
  onFile,
}: {
  value: string;
  previewSrc?: string;
  uploading: boolean;
  onFile: (file: File) => void;
}) {
  const t = useTranslations("Dashboard.magazineIssues");
  const id = useId();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const src = previewSrc || (value ? resolveArticleMediaSrc(value) : "");

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  if (src && !uploading) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-[var(--tott-card-border)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className="max-h-72 w-full object-cover"
          onError={(e) => ((e.target as HTMLImageElement).style.opacity = "0.2")}
        />
        <label
          htmlFor={id}
          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 text-sm font-medium text-white opacity-0 transition-opacity hover:opacity-100"
        >
          {t("published.form.changeCover")}
          <input
            id={id}
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) onFile(f);
            }}
          />
        </label>
      </div>
    );
  }

  return (
    <label
      htmlFor={id}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={[
        "flex min-h-[160px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors",
        dragging
          ? "border-[var(--tott-accent-gold)] bg-[color-mix(in_srgb,var(--tott-accent-gold)_6%,transparent)]"
          : "border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] hover:border-[color-mix(in_srgb,var(--tott-accent-gold)_50%,transparent)]",
      ].join(" ")}
    >
      <input
        id={id}
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={uploading}
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) onFile(f);
        }}
      />
      {uploading ? (
        <div className="flex flex-col items-center gap-2 py-5">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--tott-card-border)] border-t-[var(--tott-accent-gold)]" />
          <span className="text-xs text-[var(--tott-muted)]">{t("editor.uploading")}</span>
        </div>
      ) : (
        <span className="px-4 py-6 text-center text-xs font-medium text-[var(--tott-muted)]">
          {t("published.form.uploadHint")}
        </span>
      )}
    </label>
  );
}
