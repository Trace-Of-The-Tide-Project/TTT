"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ContributeIcon,
  FolderIcon,
  LinkIcon,
  PenLineIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { BadgeFormModal } from "@/components/dashboard/admin/system-settings/BadgeFormModal";
import { CategoryFormModal } from "@/components/dashboard/admin/system-settings/CategoryFormModal";
import { TagFormModal } from "@/components/dashboard/admin/system-settings/TagFormModal";
import type { MessageTemplate, MessageTemplateCategory } from "@/components/dashboard/modals/CreateMessageTemplateModal";
import { EditMessageTemplateModal } from "@/components/dashboard/modals/EditMessageTemplateModal";
import { BadgeIconRenderer } from "@/components/dashboard/admin/system-settings/badge-icon-options";
import { TagHexShell } from "@/components/dashboard/admin/system-settings/TagHexShell";
import {
  SYSTEM_SETTINGS_TAB_IDS,
  type AchievementBadgeRow,
  type ContentCategoryRow,
  type ContentTagRow,
  type SystemSettingsTabId,
} from "@/lib/dashboard/system-settings-constants";
import type { EmailTemplateListItem } from "@/lib/dashboard/email-templates-constants";
import { RichTextEditor, EditorToolbar, EditorRegistryProvider } from "@/components/ui/rich-text";
import { api } from "@/services/api";

const ACCENT = "#E8DDC0";

type CategoryModalState =
  | { type: "closed" }
  | { type: "add" }
  | { type: "edit"; category: ContentCategoryRow };

type TagModalState = { type: "closed" } | { type: "add" } | { type: "edit"; tag: ContentTagRow };

type BadgeModalState =
  | { type: "closed" }
  | { type: "add" }
  | { type: "edit"; badge: AchievementBadgeRow };

const SaveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <path d="M17 21v-8H7v8" />
    <path d="M7 3v5h8" />
  </svg>
);

