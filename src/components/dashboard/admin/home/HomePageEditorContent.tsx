"use client";

import { useState } from "react";
import { EyeIcon, RefreshCwIcon } from "@/components/ui/icons";
import { useEnsureHomePage } from "@/hooks/queries/cms";
import {
  usePublishCmsPage,
  useToggleCmsSection,
  useUpdateCmsSection,
} from "@/hooks/mutations/cms";
import type { CmsSection } from "@/services/cms.service";
import {
  HOME_SECTION_KEY_BY_TYPE,
  SUPPORTED_LOCALES,
  type HomeLocale,
  type HomeSectionKey,
} from "@/services/home-page.service";

/**
 * Admin editor for the redesigned homepage. Mirrors the magazine page
 * editor: section list (reorder/toggle visibility) + per-section
 * locale-tab forms for the editable copy. Rail *contents* are live from
 * the APIs and not curated here — only framing copy + hero/CTA targets.
 */

// ── Field schemas per section ──────────────────────────────────────

type FieldKind = "text" | "textarea";
type LocalField = { key: string; label: string; kind: FieldKind };
type FlatField = { key: string; label: string; kind: FieldKind };

const RAIL_FIELDS: LocalField[] = [
  { key: "heading", label: "Heading", kind: "text" },
  { key: "subheading", label: "Subheading", kind: "textarea" },
];

const SECTION_SCHEMA: Record<
  HomeSectionKey,
  { localized: LocalField[]; flat: FlatField[] }
> = {
  hero: {
    localized: [
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "title", label: "Title", kind: "text" },
      { key: "subtitle", label: "Mission subtitle", kind: "textarea" },
      { key: "primaryCtaLabel", label: "Primary CTA label", kind: "text" },
      { key: "secondaryCtaLabel", label: "Secondary CTA label", kind: "text" },
    ],
    flat: [
      { key: "artwork", label: "Artwork image URL", kind: "text" },
      { key: "primaryHref", label: "Primary CTA link", kind: "text" },
      { key: "secondaryHref", label: "Secondary CTA link", kind: "text" },
      { key: "variant", label: "Homepage direction", kind: "text" },
    ],
  },
  spotlight: {
    localized: [
      { key: "eyebrow", label: "Eyebrow", kind: "text" },
      { key: "heading", label: "Heading (optional)", kind: "text" },
    ],
    flat: [],
  },
  oralHistories: { localized: RAIL_FIELDS, flat: [] },
  magazineIssues: { localized: RAIL_FIELDS, flat: [] },
  collections: { localized: RAIL_FIELDS, flat: [] },
  people: { localized: RAIL_FIELDS, flat: [] },
  trips: { localized: RAIL_FIELDS, flat: [] },
  bookClub: { localized: RAIL_FIELDS, flat: [] },
  contributeCta: {
    localized: [
      { key: "heading", label: "Heading", kind: "text" },
      { key: "body", label: "Body", kind: "textarea" },
      { key: "ctaLabel", label: "CTA label", kind: "text" },
    ],
    flat: [{ key: "openCallId", label: "Linked open-call id", kind: "text" }],
  },
};

// ── Config helpers ─────────────────────────────────────────────────

type LocalizedCopy = Partial<
  Record<HomeLocale, Record<string, string>>
>;
type WorkingConfig = {
  copy: LocalizedCopy;
  flat: Record<string, string>;
};

function parseConfig(section: CmsSection | undefined): WorkingConfig {
  const raw = section?.config;
  let obj: Record<string, unknown> = {};
  if (typeof raw === "string") {
    try {
      obj = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      obj = {};
    }
  } else if (raw && typeof raw === "object") {
    obj = raw as Record<string, unknown>;
  }
  const copyRaw = (obj.copy as Record<string, unknown>) ?? {};
  const copy: LocalizedCopy = {};
  for (const loc of SUPPORTED_LOCALES) {
    const entry = copyRaw[loc];
    if (entry && typeof entry === "object") {
      copy[loc] = entry as Record<string, string>;
    }
  }
  const flat: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k !== "copy" && typeof v === "string") flat[k] = v;
  }
  return { copy, flat };
}

