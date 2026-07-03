"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { mutationToast } from "@/hooks/useMutationToast";
import { useWriter } from "@/hooks/queries/writers";
import {
  useCreateWriterProfile,
  useUpdateWriterProfile,
} from "@/hooks/mutations/writers";
import { uploadArticleAssetKeyAndUrl } from "@/services/uploads.service";
import type { WriterProfilePayload } from "@/services/writers.service";
import type { AdminUserListItem } from "@/services/users.service";
import { formatApiError } from "@/lib/api/error-message";
import { TranslationsPanel } from "@/components/dashboard/admin/translations";
import { UserPicker } from "./UserPicker";
import { AvatarUploadZone, ThemesInput } from "./form-controls";

const CREATOR_KINDS = ["musician", "writer", "visual_artist", "filmmaker", "photographer", "translator", "editor", "illustrator"] as const;
type CreatorKind = (typeof CREATOR_KINDS)[number];

type FormState = {
  pen_name: string;
  headline: string;
  bio_long: string;
  avatar_url: string;
  featured: boolean;
  creator_kind: "" | CreatorKind;
  location: string;
  themes: string[];
  quote: string;
  collaborations: string;
  recognition: string;
  monthly_goal: string;
  social_website: string;
  social_twitter: string;
  social_instagram: string;
  social_youtube: string;
  language: string;
};

const EMPTY: FormState = {
  pen_name: "",
  headline: "",
  bio_long: "",
  avatar_url: "",
  featured: false,
  creator_kind: "",
  location: "",
  themes: [],
  quote: "",
  collaborations: "",
  recognition: "",
  monthly_goal: "",
  social_website: "",
  social_twitter: "",
  social_instagram: "",
  social_youtube: "",
  language: "en",
};

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder-[var(--tott-muted)] outline-none focus:border-[var(--tott-accent-gold)]/60 transition-colors";
const labelClass =
  "text-xs font-medium text-[var(--tott-dash-gold-label)] mb-1 block";
const sectionClass =
  "rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] p-5 space-y-4";
const sectionHeadingClass =
  "text-[10px] font-semibold uppercase tracking-widest text-[var(--tott-dash-gold-label)]";

type Props = {
  writerId?: string;
  /** Create-mode only: ISO code for the version being created (from
   * `?language=`). */
  createLanguage?: string;
  /** Create-mode only: id of the writer this is a translation of (from
   * `?translation_of=`). */
  translationOf?: string;
};

