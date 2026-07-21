"use client";

import { useState, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { CloudUploadIcon } from "@/components/ui/icons";
import { theme } from "@/lib/theme";
import { useCmsSettings } from "@/hooks/queries/cms";
import { useUpdateCmsSetting } from "@/hooks/mutations/cms";
import { uploadFileToUrl } from "@/services/uploads.service";
import { CmsPreviewFrame } from "@/components/dashboard/admin/editor/preview/CmsPreviewFrame";

type SaveState = "idle" | "saving" | "saved" | "error";

/** Same pattern the branding reader validates against server-side
 *  (`src/lib/nav/cms-nav-links.ts`) — never trust a user-typed color
 *  string into CSS without this check first. */
const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function BrandingTab() {
  const t = useTranslations("Dashboard.cmsBranding");
  const locale = useLocale();
  const [primaryColor, setPrimaryColor] = useState<string>(theme.accentGoldFocus);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [logoDragging, setLogoDragging] = useState(false);
  const [faviconDragging, setFaviconDragging] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedLogoUrl, setSavedLogoUrl] = useState<string | null>(null);
  const [savedFaviconUrl, setSavedFaviconUrl] = useState<string | null>(null);

  const { data: settings } = useCmsSettings();
  const updateMutation = useUpdateCmsSetting({ silent: true });

  // Seed the form fields from the settings query. Render-phase
  // prev-value pattern instead of an effect.
  //
  // Track a *content* signal (serialized branding) rather than the query
  // object's identity. On remount React Query returns the same cached
  // object, so an identity guard (`settings !== prev`) would be false on
  // first render and the seed would be skipped, leaving the form blank
  // over real data. A content signal starts as null (never seeded) and
  // only changes when the server data actually changes.
  const seedSignal = settings
    ? JSON.stringify({ branding: settings.branding ?? null })
    : null;
  const [seededSignal, setSeededSignal] = useState<string | null>(null);
  if (settings && seedSignal !== null && seedSignal !== seededSignal) {
    setSeededSignal(seedSignal);
    const branding = settings.branding as {
      primary_color?: string;
      logo?: string;
      favicon?: string;
    } | undefined;
    if (branding) {
      if (branding.primary_color) setPrimaryColor(branding.primary_color);
      if (branding.logo) {
        setSavedLogoUrl(branding.logo);
        setLogoPreview(branding.logo);
      }
      if (branding.favicon) {
        setSavedFaviconUrl(branding.favicon);
        setFaviconPreview(branding.favicon);
      }
    }
  }

  const handleLogoSelect = (file: File | null) => {
    if (logoPreview && logoPreview !== savedLogoUrl) URL.revokeObjectURL(logoPreview);
    setLogoFile(file);
    setLogoPreview(file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
  };

  const handleFaviconSelect = (file: File | null) => {
    if (faviconPreview && faviconPreview !== savedFaviconUrl) URL.revokeObjectURL(faviconPreview);
    setFaviconFile(file);
    setFaviconPreview(file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
  };

  const handleSave = async () => {
    setSaveState("saving");
    try {
      let logoUrl = savedLogoUrl;
      let faviconUrl = savedFaviconUrl;

      if (logoFile) logoUrl = await uploadFileToUrl(logoFile);
      if (faviconFile) faviconUrl = await uploadFileToUrl(faviconFile);

      updateMutation.mutate(
        {
          key: "branding",
          value: {
            primary_color: primaryColor,
            logo: logoUrl ?? "",
            favicon: faviconUrl ?? "",
          },
        },
        {
          onSuccess: () => {
            setSavedLogoUrl(logoUrl);
            setSavedFaviconUrl(faviconUrl);
            setLogoFile(null);
            setFaviconFile(null);
            setSaveState("saved");
            setTimeout(() => setSaveState("idle"), 2500);
          },
          onError: () => {
            setSaveState("error");
            setTimeout(() => setSaveState("idle"), 3000);
          },
        },
      );
    } catch {
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  };

  // Reject any non-hex string before it ever reaches the preview draft's
  // postMessage payload (the receiving public layout re-validates this
  // independently — see the CSS-var override in src/app/[locale]/layout.tsx
  // — but never forward something invalid in the first place).
  const validColor = HEX_COLOR_PATTERN.test(primaryColor) ? primaryColor : undefined;
  const brandingDraft = {
    primaryColor: validColor,
    // Local file uploads preview from their blob URL before the actual
    // upload/save round-trip; falls back to the last-saved remote URL.
    logoUrl: logoPreview,
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
    <div className="rounded-xl border border-[var(--tott-card-border)] p-6">
      <h3 className="text-sm font-semibold text-foreground">{t("title")}</h3>
      <p className="mt-1 text-xs text-[var(--tott-muted)]">{t("subtitle")}</p>
      <div className="mt-6 space-y-6">
        {/* Logo */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-foreground">{t("logoLabel")}</label>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml,image/gif"
            className="sr-only"
            onChange={(e) => handleLogoSelect(e.target.files?.[0] ?? null)}
          />
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                logoInputRef.current?.click();
              }
            }}
            onClick={() => logoInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              setLogoDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) handleLogoSelect(file);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setLogoDragging(true);
            }}
            onDragLeave={() => setLogoDragging(false)}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors ${
              logoDragging
                ? "border-[var(--tott-accent-gold)] bg-[var(--tott-dash-surface-inset)]"
                : "border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] hover:border-[var(--tott-card-border)]"
            }`}
          >
            {logoPreview ? (
              <div className="relative w-full overflow-hidden rounded">
                {/* User-uploaded blob/remote URL — `unoptimized` skips
                 *  the Next image optimizer (no remotePatterns config
                 *  needed for arbitrary preview sources). */}
                <Image
                  src={logoPreview}
                  alt={t("logoPreviewAlt")}
                  width={240}
                  height={96}
                  unoptimized
                  className="mx-auto max-h-24 w-auto object-contain"
                />
                <p className="mt-2 text-xs text-[var(--tott-muted)]">{logoFile?.name ?? t("savedLogo")}</p>
              </div>
            ) : (
              <>
                <span className="text-[var(--tott-muted)] [&_svg]:h-10 [&_svg]:w-10">
                  <CloudUploadIcon />
                </span>
                <p className="mt-2 text-sm text-foreground">
                  {t("uploadPrompt")}
                </p>
                <p className="mt-1 text-xs text-[var(--tott-muted)]">
                  {t("logoFormats")}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Favicon */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-foreground">{t("faviconLabel")}</label>
          <input
            ref={faviconInputRef}
            type="file"
            accept="image/png,image/x-icon,image/svg+xml,image/gif"
            className="sr-only"
            onChange={(e) => handleFaviconSelect(e.target.files?.[0] ?? null)}
          />
          <div
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                faviconInputRef.current?.click();
              }
            }}
            onClick={() => faviconInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              setFaviconDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFaviconSelect(file);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setFaviconDragging(true);
            }}
            onDragLeave={() => setFaviconDragging(false)}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors ${
              faviconDragging
                ? "border-[var(--tott-accent-gold)] bg-[var(--tott-dash-surface-inset)]"
                : "border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] hover:border-[var(--tott-card-border)]"
            }`}
          >
            {faviconPreview ? (
              <div className="relative w-full overflow-hidden rounded">
                <Image
                  src={faviconPreview}
                  alt={t("faviconPreviewAlt")}
                  width={64}
                  height={64}
                  unoptimized
                  className="mx-auto max-h-16 w-auto object-contain"
                />
                <p className="mt-2 text-xs text-[var(--tott-muted)]">{faviconFile?.name ?? t("savedFavicon")}</p>
              </div>
            ) : (
              <>
                <span className="text-[var(--tott-muted)] [&_svg]:h-10 [&_svg]:w-10">
                  <CloudUploadIcon />
                </span>
                <p className="mt-2 text-sm text-foreground">
                  {t("uploadPrompt")}
                </p>
                <p className="mt-1 text-xs text-[var(--tott-muted)]">
                  {t("faviconFormats")}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Primary Color */}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-foreground">{t("primaryColorLabel")}</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-10 w-14 cursor-pointer rounded border border-[var(--tott-card-border)] bg-transparent p-1"
            />
            <input
              type="text"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="#CBA158"
              className="flex-1 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-4 py-2.5 text-sm text-foreground placeholder:text-[var(--tott-muted)] focus:border-[var(--tott-card-border)] focus:outline-none"
            />
          </div>
        </div>

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          disabled={saveState === "saving"}
          className={`w-full rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
            saveState === "saved"
              ? "border-emerald-600/50 bg-emerald-600/20 text-emerald-400"
              : saveState === "error"
                ? "border-red-600/50 bg-red-600/20 text-red-400"
                : "border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] text-foreground hover:bg-[var(--tott-dash-control-hover)]"
          }`}
        >
          {saveState === "saving"
            ? t("saving")
            : saveState === "saved"
              ? t("saved")
              : saveState === "error"
                ? t("errorRetry")
                : t("save")}
        </button>
      </div>
    </div>

      {/* Live preview — same homepage iframe, fed the draft accent color +
          logo. An invalid color (e.g. "red; }") never reaches this payload —
          validColor is undefined unless it matched the strict hex pattern
          above, so the preview (and the eventual real site, which
          re-validates independently) both fall back to the token instead. */}
      <div className="min-w-0">
        <CmsPreviewFrame
          src={`/${locale}/home?cmsPreview=1`}
          locale={locale}
          urlLabel={`/${locale}/home`}
          draft={brandingDraft}
          messageType="tott:cms-nav-preview"
        />
      </div>
    </div>
  );
}