export function SystemSettingsContent() {
  const locale = useLocale();
  const tSettings = useTranslations("Dashboard.systemSettings");

  const [activeTab, setActiveTab] = useState<SystemSettingsTabId>("categories");

  // ── Categories ──
  const [categories, setCategories] = useState<ContentCategoryRow[]>([]);
  const [categoryModal, setCategoryModal] = useState<CategoryModalState>({ type: "closed" });

  // ── Tags ──
  const [tags, setTags] = useState<ContentTagRow[]>([]);
  const [tagModal, setTagModal] = useState<TagModalState>({ type: "closed" });

  // ── Badges ──
  const [badges, setBadges] = useState<AchievementBadgeRow[]>([]);
  const [badgeModal, setBadgeModal] = useState<BadgeModalState>({ type: "closed" });

  // ── Email templates ──
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplateListItem[]>([]);
  const [editEmailOpen, setEditEmailOpen] = useState(false);
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<MessageTemplate | null>(null);

  // ── Localisation ──
  const [defaultLanguage, setDefaultLanguage] = useState("English");
  const [timezone, setTimezone] = useState<"utc" | "eastern" | "pacific" | "gmt">("utc");
  const [dateFormat, setDateFormat] = useState<"mdy" | "dmy" | "ymd">("mdy");
  const [multiLanguageEnabled, setMultiLanguageEnabled] = useState(false);
  const [savingLocalisation, setSavingLocalisation] = useState(false);

  // ── Guidelines ──
  const [communityGuidelines, setCommunityGuidelines] = useState("");
  const [contentPolicy, setContentPolicy] = useState("");
  const [savingGuidelines, setSavingGuidelines] = useState(false);

  // ── Loaders ──
  const loadCategories = useCallback(() => {
    api.get("/admin/system-settings/categories").then((r: { data: Record<string, unknown> }) => {
      const list = (r.data?.categories ?? []) as Record<string, unknown>[];
      setCategories(list.map((c) => ({
        id: c.id as string,
        name: c.name as string,
        slug: (c.slug as string) ?? "",
        itemCount: (c.item_count as number) ?? 0,
        nameI18n: (c.name_i18n as Record<string, string>) ?? undefined,
      })));
    });
  }, []);

  const loadTags = useCallback(() => {
    api.get("/admin/system-settings/tags").then((r: { data: Record<string, unknown> }) => {
      const list = (r.data?.tags ?? []) as Record<string, unknown>[];
      setTags(list.map((t) => ({
        id: t.id as string,
        label: t.name as string,
        nameI18n: (t.name_i18n as Record<string, string>) ?? undefined,
      })));
    });
  }, []);

  const loadBadges = useCallback(() => {
    api.get("/admin/system-settings/badges").then((r: { data: Record<string, unknown> }) => {
      const list = (r.data?.badges ?? []) as Record<string, unknown>[];
      setBadges(list.map((b) => ({
        id: b.id as string,
        iconId: ((b.icon ?? "star") as string) as AchievementBadgeRow["iconId"],
        name: b.name as string,
        milestone: b.criteria_type
          ? `${b.criteria_type}:${b.criteria_value ?? ""}`
          : ((b.description as string) ?? ""),
        nameI18n: (b.name_i18n as Record<string, string>) ?? undefined,
      })));
    });
  }, []);

  const loadEmailTemplates = useCallback(() => {
    api.get("/admin/system-settings/email-templates").then((r: { data: Record<string, unknown> }) => {
      const list = (r.data?.templates ?? []) as Record<string, unknown>[];
      setEmailTemplates(list.map((t) => ({
        id: t.id as string,
        name: t.name as string,
        category: ((t.category as MessageTemplateCategory) ?? "broadcast"),
        subject: (t.subject as string) ?? "",
        body: (t.body as string) ?? "",
        lastEditedAt: (t.updatedAt ?? t.createdAt ?? new Date().toISOString()) as string,
      })));
    });
  }, []);

  const loadLocalisation = useCallback(() => {
    api.get("/admin/system-settings/localisation").then((r: { data: Record<string, unknown> }) => {
      const d = r.data;
      if (!d) return;
      setDefaultLanguage((d.default_language as string) ?? "English");
      setTimezone(((d.timezone as string) as typeof timezone) ?? "utc");
      setDateFormat(((d.date_format as string) as typeof dateFormat) ?? "mdy");
      setMultiLanguageEnabled(!!d.enable_multi_language);
    });
  }, []);

  const loadGuidelines = useCallback(() => {
    api.get("/admin/system-settings/guidelines").then((r: { data: Record<string, unknown> }) => {
      const d = r.data;
      if (!d) return;
      setCommunityGuidelines((d.community_guidelines as string) ?? "");
      setContentPolicy((d.content_policy as string) ?? "");
      setMultiLanguageEnabled(!!d.enable_multi_language_guidelines);
    });
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);
  useEffect(() => { loadTags(); }, [loadTags]);
  useEffect(() => { loadBadges(); }, [loadBadges]);
  useEffect(() => { loadEmailTemplates(); }, [loadEmailTemplates]);
  useEffect(() => { loadLocalisation(); }, [loadLocalisation]);
  useEffect(() => { loadGuidelines(); }, [loadGuidelines]);

  // ── Category actions ──
  const handleCategorySave = async (payload: {
    id?: string;
    name: string;
    slug: string;
    name_i18n?: Record<string, string>;
  }) => {
    // name_i18n is only present when the extended-translations flag is on, so
    // the current backend never receives an unknown column.
    const body = {
      name: payload.name,
      slug: payload.slug,
      ...(payload.name_i18n ? { name_i18n: payload.name_i18n } : {}),
    };
    if (categoryModal.type === "add") {
      await api.post("/admin/system-settings/categories", body);
    } else if (categoryModal.type === "edit" && payload.id) {
      await api.patch(`/admin/system-settings/categories/${payload.id}`, body);
    }
    loadCategories();
  };

  const handleCategoryDelete = async (id: string) => {
    await api.delete(`/admin/system-settings/categories/${id}`);
    loadCategories();
  };

  // ── Tag actions ──
  const handleTagSave = async (payload: {
    id?: string;
    label: string;
    name_i18n?: Record<string, string>;
  }) => {
    const body = {
      name: payload.label,
      ...(payload.name_i18n ? { name_i18n: payload.name_i18n } : {}),
    };
    if (tagModal.type === "add") {
      await api.post("/admin/system-settings/tags", body);
    } else if (tagModal.type === "edit" && payload.id) {
      await api.patch(`/admin/system-settings/tags/${payload.id}`, body);
    }
    loadTags();
  };

  const handleTagDelete = async (id: string) => {
    await api.delete(`/admin/system-settings/tags/${id}`);
    loadTags();
  };

  // ── Badge actions ──
  const handleBadgeSave = async (payload: {
    id?: string;
    iconId: AchievementBadgeRow["iconId"];
    name: string;
    milestone: string;
    name_i18n?: Record<string, string>;
  }) => {
    const [criteria_type, criteria_value_str] = payload.milestone.includes(":")
      ? payload.milestone.split(":")
      : [undefined, undefined];

    const body = {
      name: payload.name,
      icon: payload.iconId,
      ...(criteria_type ? { criteria_type, criteria_value: Number(criteria_value_str) || 0 } : { description: payload.milestone }),
      ...(payload.name_i18n ? { name_i18n: payload.name_i18n } : {}),
    };

    if (badgeModal.type === "add") {
      await api.post("/admin/system-settings/badges", body);
    } else if (badgeModal.type === "edit" && payload.id) {
      await api.patch(`/admin/system-settings/badges/${payload.id}`, body);
    }
    loadBadges();
  };

  // ── Email template save ──
  const handleEmailTemplateSave = async (updated: MessageTemplate) => {
    await api.patch(`/admin/system-settings/email-templates/${updated.id}`, {
      name: updated.name,
      subject: updated.subject,
      body: updated.body,
    });
    loadEmailTemplates();
  };

  // ── Localisation save ──
  const handleSaveLocalisation = async () => {
    setSavingLocalisation(true);
    try {
      await api.patch("/admin/system-settings/localisation", {
        default_language: defaultLanguage,
        timezone,
        date_format: dateFormat,
        enable_multi_language: multiLanguageEnabled,
      });
    } finally {
      setSavingLocalisation(false);
    }
  };

  // ── Guidelines save ──
  const handleSaveGuidelines = async () => {
    setSavingGuidelines(true);
    try {
      await api.patch("/admin/system-settings/guidelines", {
        community_guidelines: communityGuidelines,
        content_policy: contentPolicy,
        enable_multi_language_guidelines: multiLanguageEnabled,
      });
    } finally {
      setSavingGuidelines(false);
    }
  };

  const formatLastEdited = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return tSettings("dateUnknown");
    }
  };

  const inputShell =
    "mt-2 w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-4 py-3 text-sm text-foreground placeholder:text-[var(--tott-muted)] focus:border-[var(--tott-card-border)] focus:outline-none";

  return (
    <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
      <div className="rounded-2xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 lg:p-8">
        <div className="flex flex-col gap-3">
          <div className="flex w-full flex-wrap items-center gap-1 rounded-xl bg-[var(--tott-elevated)] p-1">
            {SYSTEM_SETTINGS_TAB_IDS.map((tabId) => (
              <button
                key={tabId}
                type="button"
                onClick={() => setActiveTab(tabId)}
                className={`rounded-md px-4 py-2.5 text-sm font-medium transition-all sm:px-5 ${
                  activeTab === tabId
                    ? "bg-[var(--tott-dash-control-bg)] text-foreground"
                    : "bg-transparent text-[var(--tott-tab-inactive)] hover:text-[var(--tott-tab-inactive-hover)]"
                }`}
              >
                {tSettings(`tabs.${tabId}`)}
              </button>
            ))}
          </div>

          {activeTab === "categories" && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setCategoryModal({ type: "add" })}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-[var(--tott-on-accent)] transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                <span className="[&_svg]:h-4 [&_svg]:w-4"><PlusIcon /></span>
                {tSettings("categories.add")}
              </button>
            </div>
          )}

          {activeTab === "tags" && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setTagModal({ type: "add" })}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-[var(--tott-on-accent)] transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                <span className="[&_svg]:h-4 [&_svg]:w-4"><PlusIcon /></span>
                {tSettings("tags.add")}
              </button>
            </div>
          )}

          {activeTab === "badges" && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setBadgeModal({ type: "add" })}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-[var(--tott-on-accent)] transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                <span className="[&_svg]:h-4 [&_svg]:w-4"><PlusIcon /></span>
                {tSettings("badges.add")}
              </button>
            </div>
          )}
        </div>

        {/* ── CATEGORIES ── */}
        {activeTab === "categories" && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-foreground">{tSettings("categories.title")}</h2>
            <p className="mt-1 text-sm text-[var(--tott-muted)]">{tSettings("categories.subtitle")}</p>
            <div className="mt-6 space-y-3">
              {categories.length === 0 && (
                <p className="text-sm text-[var(--tott-muted)]">{tSettings("categories.empty")}</p>
              )}
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-4 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-4 sm:gap-5 sm:px-5 sm:py-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] text-[var(--tott-dash-gold-text)]" aria-hidden>
                    <span className="[&_svg]:h-[18px] [&_svg]:w-[18px]"><FolderIcon /></span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{cat.name}</p>
                    <p className="mt-0.5 font-mono text-sm text-[var(--tott-muted)]">{cat.slug}</p>
                  </div>
                  <span className="hidden shrink-0 text-sm text-[var(--tott-muted)] sm:inline">
                    {tSettings("itemCount", { count: cat.itemCount })}
                  </span>
                  <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                    <span className="sm:hidden text-xs text-[var(--tott-muted)]">
                      {tSettings("itemCount", { count: cat.itemCount })}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCategoryModal({ type: "edit", category: cat })}
                      className="rounded-lg p-2 text-[var(--tott-dash-gold-text)] transition-colors hover:bg-[var(--tott-dash-ghost-hover)]"
                      aria-label={tSettings("categories.editAria", { name: cat.name })}
                    >
                      <span className="[&_svg]:h-[18px] [&_svg]:w-[18px]"><ContributeIcon /></span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCategoryDelete(cat.id)}
                      className="rounded-lg p-2 text-[var(--tott-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                      aria-label={tSettings("categories.deleteAria", { name: cat.name })}
                    >
                      <span className="[&_svg]:h-[18px] [&_svg]:w-[18px]"><TrashIcon /></span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAGS ── */}
        {activeTab === "tags" && (
          <div className="mt-8 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 sm:p-8">
            <h2 className="text-lg font-bold text-foreground">{tSettings("tags.title")}</h2>
            <p className="mt-1 text-sm text-[var(--tott-muted)]">{tSettings("tags.subtitle")}</p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {tags.length === 0 && <p className="text-sm text-[var(--tott-muted)] col-span-2">{tSettings("tags.empty")}</p>}
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center gap-4 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-4 sm:px-5 sm:py-4"
                >
                  <TagHexShell><LinkIcon /></TagHexShell>
                  <p className="min-w-0 flex-1 font-semibold text-foreground">{tag.label}</p>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setTagModal({ type: "edit", tag })}
                      className="rounded-lg p-2 text-[var(--tott-dash-gold-text)] transition-colors hover:bg-[var(--tott-dash-ghost-hover)]"
                      aria-label={tSettings("tags.editAria", { name: tag.label })}
                    >
                      <span className="[&_svg]:h-[18px] [&_svg]:w-[18px]"><ContributeIcon /></span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTagDelete(tag.id)}
                      className="rounded-lg p-2 text-[var(--tott-muted)] transition-colors hover:bg-red-500/10 hover:text-red-400"
                      aria-label={tSettings("tags.deleteAria", { name: tag.label })}
                    >
                      <span className="[&_svg]:h-[18px] [&_svg]:w-[18px]"><TrashIcon /></span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── BADGES ── */}
        {activeTab === "badges" && (
          <div className="mt-8 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 sm:p-8">
            <h2 className="text-lg font-bold text-foreground">{tSettings("badges.title")}</h2>
            <p className="mt-1 text-sm text-[var(--tott-muted)]">{tSettings("badges.subtitle")}</p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {badges.length === 0 && <p className="text-sm text-[var(--tott-muted)] col-span-2">{tSettings("badges.empty")}</p>}
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-4 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-4 sm:px-5 sm:py-4"
                >
                  <TagHexShell><BadgeIconRenderer iconId={badge.iconId} /></TagHexShell>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{badge.name}</p>
                    <p className="mt-0.5 text-sm text-[var(--tott-muted)]">{badge.milestone}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBadgeModal({ type: "edit", badge })}
                    className="shrink-0 rounded-lg p-2 text-[var(--tott-muted)] transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-[var(--tott-dash-gold-text)]"
                    aria-label={tSettings("badges.editAria", { name: badge.name })}
                  >
                    <span className="[&_svg]:h-[18px] [&_svg]:w-[18px]"><PenLineIcon /></span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── EMAIL TEMPLATES ── */}
        {activeTab === "email" && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-foreground">{tSettings("email.title")}</h2>
            <p className="mt-1 text-sm text-[var(--tott-muted)]">{tSettings("email.subtitle")}</p>
            <div className="mt-6 space-y-4">
              {emailTemplates.length === 0 && <p className="text-sm text-[var(--tott-muted)]">{tSettings("email.empty")}</p>}
              {emailTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-5 py-5"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] text-[var(--tott-muted)]">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M4 6h16v12H4z" />
                        <path d="m4 7 8 6 8-6" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold text-foreground">{tpl.name}</p>
                      <p className="mt-1 text-sm text-[var(--tott-muted)]">
                        {tSettings("lastEdited", { date: formatLastEdited(tpl.lastEditedAt) })}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedEmailTemplate(tpl); setEditEmailOpen(true); }}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-surface-inset)]"
                  >
                    <span className="[&_svg]:h-4 [&_svg]:w-4" style={{ color: ACCENT }}><ContributeIcon /></span>
                    {tSettings("email.editTemplate")}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LOCALISATION ── */}
        {activeTab === "localisation" && (
          <div className="mt-8 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 sm:p-8">
            <h2 className="text-lg font-bold text-foreground">{tSettings("localisation.title")}</h2>
            <p className="mt-1 text-sm text-[var(--tott-muted)]">{tSettings("localisation.subtitle")}</p>
            <div className="mt-6 space-y-6">
              <div>
                <p className="text-sm font-semibold text-foreground">{tSettings("localisation.defaultLanguage")}</p>
                <select value={defaultLanguage} onChange={(e) => setDefaultLanguage(e.target.value)} className={inputShell}>
                  <option value="English">{tSettings("localisation.languageNames.English")}</option>
                  <option value="Spanish">{tSettings("localisation.languageNames.Spanish")}</option>
                  <option value="French">{tSettings("localisation.languageNames.French")}</option>
                  <option value="German">{tSettings("localisation.languageNames.German")}</option>
                  <option value="Arabic">{tSettings("localisation.languageNames.Arabic")}</option>
                </select>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{tSettings("localisation.timezone")}</p>
                <select value={timezone} onChange={(e) => setTimezone(e.target.value as typeof timezone)} className={inputShell}>
                  <option value="utc">{tSettings("localisation.timezones.utc")}</option>
                  <option value="eastern">{tSettings("localisation.timezones.eastern")}</option>
                  <option value="pacific">{tSettings("localisation.timezones.pacific")}</option>
                  <option value="gmt">{tSettings("localisation.timezones.gmt")}</option>
                </select>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{tSettings("localisation.dateFormat")}</p>
                <select value={dateFormat} onChange={(e) => setDateFormat(e.target.value as typeof dateFormat)} className={inputShell}>
                  <option value="mdy">{tSettings("localisation.dateFormats.mdy")}</option>
                  <option value="dmy">{tSettings("localisation.dateFormats.dmy")}</option>
                  <option value="ymd">{tSettings("localisation.dateFormats.ymd")}</option>
                </select>
              </div>
              <div className="flex items-center justify-between gap-6">
                <div>
                  <p className="text-sm font-semibold text-foreground">{tSettings("localisation.multiLanguage")}</p>
                  <p className="mt-1 text-sm text-[var(--tott-muted)]">{tSettings("localisation.multiLanguageHint")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMultiLanguageEnabled((v) => !v)}
                  className={`relative h-7 w-12 rounded-full border border-[var(--tott-card-border)] transition-colors ${multiLanguageEnabled ? "bg-[var(--tott-gold-chip-bg)]" : "bg-[var(--tott-dash-surface-inset)]"}`}
                  aria-pressed={multiLanguageEnabled}
                  aria-label={tSettings("toggleMultiLanguageAria")}
                >
                  <span className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full transition-all ${multiLanguageEnabled ? "left-6 bg-[var(--tott-dash-surface-2)]" : "left-1 bg-[var(--tott-dash-surface-2)]"}`} />
                </button>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveLocalisation}
                  disabled={savingLocalisation}
                  className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-[var(--tott-on-accent)] transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: ACCENT }}
                >
                  <SaveIcon />
                  {savingLocalisation ? tSettings("saving") : tSettings("saveChanges")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── GUIDELINES ── */}
        {activeTab === "guidelines" && (
          <div className="mt-8 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 sm:p-8">
            <h2 className="text-lg font-bold text-foreground">{tSettings("guidelines.title")}</h2>
            <p className="mt-1 text-sm text-[var(--tott-muted)]">{tSettings("guidelines.subtitle")}</p>
            <div className="mt-6 space-y-6">
              <EditorRegistryProvider>
                <div className="rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)]">
                  <EditorToolbar />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{tSettings("guidelines.communityLabel")}</p>
                  <div className="mt-2 overflow-hidden rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)]">
                    <RichTextEditor value={communityGuidelines} onChange={setCommunityGuidelines} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{tSettings("guidelines.contentPolicyLabel")}</p>
                  <div className="mt-2 overflow-hidden rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)]">
                    <RichTextEditor value={contentPolicy} onChange={setContentPolicy} />
                  </div>
                </div>
              </EditorRegistryProvider>
              <div className="flex items-center justify-between gap-6">
                <div>
                  <p className="text-sm font-semibold text-foreground">{tSettings("localisation.multiLanguage")}</p>
                  <p className="mt-1 text-sm text-[var(--tott-muted)]">{tSettings("localisation.multiLanguageHint")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMultiLanguageEnabled((v) => !v)}
                  className={`relative h-7 w-12 rounded-full border border-[var(--tott-card-border)] transition-colors ${multiLanguageEnabled ? "bg-[var(--tott-gold-chip-bg)]" : "bg-[var(--tott-dash-surface-inset)]"}`}
                  aria-pressed={multiLanguageEnabled}
                  aria-label={tSettings("toggleMultiLanguageAria")}
                >
                  <span className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full transition-all ${multiLanguageEnabled ? "left-6 bg-[var(--tott-dash-surface-2)]" : "left-1 bg-[var(--tott-dash-surface-2)]"}`} />
                </button>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveGuidelines}
                  disabled={savingGuidelines}
                  className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-[var(--tott-on-accent)] transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: ACCENT }}
                >
                  <SaveIcon />
                  {savingGuidelines ? tSettings("saving") : tSettings("saveChanges")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <CategoryFormModal
        open={categoryModal.type !== "closed"}
        onClose={() => setCategoryModal({ type: "closed" })}
        mode={categoryModal.type === "edit" ? "edit" : "add"}
        categoryId={categoryModal.type === "edit" ? categoryModal.category.id : undefined}
        initialName={categoryModal.type === "edit" ? categoryModal.category.name : ""}
        initialSlug={categoryModal.type === "edit" ? categoryModal.category.slug : ""}
        initialNameI18n={categoryModal.type === "edit" ? categoryModal.category.nameI18n : undefined}
        onSave={handleCategorySave}
      />

      <TagFormModal
        open={tagModal.type !== "closed"}
        onClose={() => setTagModal({ type: "closed" })}
        mode={tagModal.type === "edit" ? "edit" : "add"}
        tagId={tagModal.type === "edit" ? tagModal.tag.id : undefined}
        initialLabel={tagModal.type === "edit" ? tagModal.tag.label : ""}
        initialNameI18n={tagModal.type === "edit" ? tagModal.tag.nameI18n : undefined}
        onSave={handleTagSave}
      />

      <BadgeFormModal
        open={badgeModal.type !== "closed"}
        onClose={() => setBadgeModal({ type: "closed" })}
        mode={badgeModal.type === "edit" ? "edit" : "add"}
        badgeId={badgeModal.type === "edit" ? badgeModal.badge.id : undefined}
        initialIconId={badgeModal.type === "edit" ? badgeModal.badge.iconId : undefined}
        initialName={badgeModal.type === "edit" ? badgeModal.badge.name : ""}
        initialMilestone={badgeModal.type === "edit" ? badgeModal.badge.milestone : ""}
        initialNameI18n={badgeModal.type === "edit" ? badgeModal.badge.nameI18n : undefined}
        onSave={handleBadgeSave}
      />

      <EditMessageTemplateModal
        open={editEmailOpen}
        template={selectedEmailTemplate}
        onClose={() => { setEditEmailOpen(false); setSelectedEmailTemplate(null); }}
        onSave={handleEmailTemplateSave}
      />
    </div>
  );
}
