"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { TrashIcon } from "@/components/ui/icons";
import { api } from "@/services/api";
import { uploadArticleAssetKeyAndUrl } from "@/services/uploads.service";
import { mutationToast } from "@/hooks/useMutationToast";

type HeroImage = { key: string; url: string | null };

const ACCENT = "var(--tott-stat-icon)";

const SaveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <path d="M17 21v-8H7v8" />
    <path d="M7 3v5h8" />
  </svg>
);

const UpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M18 15l-6-6-6 6" />
  </svg>
);

const DownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/**
 * Community page hero image rotation — an ordered list of admin-uploaded
 * images that `CommunityHero` crossfades between on the public page. Same
 * `site_settings`-backed read/write pattern as the Guidelines tab. The
 * storage bucket is private, so each image is a `{ key, url }` pair: `key`
 * is the stable object path saved back on write, `url` is a freshly signed
 * link the backend re-signs on every read (and returns immediately from the
 * upload response) — never construct a display URL from the key directly.
 */
export function CommunityHeroImagesPanel() {
  const t = useTranslations("Dashboard.systemSettings");
  const [images, setImages] = useState<HeroImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(() => {
    api
      .get("/admin/system-settings/community-hero-images")
      .then((r: { data: unknown }) => {
        const list = r.data;
        if (Array.isArray(list)) {
          setImages(
            list.filter(
              (v): v is HeroImage =>
                !!v && typeof v === "object" && typeof (v as HeroImage).key === "string",
            ),
          );
        }
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";
      setUploading(true);
      try {
        const uploaded = await mutationToast(() => uploadArticleAssetKeyAndUrl(file), {
          loading: t("heroImages.uploading"),
          success: t("heroImages.uploaded"),
          error: t("heroImages.uploadFailed"),
        });
        setImages((prev) => [...prev, uploaded]);
      } catch {
        // error surfaced via toast
      } finally {
        setUploading(false);
      }
    },
    [t],
  );

  const handleRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMove = (index: number, dir: -1 | 1) => {
    setImages((prev) => moveItem(prev, index, index + dir));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await mutationToast(
        () =>
          api.patch("/admin/system-settings/community-hero-images", {
            images: images.map((img) => img.key),
          }),
        {
          loading: t("saving"),
          success: t("saveChanges"),
        },
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-8 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 sm:p-8">
      <h2 className="text-lg font-bold text-foreground">{t("heroImages.title")}</h2>
      <p className="mt-1 text-sm text-[var(--tott-muted)]">{t("heroImages.subtitle")}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img, i) => (
          <div
            key={`${img.key}-${i}`}
            className="relative overflow-hidden rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)]"
          >
            {img.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={img.url} alt="" className="aspect-[16/9] w-full object-cover" />
            ) : (
              <div className="flex aspect-[16/9] w-full items-center justify-center text-xs text-[var(--tott-muted)]">
                {t("heroImages.previewUnavailable")}
              </div>
            )}
            <div className="flex items-center justify-between gap-2 p-2">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleMove(i, -1)}
                  disabled={i === 0}
                  aria-label={t("heroImages.moveUp")}
                  className="rounded-md border border-[var(--tott-card-border)] p-1.5 text-[var(--tott-muted)] transition-colors hover:text-foreground disabled:opacity-30"
                >
                  <UpIcon />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(i, 1)}
                  disabled={i === images.length - 1}
                  aria-label={t("heroImages.moveDown")}
                  className="rounded-md border border-[var(--tott-card-border)] p-1.5 text-[var(--tott-muted)] transition-colors hover:text-foreground disabled:opacity-30"
                >
                  <DownIcon />
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(i)}
                aria-label={t("heroImages.remove")}
                className="rounded-md border border-[var(--tott-card-border)] p-1.5 text-[var(--tott-muted)] transition-colors hover:text-red-400"
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        ))}

        <UploadSlot uploading={uploading} onChange={handleAdd} label={t("heroImages.addImage")} />
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

export function UploadSlot({
  uploading,
  onChange,
  label,
}: {
  uploading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
}) {
  const id = useId();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <label
      htmlFor={id}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (!file || !inputRef.current) return;
        const dt = new DataTransfer();
        dt.items.add(file);
        inputRef.current.files = dt.files;
        inputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
      }}
      className={[
        "flex aspect-[16/9] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors",
        dragging
          ? "border-[var(--tott-accent-gold)] bg-[var(--tott-accent-gold)]/5"
          : "border-[var(--tott-card-border)] hover:border-[var(--tott-accent-gold)]/50 bg-[var(--tott-dash-input-bg)]",
      ].join(" ")}
    >
      <input
        id={id}
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
        disabled={uploading}
      />
      {uploading ? (
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--tott-card-border)] border-t-[var(--tott-accent-gold)]" />
      ) : (
        <span className="px-4 text-center text-xs font-medium text-[var(--tott-muted)]">{label}</span>
      )}
    </label>
  );
}
