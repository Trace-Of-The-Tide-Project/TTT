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
import { theme } from "@/lib/theme";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-3 text-sm text-foreground placeholder:text-gray-500 outline-none focus:border-[#C9A96E]";

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

export function AdminProfileInformation() {
  const t = useTranslations("Dashboard.adminProfile");
  const photoInputId = useId();
  const [fullName, setFullName] = useState("Fadi Barghouti");
  const [email, setEmail] = useState("fadi.b@example.com");
  const [role, setRole] = useState("Lead Web Developer");
  const [company, setCompany] = useState("TechCorp Inc.");
  const [location, setLocation] = useState("Gaza, Palestine State of");
  const [externalLink, setExternalLink] = useState("about.me/fadi-b");
  const [biography, setBiography] = useState(
    "Senior Frontend Developer with 8+ years of experience in React and TypeScript.",
  );
  const [presetUrls, setPresetUrls] = useState<Record<PresetKey, string>>({
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
  });
  const [extraLinks, setExtraLinks] = useState<{ id: string; url: string }[]>([]);
  const [otherLinkUrl, setOtherLinkUrl] = useState("");
  const [otherFocused, setOtherFocused] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

  const initials = useMemo(() => initialsFromName(fullName), [fullName]);

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
      revokePreview();
      const url = URL.createObjectURL(f);
      objectUrlRef.current = url;
      setAvatarPreview(url);
    },
    [revokePreview, t],
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
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <div
        className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)]/50 p-6 sm:p-8"
        style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}
      >
        <h1 className="text-xs font-medium uppercase tracking-wide text-gray-500">{t("pageTitle")}</h1>

        <div className="mt-6 flex flex-col gap-4 border-b border-[var(--tott-card-border)] pb-8 sm:flex-row sm:items-center">
          <div
            className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full text-2xl font-semibold text-[#1a1a1a] sm:h-28 sm:w-28"
            style={{ backgroundColor: theme.accentGold }}
          >
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element -- local blob preview
              <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
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
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-[#C9A96E]/60 hover:bg-[var(--tott-dash-control-hover)]"
              >
                <CameraIcon />
                {t("changePhoto")}
              </label>
            </div>
            <p className="text-xs text-gray-500 sm:max-w-xs">
              {t("photoHint")}
              {photoError ? (
                <span className="mt-1 block text-red-400">{photoError}</span>
              ) : null}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs text-gray-500">{t("fullName")}</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-gray-500">{t("email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-gray-500">{t("role")}</label>
            <input type="text" value={role} onChange={(e) => setRole(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-gray-500">{t("company")}</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-gray-500">{t("location")}</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-gray-500">{t("externalLink")}</label>
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
          <label className="mb-1.5 block text-xs text-gray-500">{t("biography")}</label>
          <textarea
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
            rows={5}
            className={`${inputClass} resize-y`}
          />
        </div>

        <div className="mt-8">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-gray-500">{t("socialLinks")}</h2>
          <ul className="flex flex-col gap-3">
            {PRESETS.map(({ key, Icon }) => (
              <li
                key={key}
                className="flex items-center gap-3 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-3 py-2 pr-2 sm:gap-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center text-gray-400 [&_svg]:h-[18px] [&_svg]:w-[18px]">
                  <Icon />
                </span>
                <input
                  type="url"
                  value={presetUrls[key]}
                  onChange={(e) => setPresetUrls((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={t(`presets.${key}`)}
                  className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-gray-500"
                  aria-label={t(`presets.${key}`)}
                />
                <button
                  type="button"
                  onClick={() => clearPreset(key)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-[var(--tott-dash-control-hover)] hover:text-foreground"
                  aria-label={t("removePresetAria", { label: t(`presets.${key}`) })}
                >
                  <TrashIcon />
                </button>
              </li>
            ))}

            <li
              className={`flex items-center gap-3 rounded-lg border bg-[var(--tott-dash-control-bg)] px-3 py-2 pr-2 sm:gap-4 ${
                otherFocused ? "border-[#C9A96E]" : "border-[var(--tott-card-border)]"
              }`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center text-gray-400 [&_svg]:h-[18px] [&_svg]:w-[18px]">
                <LinkIcon />
              </span>
              <input
                type="url"
                value={otherLinkUrl}
                onChange={(e) => setOtherLinkUrl(e.target.value)}
                onFocus={() => setOtherFocused(true)}
                onBlur={() => setOtherFocused(false)}
                placeholder={t("otherLinkPlaceholder")}
                className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-gray-500"
              />
              <span className="h-9 w-9 shrink-0" aria-hidden />
            </li>

            {extraLinks.map((row) => (
              <li
                key={row.id}
                className="flex items-center gap-3 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-3 py-2 pr-2 sm:gap-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center text-gray-400 [&_svg]:h-[18px] [&_svg]:w-[18px]">
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
                  className="min-w-0 flex-1 border-0 bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-gray-500"
                  aria-label={t("additionalLinkAria")}
                />
                <button
                  type="button"
                  onClick={() => removeExtra(row.id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-[var(--tott-dash-control-hover)] hover:text-foreground"
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
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-dashed border-[var(--tott-card-border)] bg-transparent px-3 py-3 text-left text-sm text-gray-400 transition-colors hover:border-[#C9A96E]/50 hover:text-foreground"
              >
                <span>{t("addNewLink")}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-md text-[#C9A96E]">
                  <PlusIcon />
                </span>
              </button>
            </li>
          </ul>
        </div>

        <div className="mt-10">
          <button
            type="button"
            onClick={handleSave}
            className="w-full rounded-lg py-3.5 text-sm font-semibold text-black transition-opacity hover:opacity-90"
            style={{ backgroundColor: theme.accentGold }}
          >
            {savedFlash ? t("saved") : t("saveChanges")}
          </button>
        </div>
      </div>
    </div>
  );
}
