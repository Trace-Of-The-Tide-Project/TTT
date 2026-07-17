"use client";

import { useCallback, useMemo, useState, type ReactNode, type SelectHTMLAttributes } from "react";
import { useTranslations } from "next-intl";
import { routing } from "@/i18n/routing";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import type { AdminTagItem } from "@/services/admin-tags.service";
import { useAdminTags } from "@/hooks/queries/admin-tags";
import { resolveArticleMediaSrc } from "@/lib/content/article-media-url";
import { TranslationOfPicker } from "./TranslationOfPicker";
import { WriterPicker } from "@/components/dashboard/admin/writers/WriterPicker";
import { UserPicker } from "@/components/dashboard/admin/writers/UserPicker";
import type { AdminUserListItem } from "@/services/users.service";
import type { WriterProfile } from "@/services/writers.service";

/**
 * Resolve the cover value for the `<img>` preview. Fresh picks are local
 * object-/data-URLs and must pass through untouched; persisted covers are
 * relative storage keys (e.g. `images/123.png`) that resolve to the permanent
 * public-bucket URL. Legacy absolute http(s) URLs are returned as-is.
 */
function coverPreviewSrc(value: string): string {
  if (/^(blob:|data:)/i.test(value)) return value;
  return resolveArticleMediaSrc(value);
}
import {
  StatusFieldIcon,
  CategoryFieldIcon,
  TagFieldIcon,
  GlobeIcon,
  EyeIcon,
  SettingsIcon,
  ImageIcon,
} from "./ArticleEditorIcons";

// Field tokens are pulled straight from the Figma source SVG so the dark
// surfaces match exactly (#262626 fill, #333 stroke, 7.5px radius).
const FIELD_BASE =
  "w-full rounded-[7.5px] border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2.5 text-sm text-foreground placeholder:text-[var(--tott-muted)] outline-none transition-colors focus:border-[var(--tott-card-border)]";

const SELECT_BASE = `${FIELD_BASE} appearance-none pr-9 text-[var(--tott-muted)]`;

function ChevronDown() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function FieldSelect({ children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select className={SELECT_BASE} {...rest}>
        {children}
      </select>
      <span
        className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--tott-muted)]"
        aria-hidden
      >
        <ChevronDown />
      </span>
    </div>
  );
}

function SectionLabel({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="mb-2 flex items-center gap-2 text-sm text-[var(--tott-muted)]">
      <span className="text-[var(--tott-muted)]">{icon}</span>
      {children}
    </span>
  );
}

export type ArticleWorkflowStatus = "draft" | "published" | "scheduled";

type ContentSettingsProps = {
  title?: string;
  workflowStatus: ArticleWorkflowStatus;
  onWorkflowStatusChange: (v: ArticleWorkflowStatus) => void;
  /** When status is scheduled — ISO from API */
  scheduledAt?: string | null;
  category: string;
  onCategoryChange: (v: string) => void;
  language: string;
  onLanguageChange: (v: string) => void;
  /** Links this article as a translation of an existing one. When omitted the
   * picker is hidden (e.g. content types that don't support translation). */
  translationOf?: string;
  onTranslationOfChange?: (id: string | undefined, title?: string | null) => void;
  /** The current article's id, so it can't be linked as its own translation. */
  excludeId?: string;
  /** Owner/byline assignment is admin/editor only — when false the block hides. */
  canAssign?: boolean;
  /** Selected new owner (empty = leave ownership unchanged). */
  authorUser?: AdminUserListItem | null;
  onAuthorUserChange?: (user: AdminUserListItem | null) => void;
  /** Name of the current owner, shown as a caption above the transfer picker. */
  currentOwnerName?: string | null;
  /** Credited byline writer profile (null = bylined to the owner only). */
  writer?: WriterProfile | null;
  onWriterChange?: (writer: WriterProfile | null) => void;
  visibility: "public" | "private";
  onVisibilityChange: (v: "public" | "private") => void;
  accessLevel?: "open" | "preview" | "subscriber" | "paid";
  onAccessLevelChange?: (v: "open" | "preview" | "subscriber" | "paid") => void;
  previewBlockCount?: number | null;
  onPreviewBlockCountChange?: (v: number | null) => void;
  price?: number | null;
  onPriceChange?: (v: number | null) => void;
  currency?: string;
  onCurrencyChange?: (v: string) => void;
  seoTitle: string;
  onSeoTitleChange: (v: string) => void;
  metaDescription: string;
  onMetaDescriptionChange: (v: string) => void;
  /** Kept for parent state compatibility — not rendered in this design. */
  collectionId: string;
  onCollectionIdChange: (v: string) => void;
  tagIds: string[];
  onTagIdsChange: (ids: string[]) => void;
  /** Current cover image URL (existing remote URL or a local object-URL preview). */
  coverImage?: string | null;
  /** Called with a freshly-picked file; upload is deferred until save. */
  onCoverFileSelect?: (file: File) => void;
  /** Clears the cover image. */
  onCoverRemove?: () => void;
};

