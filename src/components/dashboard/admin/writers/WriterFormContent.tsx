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
import { useCreateAdminUser } from "@/hooks/mutations/users";
import { uploadArticleAssetPath } from "@/services/uploads.service";
import type { WriterProfilePayload } from "@/services/writers.service";
import type { AdminUserListItem, CreatedAdminUser } from "@/services/users.service";
import { formatApiError } from "@/lib/api/error-message";
import { UserPicker } from "./UserPicker";
import { AvatarUploadZone, ThemesInput } from "./form-controls";

const CREATOR_KINDS = ["musician", "writer", "visual_artist", "filmmaker"] as const;
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
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateTempPassword(): string {
  // Unambiguous alphanumerics (no 0/O/1/l/I), 12 chars.
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]!).join("");
}

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder-gray-500 outline-none focus:border-[var(--tott-gold)]/60 transition-colors";
const labelClass =
  "text-xs font-medium text-[var(--tott-dash-gold-label)] mb-1 block";
const sectionClass =
  "rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-elevated,#111)] p-5 space-y-4";
const sectionHeadingClass =
  "text-[10px] font-semibold uppercase tracking-widest text-[var(--tott-dash-gold-label)]";

type Props = { writerId?: string };

export function WriterFormContent({ writerId }: Props) {
  const t = useTranslations("Dashboard.writersManagement.form");
  const router = useRouter();
  const isEdit = Boolean(writerId);

  const writerQuery = useWriter(writerId);
  const createMutation = useCreateWriterProfile();
  const updateMutation = useUpdateWriterProfile();
  const createUserMutation = useCreateAdminUser();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [seeded, setSeeded] = useState(false);

  // ── User section state (create mode only) ──
  const [userMode, setUserMode] = useState<"existing" | "new">("existing");
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(null);
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const [summaryCopied, setSummaryCopied] = useState(false);
  const [createdUser, setCreatedUser] = useState<CreatedAdminUser | null>(null);
  /** Password the account was actually created with — the summary must show
   * this even if tempPassword was regenerated between attempts. */
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [createdSummary, setCreatedSummary] = useState<{ email: string; password: string } | null>(null);

  useEffect(() => {
    // Generate the password client-side only (avoids SSR/CSR mismatch).
    if (!isEdit && !tempPassword) setTempPassword(generateTempPassword());
  }, [isEdit, tempPassword]);

  // ── Errors ──
  const [userError, setUserError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const busy =
    submitting ||
    avatarUploading ||
    createMutation.isPending ||
    updateMutation.isPending ||
    createUserMutation.isPending;

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
    });
    setSeeded(true);
  }, [isEdit, seeded, writerQuery.data]);

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
        const key = await uploadArticleAssetPath(file);
        setForm((prev) => ({ ...prev, avatar_url: key }));
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
    };
  };

  const validate = (): boolean => {
    setUserError(null);
    setFieldError(null);
    setSubmitError(null);
    if (!isEdit) {
      if (userMode === "existing" && !selectedUser) {
        setUserError(t("errors.userRequired"));
        return false;
      }
      if (userMode === "new") {
        if (!newFullName.trim()) {
          setUserError(t("errors.fullNameRequired"));
          return false;
        }
        if (!EMAIL_RE.test(newEmail.trim())) {
          setUserError(t("errors.emailRequired"));
          return false;
        }
        if (tempPassword.length < 6) {
          setUserError(t("errors.passwordTooShort"));
          return false;
        }
      }
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
          () => updateMutation.mutateAsync({ writerId, payload: buildPayload() }),
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
      let handoffPassword: string | null = null;
      if (userMode === "existing") {
        userId = selectedUser?.id ?? null;
      } else if (
        createdUser &&
        createdUser.email?.toLowerCase() === newEmail.trim().toLowerCase()
      ) {
        // This account was already created by a previous attempt — reuse it
        // so retries never duplicate the user.
        userId = createdUser.id;
        handoffPassword = createdPassword;
      } else {
        try {
          const created = await createUserMutation.mutateAsync({
            full_name: newFullName.trim(),
            email: newEmail.trim(),
            password: tempPassword,
          });
          setCreatedUser(created);
          setCreatedPassword(tempPassword);
          userId = created.id;
          handoffPassword = tempPassword;
        } catch (err) {
          setUserError(formatApiError(err, t("errors.createUserFailed")));
          return;
        }
      }
      if (!userId) {
        setUserError(t("errors.userRequired"));
        return;
      }

      try {
        await mutationToast(
          () => createMutation.mutateAsync({ ...buildPayload(), user_id: userId }),
          {
            loading: t("saving"),
            success: t("toasts.created"),
            error: t("errors.saveFailed"),
          },
        );
        if (userMode === "new") {
          setCreatedSummary({
            email: newEmail.trim(),
            password: handoffPassword ?? tempPassword,
          });
        } else {
          router.push("/admin/writers");
        }
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

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — user can select the text manually */
    }
  };

  const copySummaryPassword = async () => {
    if (!createdSummary) return;
    try {
      await navigator.clipboard.writeText(createdSummary.password);
      setSummaryCopied(true);
      window.setTimeout(() => setSummaryCopied(false), 2000);
    } catch {
      /* clipboard unavailable — user can select the text manually */
    }
  };

  if (isEdit && writerQuery.isPending) {
    return <div className="my-4 mx-10 text-sm text-gray-500">{t("loading")}</div>;
  }

  if (isEdit && !writerQuery.data) {
    return (
      <div className="my-4 mx-10">
        <Link
          href="/admin/writers"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-foreground transition-colors mb-5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {t("backToList")}
        </Link>
        <p className="text-sm text-gray-500">{t("notFound")}</p>
      </div>
    );
  }

  const linkedUserLabel = isEdit
    ? writerQuery.data?.user?.full_name?.trim() ||
      writerQuery.data?.user?.username?.trim() ||
      writerQuery.data?.user_id ||
      "—"
    : null;

  const modeButtonClass = (active: boolean) =>
    [
      "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
      active
        ? "border border-[var(--tott-gold)]/60 bg-[var(--tott-gold)]/10 text-[var(--tott-gold)]"
        : "border border-[var(--tott-card-border)] text-gray-400 hover:text-foreground",
    ].join(" ");

  return (
    <div className="my-4 mx-auto px-10 pb-12 max-w-4xl">
      <Link
        href="/admin/writers"
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-foreground transition-colors mb-5"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {t("backToList")}
      </Link>

      <h1 className="mb-6 text-xl font-semibold text-foreground">
        {isEdit ? t("editTitle") : t("createTitle")}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
        {/* ── Section 1: Writer account ── */}
        <div className={sectionClass}>
          <p className={sectionHeadingClass}>{t("sections.account")}</p>

          {isEdit ? (
            <div>
              <label className={labelClass}>{t("account.linkedUser")}</label>
              <p className="text-sm text-foreground">{linkedUserLabel}</p>
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setUserMode("existing"); setUserError(null); }}
                  className={modeButtonClass(userMode === "existing")}
                >
                  {t("account.modeExisting")}
                </button>
                <button
                  type="button"
                  onClick={() => { setUserMode("new"); setUserError(null); }}
                  className={modeButtonClass(userMode === "new")}
                >
                  {t("account.modeNew")}
                </button>
              </div>

              {userMode === "existing" && (
                <UserPicker
                  value={selectedUser}
                  onChange={(u) => { setSelectedUser(u); setUserError(null); }}
                  disabled={busy}
                />
              )}

              {userMode === "new" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{t("account.fullName")} *</label>
                      <input
                        type="text"
                        className={inputClass}
                        value={newFullName}
                        onChange={(e) => setNewFullName(e.target.value)}
                        disabled={busy}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{t("account.email")} *</label>
                      <input
                        type="email"
                        className={inputClass}
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        disabled={busy}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>{t("account.tempPassword")}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        className={`${inputClass} font-mono`}
                        value={tempPassword}
                      />
                      <button
                        type="button"
                        onClick={copyPassword}
                        className="shrink-0 rounded-lg border border-[var(--tott-card-border)] px-3 py-2 text-xs text-gray-300 hover:text-foreground"
                      >
                        {copied ? t("account.copied") : t("account.copy")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setTempPassword(generateTempPassword())}
                        disabled={busy || (createdUser !== null && (createdUser.email?.toLowerCase() ?? "") === newEmail.trim().toLowerCase())}
                        className="shrink-0 rounded-lg border border-[var(--tott-card-border)] px-3 py-2 text-xs text-gray-300 hover:text-foreground disabled:opacity-40"
                      >
                        {t("account.regenerate")}
                      </button>
                    </div>
                    <p className="mt-1 text-[10px] text-gray-500">
                      {t("account.tempPasswordHint")}
                    </p>
                  </div>
                </div>
              )}

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
              onChange={set("avatar_url")}
              placeholder="https://…"
            />
            <p className="mt-1 text-[10px] text-gray-500">{t("fields.avatarUrlFallback")}</p>
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
              className="h-4 w-4 accent-[var(--tott-gold)]"
            />
            {t("fields.featured")}
          </label>
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
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--tott-gold)]/60 bg-[var(--tott-gold)]/10 px-5 py-2 text-sm font-medium text-[var(--tott-gold)] hover:bg-[var(--tott-gold)]/20 disabled:opacity-40 transition-colors"
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
            className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:text-foreground hover:bg-white/5 transition-colors"
          >
            {t("cancel")}
          </Link>
        </div>
      </form>

      {createdSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div
            className="w-full max-w-sm rounded-xl border border-[var(--tott-card-border)] p-6 shadow-xl"
            style={{ backgroundColor: "var(--tott-dash-bg, #1a1a1a)" }}
          >
            <h2 className="mb-2 text-base font-semibold text-foreground">
              {t("created.title")}
            </h2>
            <p className="mb-4 text-sm text-gray-400">
              {t("created.description")}
            </p>
            <div className="space-y-3 mb-5">
              <div>
                <label className={labelClass}>{t("account.email")}</label>
                <p className="text-sm text-foreground">{createdSummary.email}</p>
              </div>
              <div>
                <label className={labelClass}>{t("account.tempPassword")}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    className={`${inputClass} font-mono`}
                    value={createdSummary.password}
                  />
                  <button
                    type="button"
                    onClick={copySummaryPassword}
                    className="shrink-0 rounded-lg border border-[var(--tott-card-border)] px-3 py-2 text-xs text-gray-300 hover:text-foreground"
                  >
                    {summaryCopied ? t("account.copied") : t("account.copy")}
                  </button>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.push("/admin/writers")}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--tott-gold)]/60 bg-[var(--tott-gold)]/10 px-5 py-2 text-sm font-medium text-[var(--tott-gold)] hover:bg-[var(--tott-gold)]/20 transition-colors"
            >
              {t("created.continue")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
