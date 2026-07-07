"use client";

import {
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FC,
} from "react";
import { useTranslations } from "next-intl";
import {
  CameraIcon,
  FacebookIcon,
  InstagramIcon,
  LinkIcon,
  PlusIcon,
  TrashIcon,
  TwitterXIcon,
} from "@/components/ui/icons";
import { RichTextEditor, EditorToolbar, EditorRegistryProvider } from "@/components/ui/rich-text";
import { theme } from "@/lib/theme";
import { sanitizeHtml } from "@/lib/sanitize";
import { useAuthUser } from "@/components/providers/AuthProvider";
import { useProfile } from "@/hooks/queries/profile";
import { useUpdateProfile, useUploadAvatar } from "@/hooks/mutations/profile";
import { accountErrorMessage } from "@/services/account.service";
import type { ProfileData } from "@/services/profile.service";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-3 text-sm text-foreground placeholder:text-[var(--tott-muted)] outline-none focus:border-[var(--tott-accent-gold)]";

type SaveState = "idle" | "saving" | "saved" | "error";

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? "h-5 w-5"} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || "?";
}

type PresetKey = "facebook" | "twitter" | "instagram" | "linkedin";

const PRESETS: { key: PresetKey; Icon: FC }[] = [
  { key: "facebook", Icon: FacebookIcon },
  { key: "twitter", Icon: TwitterXIcon },
  { key: "instagram", Icon: InstagramIcon },
  { key: "linkedin", Icon: LinkedInIcon },
];