function formatScheduledAtHint(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ContentSettings({
  title,
  workflowStatus,
  onWorkflowStatusChange,
  scheduledAt,
  category,
  onCategoryChange,
  language,
  onLanguageChange,
  translationOf,
  onTranslationOfChange,
  excludeId,
  canAssign,
  authorUser,
  onAuthorUserChange,
  currentOwnerName,
  writer,
  onWriterChange,
  visibility,
  onVisibilityChange,
  accessLevel = "open",
  onAccessLevelChange,
  previewBlockCount,
  onPreviewBlockCountChange,
  price,
  onPriceChange,
  currency = "USD",
  onCurrencyChange,
  seoTitle,
  onSeoTitleChange,
  metaDescription,
  onMetaDescriptionChange,
  tagIds,
  onTagIdsChange,
  coverImage,
  onCoverFileSelect,
  onCoverRemove,
}: ContentSettingsProps) {
  const t = useTranslations("Dashboard.articles.editor.settings");

  const tagsQuery = useAdminTags();
  // Memoize the fallback so downstream `useMemo`s see a stable
  // reference between renders.
  const adminTags: AdminTagItem[] = useMemo(
    () => tagsQuery.data ?? [],
    [tagsQuery.data],
  );
  const tagsLoading = tagsQuery.isPending;
  const tagsError = tagsQuery.error ? t("tagsLoadError") : null;
  const [tagPicker, setTagPicker] = useState("");

  const tagNameById = useMemo(() => {
    const m = new Map<string, string>();
    for (const tag of adminTags) m.set(tag.id, tag.name);
    return m;
  }, [adminTags]);

  const removeTagById = useCallback(
    (id: string) => {
      onTagIdsChange(tagIds.filter((x) => x !== id));
    },
    [onTagIdsChange, tagIds],
  );

  const addTagFromPicker = useCallback(
    (id: string) => {
      if (!id || tagIds.includes(id)) return;
      onTagIdsChange([...tagIds, id]);
      setTagPicker("");
    },
    [onTagIdsChange, tagIds],
  );

  const tagsAvailableToAdd = useMemo(
    () => adminTags.filter((tag) => !tagIds.includes(tag.id)),
    [adminTags, tagIds],
  );

  const scheduledLabel = formatScheduledAtHint(scheduledAt ?? null);

  return (
    <ChamferedPanel className="bg-[var(--tott-dash-input-bg)] p-4">
      <h3 className="mb-4 text-base font-bold text-foreground">
        {title ?? t("defaultPanelTitle")}
      </h3>
      <div className="flex flex-col gap-5">
        <div>
          <SectionLabel icon={<StatusFieldIcon />}>{t("status.label")}</SectionLabel>
          <FieldSelect
            value={workflowStatus}
            onChange={(e) => onWorkflowStatusChange(e.target.value as ArticleWorkflowStatus)}
          >
            <option value="draft">{t("status.draft")}</option>
            <option value="published">{t("status.published")}</option>
            <option value="scheduled">{t("status.scheduled")}</option>
          </FieldSelect>
          {workflowStatus === "scheduled" && scheduledLabel ? (
            <p className="mt-1.5 text-xs text-amber-200/90">
              {t("status.goesLive")} {scheduledLabel}
            </p>
          ) : null}
        </div>

        <div>
          <SectionLabel icon={<CategoryFieldIcon />}>
            {t("category.label")}
            <span className="text-amber-500" aria-hidden>
              *
            </span>
          </SectionLabel>
          <input
            id="article-settings-category"
            type="text"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            placeholder={t("category.placeholder")}
            className={FIELD_BASE}
            required
            aria-required="true"
          />
        </div>

        <div>
          <SectionLabel icon={<ImageIcon />}>{t("cover.label")}</SectionLabel>
          {coverImage ? (
            <div className="mb-2 overflow-hidden rounded-[7.5px] border border-[var(--tott-card-border)]">
              {/* Cover preview — plain <img> (object-URL or remote URL, both fine). */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverPreviewSrc(coverImage)}
                alt=""
                className="block max-h-40 w-full object-cover"
              />
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <label className={`${FIELD_BASE} flex cursor-pointer items-center justify-center text-center text-[var(--tott-muted)] hover:border-[var(--tott-card-border)]`}>
              {coverImage ? t("cover.replace") : t("cover.choose")}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onCoverFileSelect?.(file);
                  // Reset so picking the same file again still fires change.
                  e.target.value = "";
                }}
              />
            </label>
            {coverImage ? (
              <button
                type="button"
                onClick={() => onCoverRemove?.()}
                className="shrink-0 rounded-[7.5px] border border-[var(--tott-card-border)] px-3 py-2.5 text-sm text-[var(--tott-muted)] transition-colors hover:border-[var(--tott-card-border)] hover:text-foreground"
              >
                {t("cover.remove")}
              </button>
            ) : null}
          </div>
        </div>

        <div>
          <SectionLabel icon={<TagFieldIcon />}>{t("tags.label")}</SectionLabel>
          {tagIds.length > 0 ? (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {tagIds.map((id) => {
                const name =
                  tagNameById.get(id) ?? t("tags.unknownName", { prefix: `${id.slice(0, 8)}…` });
                return (
                  <span
                    key={id}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-md bg-[var(--tott-dash-control-bg)] px-2.5 py-1 text-xs text-foreground"
                  >
                    <span className="truncate" title={id}>
                      {name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeTagById(id)}
                      className="grid h-3.5 w-3.5 shrink-0 place-items-center text-[var(--tott-muted)] transition-colors hover:text-foreground"
                      aria-label={t("tags.removeAria", {
                        name: tagNameById.get(id) ?? t("tags.fallbackName"),
                      })}
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        aria-hidden
                      >
                        <line x1="5" y1="5" x2="19" y2="19" />
                        <line x1="19" y1="5" x2="5" y2="19" />
                      </svg>
                    </button>
                  </span>
                );
              })}
            </div>
          ) : null}
          <FieldSelect
            id="article-settings-tag-add"
            value={tagPicker}
            aria-busy={tagsLoading}
            onChange={(e) => {
              const v = e.target.value;
              if (v) addTagFromPicker(v);
              else setTagPicker("");
            }}
          >
            <option value="">
              {tagsLoading ? t("tags.loading") : t("tags.addPlaceholder")}
            </option>
            {tagsAvailableToAdd.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </FieldSelect>
          {tagsError ? <p className="mt-1.5 text-xs text-amber-400">{tagsError}</p> : null}
        </div>

        <div>
          <SectionLabel icon={<GlobeIcon />}>{t("language.label")}</SectionLabel>
          <FieldSelect value={language} onChange={(e) => onLanguageChange(e.target.value)}>
            {routing.locales.map((loc) => (
              <option key={loc} value={loc}>
                {t(`language.${loc}`)}
              </option>
            ))}
          </FieldSelect>
        </div>

        {canAssign && onWriterChange ? (
          <>
            <div>
              <SectionLabel icon={<GlobeIcon />}>{t("writer.label")}</SectionLabel>
              <WriterPicker value={writer ?? null} onChange={onWriterChange} />
              <p className="mt-1.5 text-xs text-[var(--tott-muted)]">{t("writer.hint")}</p>
            </div>
            {onAuthorUserChange ? (
              <div>
                <SectionLabel icon={<GlobeIcon />}>{t("owner.label")}</SectionLabel>
                {currentOwnerName ? (
                  <p className="mb-1.5 text-xs text-[var(--tott-muted)]">
                    {t("owner.current", { name: currentOwnerName })}
                  </p>
                ) : null}
                <UserPicker value={authorUser ?? null} onChange={onAuthorUserChange} />
                <p className="mt-1.5 text-xs text-[var(--tott-muted)]">{t("owner.hint")}</p>
              </div>
            ) : null}
          </>
        ) : null}

        {onTranslationOfChange ? (
          <div>
            <SectionLabel icon={<GlobeIcon />}>
              {t("translationOf.label")}
            </SectionLabel>
            <TranslationOfPicker
              value={translationOf}
              excludeId={excludeId}
              onChange={onTranslationOfChange}
              labels={{
                label: t("translationOf.label"),
                placeholder: t("translationOf.placeholder"),
                hint: t("translationOf.hint"),
                clear: t("translationOf.clear"),
                none: t("translationOf.none"),
                searching: t("translationOf.searching"),
              }}
            />
          </div>
        ) : null}

        <div>
          <SectionLabel icon={<EyeIcon />}>{t("visibility.label")}</SectionLabel>
          <FieldSelect
            value={visibility}
            onChange={(e) => onVisibilityChange(e.target.value as "public" | "private")}
          >
            <option value="private">{t("visibility.private")}</option>
            <option value="public">{t("visibility.public")}</option>
          </FieldSelect>
        </div>

        <div>
          <SectionLabel icon={<EyeIcon />}>{t("access.label")}</SectionLabel>
          <FieldSelect
            value={accessLevel}
            onChange={(e) =>
              onAccessLevelChange?.(e.target.value as "open" | "preview" | "subscriber" | "paid")
            }
          >
            <option value="open">{t("access.open")}</option>
            <option value="preview">{t("access.preview")}</option>
            <option value="subscriber">{t("access.subscriber")}</option>
            <option value="paid">{t("access.paid")}</option>
          </FieldSelect>
          <p className="mt-1.5 text-xs text-[var(--tott-muted)]">{t(`access.hint.${accessLevel}`)}</p>

          {accessLevel === "preview" ? (
            <input
              type="number"
              min={0}
              value={previewBlockCount ?? ""}
              onChange={(e) =>
                onPreviewBlockCountChange?.(e.target.value === "" ? null : Number(e.target.value))
              }
              placeholder={t("access.previewCountPlaceholder")}
              className={`${FIELD_BASE} mt-2`}
            />
          ) : null}

          {accessLevel === "paid" ? (
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                min={0}
                step="0.01"
                value={price ?? ""}
                onChange={(e) => onPriceChange?.(e.target.value === "" ? null : Number(e.target.value))}
                placeholder={t("access.pricePlaceholder")}
                className={FIELD_BASE}
              />
              <input
                type="text"
                value={currency}
                onChange={(e) => onCurrencyChange?.(e.target.value.toUpperCase())}
                maxLength={3}
                className={`${FIELD_BASE} w-20 text-center`}
              />
            </div>
          ) : null}
        </div>

        <div>
          <SectionLabel icon={<SettingsIcon />}>{t("seo.label")}</SectionLabel>
          <div className="space-y-2.5">
            <div className="rounded-[7.5px] border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2.5">
              <p className="truncate text-sm text-foreground">
                {seoTitle.trim() || t("seo.previewTitlePlaceholder")}
              </p>
              <p className="mt-0.5 truncate text-xs text-[var(--tott-muted)]">{t("seo.previewUrlStub")}</p>
              <p className="mt-1 line-clamp-2 text-xs text-[var(--tott-muted)]">
                {metaDescription.trim() || t("seo.previewPlaceholder")}
              </p>
            </div>
            <input
              type="text"
              value={seoTitle}
              onChange={(e) => onSeoTitleChange(e.target.value)}
              placeholder={t("seo.seoTitlePlaceholder")}
              className={FIELD_BASE}
            />
            <textarea
              value={metaDescription}
              onChange={(e) => onMetaDescriptionChange(e.target.value)}
              placeholder={t("seo.metaDescriptionPlaceholder")}
              rows={2}
              className={`${FIELD_BASE} resize-none`}
            />
          </div>
        </div>
      </div>
    </ChamferedPanel>
  );
}

export const ArticleSettings = ContentSettings;