export function WriterFormContent({
  writerId,
  createLanguage,
  translationOf,
}: Props) {
  const t = useTranslations("Dashboard.writersManagement.form");
  const tTr = useTranslations("Dashboard.translations");
  const router = useRouter();
  const isEdit = Boolean(writerId);
  const isTranslation = !isEdit && Boolean(translationOf);

  const writerQuery = useWriter(writerId);
  // Source writer to clone fields from when adding a translation.
  const sourceQuery = useWriter(isTranslation ? translationOf : undefined);
  const createMutation = useCreateWriterProfile();
  const updateMutation = useUpdateWriterProfile();

  const [form, setForm] = useState<FormState>(() => ({
    ...EMPTY,
    language: (createLanguage || "en").trim() || "en",
  }));
  const [seeded, setSeeded] = useState(false);
  const [translationSeeded, setTranslationSeeded] = useState(false);

  // ── User section state (create mode only) ──
  // A writer profile links to an existing user account; admins do not create
  // login accounts from here.
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);

  // ── Errors ──
  const [userError, setUserError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [avatarUploading, setAvatarUploading] = useState(false);
  // Signed display URL for a just-uploaded avatar. We persist the stable
  // storage key in `avatar_url`, but that key resolves to the private bucket
  // (403) until the backend re-signs it on read — so the preview uses the
  // signed URL the upload returned. Cleared when the key is edited by hand.
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const busy =
    submitting ||
    avatarUploading ||
    createMutation.isPending ||
    updateMutation.isPending;

  // ── Edit-mode seeding ──
  useEffect(() => {
    if (!isEdit || seeded || !writerQuery.data) return;
    const w = writerQuery.data;
    const links = w.social_links ?? {};
    setForm({
      pen_name: w.pen_name ?? "",
      headline: w.headline ?? "",
      bio_long: w.bio_long ?? "",
      avatar_url: w.avatar_url ?? "",
      featured: Boolean(w.featured),
      creator_kind: (w.creator_kind ?? "") as FormState["creator_kind"],
      location: w.location ?? "",
      themes: Array.isArray(w.themes) ? w.themes : [],
      quote: w.quote ?? "",
      collaborations: w.collaborations ?? "",
      recognition: w.recognition ?? "",
      monthly_goal: w.monthly_goal != null ? String(w.monthly_goal) : "",
      social_website: links.website ?? "",
      social_twitter: links.twitter ?? "",
      social_instagram: links.instagram ?? "",
      social_youtube: links.youtube ?? "",
      language: (w.language ?? "en").trim() || "en",
    });
    setSeeded(true);
  }, [isEdit, seeded, writerQuery.data]);

  // ── Translation-create seeding ──
  // Clone the source writer's fields so the admin only translates the text,
  // not re-enter avatars / links / themes. The user account is inherited at
  // submit (a translation belongs to the same writer), so no UserPicker here.
  useEffect(() => {
    if (!isTranslation || translationSeeded || !sourceQuery.data) return;
    const w = sourceQuery.data;
    const links = w.social_links ?? {};
    setForm((prev) => ({
      ...prev,
      pen_name: w.pen_name ?? "",
      headline: w.headline ?? "",
      bio_long: w.bio_long ?? "",
      avatar_url: w.avatar_url ?? "",
      featured: Boolean(w.featured),
      creator_kind: (w.creator_kind ?? "") as FormState["creator_kind"],
      location: w.location ?? "",
      themes: Array.isArray(w.themes) ? w.themes : [],
      quote: w.quote ?? "",
      collaborations: w.collaborations ?? "",
      recognition: w.recognition ?? "",
      monthly_goal: w.monthly_goal != null ? String(w.monthly_goal) : "",
      social_website: links.website ?? "",
      social_twitter: links.twitter ?? "",
      social_instagram: links.instagram ?? "",
      social_youtube: links.youtube ?? "",
      // keep prev.language — that's the target language from ?language=
    }));
    setTranslationSeeded(true);
  }, [isTranslation, translationSeeded, sourceQuery.data]);

  const set = useCallback(
    (field: keyof FormState) =>
      (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
      ) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value })),
    [],
  );

  const handleAvatarUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setSubmitError(null);
      setAvatarUploading(true);
      try {
        // Persist the STABLE storage key — signed URLs expire (book cover bug).
        // Keep the signed `url` for an immediate preview (the key's public-bucket
        // URL 403s until the backend re-signs it on read).
        const { key, url } = await uploadArticleAssetKeyAndUrl(file);
        setForm((prev) => ({ ...prev, avatar_url: key }));
        setAvatarPreview(url);
      } catch {
        setSubmitError(t("errors.avatarUploadFailed"));
      } finally {
        setAvatarUploading(false);
      }
    },
    [t],
  );

  const buildPayload = (): WriterProfilePayload => {
    const links: Record<string, string> = {};
    if (form.social_website.trim()) links.website = form.social_website.trim();
    if (form.social_twitter.trim()) links.twitter = form.social_twitter.trim();
    if (form.social_instagram.trim()) links.instagram = form.social_instagram.trim();
    if (form.social_youtube.trim()) links.youtube = form.social_youtube.trim();
    return {
      pen_name: form.pen_name.trim() || null,
      headline: form.headline.trim() || null,
      bio_long: form.bio_long.trim() || null,
      avatar_url: form.avatar_url.trim() || null,
      featured: form.featured,
      social_links: Object.keys(links).length > 0 ? links : null,
      creator_kind: form.creator_kind || null,
      location: form.location.trim() || null,
      themes: form.themes.length > 0 ? form.themes : null,
      quote: form.quote.trim() || null,
      collaborations: form.collaborations.trim() || null,
      recognition: form.recognition.trim() || null,
      monthly_goal: form.monthly_goal.trim()
        ? Number(form.monthly_goal)
        : null,
      // Translation-group fields — create-only. `prunePayload` drops them
      // when null (e.g. edit mode).
      language: !isEdit ? form.language.trim() || null : null,
      translation_of: isTranslation ? (translationOf ?? null) : null,
    };
  };

  // The backend rejects the request with a DB error ("Invalid query or data
  // format") when optional columns receive `null`. Both POST and PATCH are
  // partial here, so send only fields that actually carry a value: drop null /
  // undefined / empty-string / empty-array / empty-object entries. Booleans and
  // numbers — including `false` and `0` — are intentionally kept.
  const prunePayload = (
    payload: WriterProfilePayload,
  ): Partial<WriterProfilePayload> => {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(payload)) {
      if (value === null || value === undefined) continue;
      if (typeof value === "string" && value.trim() === "") continue;
      if (Array.isArray(value) && value.length === 0) continue;
      if (
        typeof value === "object" &&
        !Array.isArray(value) &&
        Object.keys(value as object).length === 0
      ) {
        continue;
      }
      out[key] = value;
    }
    return out as Partial<WriterProfilePayload>;
  };

  const validate = (): boolean => {
    setUserError(null);
    setFieldError(null);
    setSubmitError(null);
    // A translation inherits the original's account — no user step to validate.
    if (!isEdit && !isTranslation && !selectedUser) {
      setUserError(t("errors.userRequired"));
      return false;
    }
    if (form.monthly_goal.trim()) {
      const goal = Number(form.monthly_goal);
      if (!Number.isFinite(goal) || goal < 0) {
        setFieldError(t("errors.monthlyGoalInvalid"));
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !validate()) return;
    setSubmitting(true);
    try {
      if (isEdit && writerId) {
        await mutationToast(
          () =>
            updateMutation.mutateAsync({
              writerId,
              payload: prunePayload(buildPayload()),
            }),
          {
            loading: t("saving"),
            success: t("toasts.updated"),
            error: t("errors.saveFailed"),
          },
        );
        router.push("/admin/writers");
        return;
      }

      // Create mode — resolve the user_id strictly per-mode.
      let userId: string | null = null;
      if (isTranslation) {
        // A translation belongs to the same writer as the original.
        userId =
          sourceQuery.data?.user_id ?? sourceQuery.data?.user?.id ?? null;
      } else {
        userId = selectedUser?.id ?? null;
      }
      if (!userId) {
        setUserError(t("errors.userRequired"));
        return;
      }

      try {
        await mutationToast(
          () =>
            createMutation.mutateAsync({
              ...prunePayload(buildPayload()),
              user_id: userId,
            }),
          {
            loading: t("saving"),
            success: t("toasts.created"),
            error: t("errors.saveFailed"),
          },
        );
        router.push("/admin/writers");
      } catch (err) {
        const msg = formatApiError(err, t("errors.saveFailed"));
        if (/already exists/i.test(msg)) {
          setUserError(t("errors.duplicateProfile"));
        }
        // Non-duplicate errors are already shown by mutationToast's error toast.
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (isEdit && writerQuery.isPending) {
    return <div className="my-4 mx-10 text-sm text-[var(--tott-muted)]">{t("loading")}</div>;
  }

  if (isEdit && !writerQuery.data) {
    return (
      <div className="my-4 mx-10">
        <Link
          href="/admin/writers"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--tott-muted)] hover:text-foreground transition-colors mb-5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {t("backToList")}
        </Link>
        <p className="text-sm text-[var(--tott-muted)]">{t("notFound")}</p>
      </div>
    );
  }

  const linkedUserLabel = isEdit
    ? writerQuery.data?.user?.full_name?.trim() ||
      writerQuery.data?.user?.username?.trim() ||
      writerQuery.data?.user_id ||
      "—"
    : null;

  return (
    <div className="my-4 mx-auto px-10 pb-12 max-w-4xl">
      <Link
        href="/admin/writers"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--tott-muted)] hover:text-foreground transition-colors mb-5"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {t("backToList")}
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">
          {isEdit ? t("editTitle") : t("createTitle")}
        </h1>
        {isEdit && writerId ? (
          <TranslationsPanel
            contentType="writer"
            contentId={writerId}
            currentLanguage={form.language}
          />
        ) : null}
      </div>

      {isTranslation ? (
        <div className="mb-6 max-w-2xl mx-auto rounded-xl border border-[var(--tott-accent-gold)]/30 bg-[var(--tott-accent-gold)]/5 px-4 py-3 text-sm">
          <p className="font-medium text-[var(--tott-dash-gold-text)]">
            {tTr.has(`languages.${form.language}`)
              ? `${tTr(`languages.${form.language}`)} — ${t("translation.banner")}`
              : t("translation.banner")}
          </p>
          {sourceQuery.data ? (
            <p className="mt-1 text-[var(--tott-muted)]">
              {t("translation.ofOriginal", {
                name:
                  sourceQuery.data.pen_name?.trim() ||
                  sourceQuery.data.user?.full_name?.trim() ||
                  "—",
              })}
            </p>
          ) : null}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
        {/* ── Section 1: Writer account ── */}
        <div className={sectionClass}>
          <p className={sectionHeadingClass}>{t("sections.account")}</p>

          {isEdit ? (
            <div>
              <label className={labelClass}>{t("account.linkedUser")}</label>
              <p className="text-sm text-foreground">{linkedUserLabel}</p>
            </div>
          ) : isTranslation ? (
            <div>
              <label className={labelClass}>{t("account.linkedUser")}</label>
              <p className="text-sm text-foreground">
                {sourceQuery.data?.user?.full_name?.trim() ||
                  sourceQuery.data?.user?.username?.trim() ||
                  sourceQuery.data?.user_id ||
                  "—"}
              </p>
              <p className="mt-1 text-[11px] text-[var(--tott-muted)]">
                {t("translation.sameAccount")}
              </p>
            </div>
          ) : (
            <>
              <UserPicker
                value={selectedUser}
                onChange={(u) => { setSelectedUser(u); setUserError(null); }}
                disabled={busy}
              />

              {userError && (
                <p className="text-xs text-red-400">{userError}</p>
              )}
            </>
          )}
        </div>

        {/* ── Section 2: Identity ── */}
        <div className={sectionClass}>
          <p className={sectionHeadingClass}>{t("sections.identity")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t("fields.penName")}</label>
              <input type="text" className={inputClass} placeholder={t("fields.penNamePlaceholder")} value={form.pen_name} onChange={set("pen_name")} />
            </div>
            <div>
              <label className={labelClass}>{t("fields.headline")}</label>
              <input type="text" className={inputClass} placeholder={t("fields.headlinePlaceholder")} value={form.headline} onChange={set("headline")} />
            </div>
            <div>
              <label className={labelClass}>{t("fields.creatorKind")}</label>
              <select className={inputClass} value={form.creator_kind} onChange={set("creator_kind")}>
                <option value="">{t("kinds.none")}</option>
                {CREATOR_KINDS.map((k) => (
                  <option key={k} value={k}>{t(`kinds.${k}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t("fields.location")}</label>
              <input type="text" className={inputClass} placeholder={t("fields.locationPlaceholder")} value={form.location} onChange={set("location")} />
            </div>
          </div>
          <div>
            <label className={labelClass}>{t("fields.avatar")}</label>
            <AvatarUploadZone
              value={form.avatar_url}
              previewSrc={avatarPreview}
              uploading={avatarUploading}
              onChange={handleAvatarUpload}
              labels={{
                uploading: t("upload.uploading"),
                click: t("upload.click"),
                hint: t("upload.hint"),
                change: t("account.clear"),
              }}
            />
            <input
              type="text"
              className={`${inputClass} mt-2`}
              value={form.avatar_url}
              onChange={(e) => {
                // A hand-typed ref previews via the resolver, not the stale
                // signed URL from a prior upload.
                setAvatarPreview(null);
                setForm((prev) => ({ ...prev, avatar_url: e.target.value }));
              }}
              placeholder="https://…"
            />
            <p className="mt-1 text-[10px] text-[var(--tott-muted)]">{t("fields.avatarUrlFallback")}</p>
          </div>
        </div>

        {/* ── Section 3: About ── */}
        <div className={sectionClass}>
          <p className={sectionHeadingClass}>{t("sections.about")}</p>
          <div>
            <label className={labelClass}>{t("fields.bioLong")}</label>
            <textarea className={`${inputClass} min-h-[120px]`} value={form.bio_long} onChange={set("bio_long")} />
          </div>
          <div>
            <label className={labelClass}>{t("fields.quote")}</label>
            <textarea className={`${inputClass} min-h-[60px]`} value={form.quote} onChange={set("quote")} />
          </div>
          <div>
            <label className={labelClass}>{t("fields.themes")}</label>
            <ThemesInput
              value={form.themes}
              onChange={(themes) => setForm((prev) => ({ ...prev, themes }))}
              placeholder={t("fields.themesPlaceholder")}
              disabled={busy}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t("fields.collaborations")}</label>
              <input type="text" className={inputClass} placeholder={t("fields.collaborationsPlaceholder")} value={form.collaborations} onChange={set("collaborations")} />
            </div>
            <div>
              <label className={labelClass}>{t("fields.recognition")}</label>
              <input type="text" className={inputClass} placeholder={t("fields.recognitionPlaceholder")} value={form.recognition} onChange={set("recognition")} />
            </div>
          </div>
        </div>

        {/* ── Section 4: Support & visibility ── */}
        <div className={sectionClass}>
          <p className={sectionHeadingClass}>{t("sections.support")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t("fields.monthlyGoal")}</label>
              <input type="number" min="0" step="1" className={inputClass} value={form.monthly_goal} onChange={set("monthly_goal")} />
              {fieldError && <p className="mt-1 text-xs text-red-400">{fieldError}</p>}
            </div>
            <div>
              <label className={labelClass}>{t("fields.website")}</label>
              <input type="url" className={inputClass} placeholder="https://…" value={form.social_website} onChange={set("social_website")} />
            </div>
            <div>
              <label className={labelClass}>{t("fields.twitter")}</label>
              <input type="url" className={inputClass} placeholder="https://x.com/…" value={form.social_twitter} onChange={set("social_twitter")} />
            </div>
            <div>
              <label className={labelClass}>{t("fields.instagram")}</label>
              <input type="url" className={inputClass} placeholder="https://instagram.com/…" value={form.social_instagram} onChange={set("social_instagram")} />
            </div>
            <div>
              <label className={labelClass}>{t("fields.youtube")}</label>
              <input type="url" className={inputClass} placeholder="https://youtube.com/…" value={form.social_youtube} onChange={set("social_youtube")} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, featured: e.target.checked }))
              }
              className="h-4 w-4 accent-[var(--tott-accent-gold)]"
            />
            {t("fields.featured")}
          </label>
          {/* Make the board-visibility consequence explicit — otherwise a new
              writer is created but never appears publicly, which reads as a bug. */}
          <p className="mt-1 text-[11px] text-[var(--tott-muted)]">
            {t("fields.featuredHint")}
          </p>
        </div>

        {submitError && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-400">
            {submitError}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--tott-accent-gold)]/60 bg-[var(--tott-accent-gold)]/10 px-5 py-2 text-sm font-medium text-[var(--tott-dash-gold-text)] hover:bg-[var(--tott-accent-gold)]/20 disabled:opacity-40 transition-colors"
          >
            {busy && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {busy
              ? isEdit
                ? t("saving")
                : t("creating")
              : isEdit
                ? t("save")
                : t("create")}
          </button>
          <Link
            href="/admin/writers"
            className="rounded-lg px-4 py-2 text-sm text-[var(--tott-muted)] hover:text-foreground hover:bg-white/5 transition-colors"
          >
            {t("cancel")}
          </Link>
        </div>
      </form>
    </div>
  );
}