export function ProfileSettings() {
  const t = useTranslations("Dashboard.adminProfile");
  const photoInputId = useId();
  const authUser = useAuthUser();
  const { data: profile, isPending, isError } = useProfile();
  const updateMutation = useUpdateProfile();
  const uploadMutation = useUploadAvatar();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [biography, setBiography] = useState("");
  const [presetUrls, setPresetUrls] = useState<Record<PresetKey, string>>({
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
  });
  const [extraLinks, setExtraLinks] = useState<{ id: string; url: string }[]>([]);
  const [otherLinkUrl, setOtherLinkUrl] = useState("");
  const [otherFocused, setOtherFocused] = useState(false);

  // `avatarPath` is the stable relative path we persist; `avatarUrl` is what we
  // display (signed URL from the server, or a local blob preview after a pick).
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Seed local form state from the server response once it arrives, using the
  // render-phase prev-value pattern (no effect). Re-seeds if the query refetches.
  const [prevProfile, setPrevProfile] = useState<ProfileData | undefined>(undefined);
  if (profile && profile !== prevProfile) {
    setPrevProfile(profile);
    setFullName(profile.full_name || authUser?.full_name || "");
    setEmail(profile.email || authUser?.email || "");
    setRole(profile.job_title);
    setCompany(profile.company);
    setLocation(profile.location);
    setExternalLink(profile.personal_link);
    setBiography(profile.about);
    setPresetUrls({
      facebook: profile.social_links.facebook,
      twitter: profile.social_links.twitter,
      instagram: profile.social_links.instagram,
      linkedin: profile.social_links.linkedin,
    });
    setOtherLinkUrl(profile.social_links.other);
    setExtraLinks(profile.social_links.extra.map((url) => ({ id: crypto.randomUUID(), url })));
    setAvatarPath(profile.avatar);
    setAvatarUrl(profile.avatar_url);
  }

  const initials = useMemo(
    () => initialsFromName(fullName || authUser?.username || ""),
    [fullName, authUser?.username],
  );

  const revokePreview = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const onPhotoChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      e.target.value = "";
      setPhotoError(null);
      if (!f) return;
      if (!/^image\/(jpeg|png|gif)$/i.test(f.type)) {
        setPhotoError(t("errors.fileType"));
        return;
      }
      if (f.size > MAX_AVATAR_BYTES) {
        setPhotoError(t("errors.maxSize"));
        return;
      }
      // Optimistic local preview.
      revokePreview();
      const url = URL.createObjectURL(f);
      objectUrlRef.current = url;
      setAvatarUrl(url);
      // Upload immediately; persist the returned path on save.
      uploadMutation.mutate(f, {
        onSuccess: (path) => setAvatarPath(path),
        onError: () => setPhotoError(t("uploadError")),
      });
    },
    [revokePreview, t, uploadMutation],
  );

  const clearPreset = useCallback((key: PresetKey) => {
    setPresetUrls((p) => ({ ...p, [key]: "" }));
  }, []);

  const removeExtra = useCallback((id: string) => {
    setExtraLinks((list) => list.filter((x) => x.id !== id));
  }, []);

  const addExtraLink = useCallback(() => {
    setExtraLinks((list) => [...list, { id: crypto.randomUUID(), url: "" }]);
  }, []);

  const handleSave = useCallback(() => {
    setSaveState("saving");
    setSaveError(null);
    const social = JSON.stringify({
      facebook: presetUrls.facebook,
      twitter: presetUrls.twitter,
      instagram: presetUrls.instagram,
      linkedin: presetUrls.linkedin,
      other: otherLinkUrl,
      extra: extraLinks.map((x) => x.url).filter(Boolean),
    });
    updateMutation.mutate(
      {
        full_name: fullName,
        email,
        job_title: role,
        company,
        personal_link: externalLink,
        location,
        about: sanitizeHtml(biography),
        social_links: social,
        ...(avatarPath ? { avatar: avatarPath } : {}),
      },
      {
        onSuccess: () => {
          revokePreview();
          setSaveState("saved");
          window.setTimeout(() => setSaveState("idle"), 2000);
        },
        onError: (e) => {
          const msg = accountErrorMessage(e, t("saveError"));
          setSaveError(/already in use/i.test(msg) ? t("emailInUse") : msg);
          setSaveState("error");
          window.setTimeout(() => setSaveState("idle"), 4000);
        },
      },
    );
  }, [
    presetUrls,
    otherLinkUrl,
    extraLinks,
    fullName,
    email,
    role,
    company,
    externalLink,
    location,
    biography,
    avatarPath,
    updateMutation,
    revokePreview,
    t,
  ]);

  const saveLabel =
    saveState === "saving"
      ? t("saving")
      : saveState === "saved"
        ? t("saved")
        : t("saveChanges");

  return (
    <div className="mx-auto max-w-3xl">
      <div
        className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)]/50 p-6 sm:p-8"
        style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}
      >
        <h1 className="text-xs font-medium uppercase tracking-wide text-[var(--tott-muted)]">
          {t("pageTitle")}
        </h1>

        {isPending ? (
          <p className="mt-6 text-sm text-[var(--tott-muted)]">{t("loading")}</p>
        ) : null}
        {isError ? (
          <p className="mt-6 text-sm text-[var(--tott-dash-negative)]" role="alert">
            {t("loadError")}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-4 border-b border-[var(--tott-card-border)] pb-8 sm:flex-row sm:items-center">
          <div
            className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full text-2xl font-semibold text-[var(--tott-on-accent)] sm:h-28 sm:w-28"
            style={{ backgroundColor: theme.accentGold }}
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- signed URL / blob preview
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <div>
              <input
                id={photoInputId}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                className="sr-only"
                onChange={onPhotoChange}
              />
              <label
                htmlFor={photoInputId}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-[var(--tott-accent-gold)]/60 hover:bg-[var(--tott-dash-control-hover)]"
              >
                <CameraIcon />
                {uploadMutation.isPending ? t("uploading") : t("changePhoto")}
              </label>
            </div>
            <p className="text-xs text-[var(--tott-muted)] sm:max-w-xs">
              {t("photoHint")}
              {photoError ? <span className="mt-1 block text-red-400">{photoError}</span> : null}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs text-[var(--tott-muted)]">{t("fullName")}</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[var(--tott-muted)]">{t("email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[var(--tott-muted)]">{t("role")}</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[var(--tott-muted)]">{t("company")}</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[var(--tott-muted)]">{t("location")}</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-[var(--tott-muted)]">{t("externalLink")}</label>
            <input
              type="text"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              className={inputClass}
              placeholder={t("externalLinkPlaceholder")}
            />
          </div>
        </div>

        <div className="mt-8 border-b border-[var(--tott-card-border)] pb-8">
          <label className="mb-1.5 block text-xs text-[var(--tott-muted)]">{t("biography")}</label>
          <EditorRegistryProvider>
            <div className="mb-2 rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)]">
              <EditorToolbar />
            </div>
            <div className="overflow-hidden rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)]">
              <RichTextEditor value={biography} onChange={setBiography} />
            </div>
          </EditorRegistryProvider>
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-[var(--tott-muted)]">
            {t("socialLinks")}
          </h2>
          <ul className="flex flex-col gap-3">
            {PRESETS.map(({ key, Icon }) => (
              <li
                key={key}
                className="flex items-center gap-3 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-3 py-2 pr-2 sm:gap-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center text-[var(--tott-muted)] [&_svg]:h-[18px] [&_svg]:w-[18px]">
                  <Icon />
                </span>
                <input
                  type="url"
                  value={presetUrls[key]}
                  onChange={(e) => setPresetUrls((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={t(`presets.${key}`)}
                  className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-[var(--tott-muted)]"
                  aria-label={t(`presets.${key}`)}
                />
                <button
                  type="button"
                  onClick={() => clearPreset(key)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[var(--tott-muted)] transition-colors hover:bg-[var(--tott-dash-control-hover)] hover:text-foreground"
                  aria-label={t("removePresetAria", { label: t(`presets.${key}`) })}
                >
                  <TrashIcon />
                </button>
              </li>
            ))}

            <li
              className={`flex items-center gap-3 rounded-lg border bg-[var(--tott-dash-control-bg)] px-3 py-2 pr-2 sm:gap-4 ${
                otherFocused ? "border-[var(--tott-accent-gold)]" : "border-[var(--tott-card-border)]"
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center text-[var(--tott-muted)] [&_svg]:h-[18px] [&_svg]:w-[18px]">
                <LinkIcon />
              </span>
              <input
                type="url"
                value={otherLinkUrl}
                onChange={(e) => setOtherLinkUrl(e.target.value)}
                onFocus={() => setOtherFocused(true)}
                onBlur={() => setOtherFocused(false)}
                placeholder={t("otherLinkPlaceholder")}
                className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-[var(--tott-muted)]"
              />
              <span className="h-9 w-9 shrink-0" aria-hidden />
            </li>

            {extraLinks.map((row) => (
              <li
                key={row.id}
                className="flex items-center gap-3 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-3 py-2 pr-2 sm:gap-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center text-[var(--tott-muted)] [&_svg]:h-[18px] [&_svg]:w-[18px]">
                  <LinkIcon />
                </span>
                <input
                  type="url"
                  value={row.url}
                  onChange={(e) =>
                    setExtraLinks((list) =>
                      list.map((x) => (x.id === row.id ? { ...x, url: e.target.value } : x)),
                    )
                  }
                  placeholder={t("additionalLinkPlaceholder")}
                  className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-[var(--tott-muted)]"
                  aria-label={t("additionalLinkAria")}
                />
                <button
                  type="button"
                  onClick={() => removeExtra(row.id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[var(--tott-muted)] transition-colors hover:bg-[var(--tott-dash-control-hover)] hover:text-foreground"
                  aria-label={t("removeLinkAria")}
                >
                  <TrashIcon />
                </button>
              </li>
            ))}

            <li>
              <button
                type="button"
                onClick={addExtraLink}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-dashed border-[var(--tott-card-border)] bg-transparent px-3 py-3 text-left text-sm text-[var(--tott-muted)] transition-colors hover:border-[var(--tott-accent-gold)]/50 hover:text-foreground"
              >
                <span>{t("addNewLink")}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--tott-dash-gold-text)]">
                  <PlusIcon />
                </span>
              </button>
            </li>
          </ul>
        </div>

        {saveError ? (
          <p className="mt-6 text-sm text-[var(--tott-dash-negative)]" role="alert">
            {saveError}
          </p>
        ) : null}

        <div className="mt-10">
          <button
            type="button"
            onClick={handleSave}
            disabled={saveState === "saving" || uploadMutation.isPending}
            className="w-full rounded-lg py-3.5 text-sm font-semibold text-[var(--tott-on-accent)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: saveState === "error" ? "#ef4444" : theme.accentGold }}
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