function serializeConfig(cfg: WorkingConfig): string {
  return JSON.stringify({ copy: cfg.copy, ...cfg.flat });
}

const LOCALE_LABEL: Record<HomeLocale, string> = {
  en: "EN",
  ar: "AR",
  fr: "FR",
  es: "ES",
};

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2.5 text-sm text-foreground placeholder-gray-500 focus:border-[#555] focus:outline-none";

const VARIANT_OPTIONS = [
  { value: "", label: "Default", sublabel: "CMS sections" },
  { value: "d01", label: "D01", sublabel: "Lattice Refined" },
  { value: "d02", label: "D02", sublabel: "The Tideline" },
  { value: "d03", label: "D03", sublabel: "Currents" },
] as const;

function VariantPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {VARIANT_OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex flex-col items-center gap-1 rounded-lg border px-3 py-3 text-center transition-colors ${
              active
                ? "border-[#C9A96E] bg-[#C9A96E]/15 text-[#C9A96E]"
                : "border-[var(--tott-card-border)] text-gray-400 hover:bg-[var(--tott-dash-control-hover)] hover:text-foreground"
            }`}
          >
            <span className="text-sm font-semibold">{opt.label}</span>
            <span className="text-[10px] leading-tight opacity-70">{opt.sublabel}</span>
          </button>
        );
      })}
    </div>
  );
}

export function HomePageEditorContent() {
  const { data: page, isPending } = useEnsureHomePage();
  const updateSection = useUpdateCmsSection();
  const toggleSection = useToggleCmsSection();
  const publishPage = usePublishCmsPage();

  const sections: CmsSection[] = page
    ? [...page.sections]
        .filter((s) => HOME_SECTION_KEY_BY_TYPE[s.section_type])
        .sort((a, b) => a.section_order - b.section_order)
    : [];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeLocale, setActiveLocale] = useState<HomeLocale>("en");
  const [working, setWorking] = useState<WorkingConfig | null>(null);

  // Seed the working config from the selected section (render-phase
  // prev-value pattern, same as the magazine editor).
  const selected =
    sections.find((s) => s.id === selectedId) ?? sections[0] ?? undefined;
  const [seedKey, setSeedKey] = useState<string | null>(null);
  const selectedSeedKey = selected
    ? `${selected.id}:${JSON.stringify(selected.config ?? null)}`
    : null;
  if (selected && selectedSeedKey !== seedKey) {
    setSeedKey(selectedSeedKey);
    if (!selectedId) setSelectedId(selected.id);
    setWorking(parseConfig(selected));
  }

  if (isPending || !page) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-gray-500">
        Loading homepage editor…
      </div>
    );
  }

  const key = selected ? HOME_SECTION_KEY_BY_TYPE[selected.section_type] : undefined;
  const schema = key ? SECTION_SCHEMA[key] : undefined;
  const saving = updateSection.isPending;

  const setLocalField = (k: string, v: string) =>
    setWorking((w) => {
      if (!w) return w;
      const next = { ...w, copy: { ...w.copy } };
      next.copy[activeLocale] = { ...(next.copy[activeLocale] ?? {}), [k]: v };
      return next;
    });
  const setFlatField = (k: string, v: string) =>
    setWorking((w) => (w ? { ...w, flat: { ...w.flat, [k]: v } } : w));

  const handleSave = () => {
    if (!selected || !working) return;
    updateSection.mutate({
      pageId: page.id,
      sectionId: selected.id,
      data: { config: serializeConfig(working) },
    });
  };
  const handleReset = () => selected && setWorking(parseConfig(selected));

  return (
    <div className="grid gap-9 lg:grid-cols-[320px_1fr]">
      {/* Section list */}
      <div className="rounded-xl border border-[var(--tott-card-border)] p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Sections</h3>
          <button
            type="button"
            onClick={() => publishPage.mutate(page.id)}
            disabled={publishPage.isPending}
            className="rounded-lg border border-[#C9A96E]/40 bg-[#C9A96E]/20 px-3 py-1.5 text-xs font-medium text-[#C9A96E] hover:bg-[#C9A96E]/30 disabled:opacity-50"
          >
            {publishPage.isPending ? "Publishing…" : "Publish"}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Toggle visibility; edit copy per language. Rail contents come live
          from the archive.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          {sections.map((section) => {
            const isSel = section.id === (selected?.id ?? null);
            return (
              <div
                key={section.id}
                onClick={() => setSelectedId(section.id)}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 transition-colors hover:bg-[var(--tott-dash-control-hover)] ${
                  isSel ? "border-[#C9A96E]" : "border-[var(--tott-card-border)]"
                }`}
              >
                <span className={`flex-1 text-sm font-medium ${isSel ? "text-[#C9A96E]" : "text-foreground"}`}>
                  {section.title}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection.mutate({ pageId: page.id, sectionId: section.id });
                  }}
                  className={`rounded p-1.5 hover:bg-[var(--tott-dash-ghost-hover)] ${
                    section.is_visible ? "text-gray-400" : "text-gray-600 opacity-40"
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
      </div>

      {/* Editor */}
      <div className="rounded-xl border border-[var(--tott-card-border)] p-6">
        {selected && schema && working ? (
          <>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                {selected.title}
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-3 py-1.5 text-xs font-medium text-foreground hover:bg-[var(--tott-dash-surface-inset)]"
                >
                  <span className="[&_svg]:h-3.5 [&_svg]:w-3.5">
                    <RefreshCwIcon />
                  </span>
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg border border-[#C9A96E]/40 bg-[#C9A96E]/20 px-3 py-1.5 text-xs font-medium text-[#C9A96E] hover:bg-[#C9A96E]/30 disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>

            {/* Locale tabs */}
            {schema.localized.length > 0 ? (
              <div className="mt-5 flex gap-1.5">
                {SUPPORTED_LOCALES.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setActiveLocale(loc)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeLocale === loc
                        ? "bg-[#C9A96E]/20 text-[#C9A96E]"
                        : "text-gray-400 hover:bg-[var(--tott-dash-control-hover)]"
                    }`}
                  >
                    {LOCALE_LABEL[loc]}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="mt-5 space-y-4">
              {schema.localized.map((f) => {
                const val = working.copy[activeLocale]?.[f.key] ?? "";
                return (
                  <div key={f.key}>
                    <label className="mb-1.5 block text-xs font-medium text-foreground">
                      {f.label}
                    </label>
                    {f.kind === "textarea" ? (
                      <textarea
                        rows={3}
                        dir={activeLocale === "ar" ? "rtl" : "ltr"}
                        value={val}
                        onChange={(e) => setLocalField(f.key, e.target.value)}
                        className={`${inputClass} resize-none`}
                      />
                    ) : (
                      <input
                        type="text"
                        dir={activeLocale === "ar" ? "rtl" : "ltr"}
                        value={val}
                        onChange={(e) => setLocalField(f.key, e.target.value)}
                        className={inputClass}
                      />
                    )}
                  </div>
                );
              })}

              {schema.flat.length > 0 ? (
                <div className="mt-2 border-t border-[var(--tott-card-border)] pt-4">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                    Shared (all languages)
                  </p>
                  {schema.flat.map((f) => (
                    <div key={f.key} className="mb-4">
                      <label className="mb-1.5 block text-xs font-medium text-foreground">
                        {f.label}
                      </label>
                      {f.key === "variant" ? (
                        <VariantPicker
                          value={working.flat[f.key] ?? ""}
                          onChange={(v) => setFlatField(f.key, v)}
                        />
                      ) : (
                        <input
                          type="text"
                          value={working.flat[f.key] ?? ""}
                          onChange={(e) => setFlatField(f.key, e.target.value)}
                          className={inputClass}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center py-20 text-sm text-gray-500">
            Select a section to edit.
          </div>
        )}
      </div>
    </div>
  );
}
