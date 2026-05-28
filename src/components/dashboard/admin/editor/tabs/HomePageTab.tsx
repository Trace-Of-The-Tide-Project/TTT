"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  EyeIcon,
  GripVerticalIcon,
  CloudUploadIcon,
  PlusIcon,
  RefreshCwIcon,
} from "@/components/ui/icons";
import { useCmsHomepage } from "@/hooks/queries/cms";
import {
  useToggleCmsSection,
  useUpdateCmsSection,
} from "@/hooks/mutations/cms";
import type { CmsSection } from "@/services/cms.service";

type HeroConfig = {
  headline: string;
  subheadline: string;
  primary_cta: string;
  secondary_cta: string;
};

function parseHeroConfig(section: CmsSection | undefined): HeroConfig {
  const cfg = section?.config ?? {};
  return {
    headline: (cfg.headline as string) ?? "",
    subheadline: (cfg.subheadline as string) ?? "",
    primary_cta: (cfg.primary_cta as string) ?? "",
    secondary_cta: (cfg.secondary_cta as string) ?? "",
  };
}

export function HomePageTab() {
  const { data: homepage } = useCmsHomepage();
  const toggleSectionMutation = useToggleCmsSection();
  const updateSectionMutation = useUpdateCmsSection();
  const saving = updateSectionMutation.isPending;

  const pageId = homepage?.id ?? null;
  const sections: CmsSection[] = homepage
    ? [...homepage.sections].sort((a, b) => a.section_order - b.section_order)
    : [];

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [heroConfig, setHeroConfig] = useState<HeroConfig>({
    headline: "",
    subheadline: "",
    primary_cta: "",
    secondary_cta: "",
  });
  const [savedHeroConfig, setSavedHeroConfig] = useState<HeroConfig>({
    headline: "",
    subheadline: "",
    primary_cta: "",
    secondary_cta: "",
  });

  // Seed selection + hero config once the homepage query loads.
  // Render-phase prev-value pattern instead of an effect.
  const [prevHomepage, setPrevHomepage] = useState(homepage);
  if (homepage && homepage !== prevHomepage) {
    setPrevHomepage(homepage);
    const sorted = [...homepage.sections].sort((a, b) => a.section_order - b.section_order);
    const heroSection = sorted.find((s) => s.section_type === "hero");
    if (heroSection) {
      setSelectedSectionId((id) => id ?? heroSection.id);
      const cfg = parseHeroConfig(heroSection);
      setHeroConfig(cfg);
      setSavedHeroConfig(cfg);
    } else if (sorted.length > 0) {
      setSelectedSectionId((id) => id ?? sorted[0].id);
    }
  }

  const handleToggleVisibility = (section: CmsSection) => {
    if (!pageId) return;
    toggleSectionMutation.mutate({ pageId, sectionId: section.id });
  };

  const handleFileSelect = (file: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setBackgroundFile(file);
    if (file && file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const heroSection = sections.find((s) => s.section_type === "hero");
  const selectedSection = sections.find((s) => s.id === selectedSectionId);
  const showHeroForm = selectedSection?.section_type === "hero";

  const handleSaveHero = () => {
    if (!pageId || !heroSection) return;
    updateSectionMutation.mutate(
      {
        pageId,
        sectionId: heroSection.id,
        data: { config: JSON.stringify(heroConfig) },
      },
      { onSuccess: () => setSavedHeroConfig(heroConfig) },
    );
  };

  const handleReset = () => setHeroConfig(savedHeroConfig);

  return (
    <div className="grid gap-9 lg:grid-cols-[320px_1fr]">
      {/* Sections sidebar */}
      <div className="rounded-xl border border-[var(--tott-card-border)] p-8 px-10">
        <h3 className="text-sm font-semibold text-foreground">Quick Actions</h3>
        <p className="mt-1 text-xs text-gray-500">Drag to reorder, toggle visibility.</p>
        <div className="mt-4 flex w-full flex-col gap-4">
          {sections.map((section) => {
            const isSelected = section.id === selectedSectionId;
            return (
              <div
                key={section.id}
                onClick={() => setSelectedSectionId(section.id)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-5 transition-colors hover:bg-[var(--tott-dash-control-hover)] ${
                  isSelected ? "border-[#C9A96E]" : "border-[var(--tott-card-border)]"
                }`}
              >
                <span
                  className={`cursor-grab hover:opacity-80 ${isSelected ? "text-[#C9A96E]" : "text-gray-500"}`}
                  aria-label="Reorder"
                >
                  <GripVerticalIcon />
                </span>
                <span
                  className={`flex-1 text-sm font-medium ${isSelected ? "text-[#C9A96E]" : "text-foreground"}`}
                >
                  {section.title}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleVisibility(section);
                  }}
                  className={`rounded p-1.5 transition-colors hover:bg-[var(--tott-dash-ghost-hover)] ${
                    isSelected
                      ? "text-[#C9A96E]"
                      : section.is_visible
                        ? "text-gray-400"
                        : "text-gray-600 opacity-40"
                  }`}
                  aria-label={section.is_visible ? "Hide section" : "Show section"}
                >
                  <span className="[&_svg]:h-4 [&_svg]:w-4">
                    <EyeIcon />
                  </span>
                </button>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--tott-dash-control-bg)] py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)]"
        >
          <span className="[&_svg]:h-4 [&_svg]:w-4">
            <PlusIcon />
          </span>
          Add Section
        </button>
      </div>

      {/* Section editor panel */}
      <div className="rounded-xl border border-[var(--tott-card-border)] p-6">
        {showHeroForm ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Hero Banner</h3>
                <p className="mt-1 text-xs text-gray-500">Edit section content and settings.</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-surface-inset)]"
                >
                  <span className="[&_svg]:h-3.5 [&_svg]:w-3.5">
                    <RefreshCwIcon />
                  </span>
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleSaveHero}
                  disabled={saving}
                  className="rounded-lg border border-[#C9A96E]/40 bg-[#C9A96E]/20 px-3 py-1.5 text-xs font-medium text-[#C9A96E] transition-colors hover:bg-[#C9A96E]/30 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Headline</label>
                <input
                  type="text"
                  placeholder="Discover. Create. Inspire."
                  value={heroConfig.headline}
                  onChange={(e) => setHeroConfig((p) => ({ ...p, headline: e.target.value }))}
                  className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2.5 text-sm text-foreground placeholder-gray-500 focus:border-[#555] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Subheadline</label>
                <textarea
                  placeholder="Join a community of creators, authors, and editors sharing their passion with the world."
                  rows={3}
                  value={heroConfig.subheadline}
                  onChange={(e) => setHeroConfig((p) => ({ ...p, subheadline: e.target.value }))}
                  className="w-full resize-none rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2.5 text-sm text-foreground placeholder-gray-500 focus:border-[#555] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Primary CTA</label>
                <input
                  type="text"
                  placeholder="Contribute now."
                  value={heroConfig.primary_cta}
                  onChange={(e) => setHeroConfig((p) => ({ ...p, primary_cta: e.target.value }))}
                  className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2.5 text-sm text-foreground placeholder-gray-500 focus:border-[#555] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Secondary CTA</label>
                <input
                  type="text"
                  placeholder="Explore more."
                  value={heroConfig.secondary_cta}
                  onChange={(e) => setHeroConfig((p) => ({ ...p, secondary_cta: e.target.value }))}
                  className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2.5 text-sm text-foreground placeholder-gray-500 focus:border-[#555] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">Background Image</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
                />
                <div
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors ${
                    isDragging
                      ? "border-[#C9A96E] bg-[var(--tott-dash-surface-inset)]"
                      : "border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] hover:border-[#555]"
                  }`}
                >
                  {previewUrl ? (
                    <div className="relative w-full max-h-40 overflow-hidden rounded">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        width={480}
                        height={160}
                        unoptimized
                        className="mx-auto max-h-40 w-auto object-contain"
                      />
                      <p className="mt-2 text-xs text-gray-400">{backgroundFile?.name}</p>
                    </div>
                  ) : (
                    <>
                      <span className="text-gray-500">
                        <span className="[&_svg]:h-10 [&_svg]:w-10">
                          <CloudUploadIcon />
                        </span>
                      </span>
                      <p className="mt-2 text-sm text-foreground">
                        Drag and drop files here, or click to browse
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Supported formats: JPG, PNG, WebP, GIF (Max 20MB)
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : selectedSection ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-20 text-center">
            <p className="text-sm font-medium text-foreground">{selectedSection.title}</p>
            <p className="text-xs text-gray-500">
              This section has no configurable fields. Use the eye icon to toggle its visibility.
            </p>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center py-20 text-sm text-gray-500">
            Select a section to edit its settings.
          </div>
        )}
      </div>
    </div>
  );
}
