"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { TrashIcon } from "@/components/ui/icons";
import { api } from "@/services/api";
import { uploadArticleAssetKeyAndUrl } from "@/services/uploads.service";
import { mutationToast } from "@/hooks/useMutationToast";
import { UploadSlot } from "./CommunityHeroImagesPanel";

type HeroImage = { key: string; url: string | null };

const ACCENT = "var(--tott-stat-icon)";

const SaveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <path d="M17 21v-8H7v8" />
    <path d="M7 3v5h8" />
  </svg>
);

/**
 * Homepage hero background image — single admin-uploaded image shown behind
 * the homepage hero headline. Same site_settings-backed `{ key, url }`
 * pattern as CommunityHeroImagesPanel, but one image instead of a rotation.
 */
export function HomepageHeroImagePanel() {
  const t = useTranslations("Dashboard.systemSettings");
  const [image, setImage] = useState<HeroImage | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(() => {
    api.get("/admin/system-settings/homepage-hero-image").then((r: { data: unknown }) => {
      const d = r.data as HeroImage | undefined;
      setImage(d && typeof d.key === "string" && d.key ? d : null);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";
      setUploading(true);
      try {
        const uploaded = await mutationToast(() => uploadArticleAssetKeyAndUrl(file), {
          loading: t("homepageHero.uploading"),
          success: t("homepageHero.uploaded"),
          error: t("homepageHero.uploadFailed"),
        });
        setImage(uploaded);
      } catch {
        // error surfaced via toast
      } finally {
        setUploading(false);
      }
    },
    [t],
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      await mutationToast(
        () => api.patch("/admin/system-settings/homepage-hero-image", { key: image?.key ?? "" }),
        { loading: t("saving"), success: t("saveChanges") },
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-8 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 sm:p-8">
      <h2 className="text-lg font-bold text-foreground">{t("homepageHero.title")}</h2>
      <p className="mt-1 text-sm text-[var(--tott-muted)]">{t("homepageHero.subtitle")}</p>

      <div className="mt-6 max-w-md">
        {image?.url ? (
          <div className="relative overflow-hidden rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.url} alt="" className="aspect-[16/9] w-full object-cover" />
            <button
              type="button"
              onClick={() => setImage(null)}
              aria-label={t("homepageHero.remove")}
              className="absolute end-2 top-2 rounded-md border border-[var(--tott-card-border)] bg-black/50 p-1.5 text-white transition-colors hover:text-red-400"
            >
              <TrashIcon />
            </button>
          </div>
        ) : (
          <UploadSlot uploading={uploading} onChange={handleUpload} label={t("homepageHero.addImage")} />
        )}
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-[var(--tott-on-accent)] transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: ACCENT }}
        >
          <SaveIcon />
          {saving ? t("saving") : t("saveChanges")}
        </button>
      </div>
    </div>
  );
}
