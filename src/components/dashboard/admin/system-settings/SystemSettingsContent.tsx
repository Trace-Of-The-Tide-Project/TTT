"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ContributeIcon,
  FolderIcon,
  LinkIcon,
  PenLineIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/ui/icons";
import { BadgeFormModal } from "@/components/dashboard/modals/BadgeFormModal";
import { CategoryFormModal } from "@/components/dashboard/modals/CategoryFormModal";
import { TagFormModal } from "@/components/dashboard/modals/TagFormModal";
import type { MessageTemplate } from "@/components/dashboard/modals/CreateMessageTemplateModal";
import { EditMessageTemplateModal } from "@/components/dashboard/modals/EditMessageTemplateModal";
import { BadgeIconRenderer } from "@/components/dashboard/admin/system-settings/badge-icon-options";
import { TagHexShell } from "@/components/dashboard/admin/system-settings/TagHexShell";
import {
  SYSTEM_SETTINGS_TAB_IDS,
  sampleAchievementBadges,
  sampleContentCategories,
  sampleContentTags,
  type AchievementBadgeRow,
  type ContentCategoryRow,
  type ContentTagRow,
  type SystemSettingsTabId,
} from "@/lib/dashboard/system-settings-constants";
import {
  sampleEmailTemplates,
  type EmailTemplateListItem,
} from "@/lib/dashboard/email-templates-constants";

const ACCENT = "#E8DDC0";

/** Chamfered row (matches Reports audit log cards). */
const ROW_CLIP =
  "polygon(11px 0, calc(100% - 11px) 0, 100% 11px, 100% calc(100% - 11px), calc(100% - 11px) 100%, 11px 100%, 0 calc(100% - 11px), 0 11px)";

type CategoryModalState =
  | { type: "closed" }
  | { type: "add" }
  | { type: "edit"; category: ContentCategoryRow };

type TagModalState =
  | { type: "closed" }
  | { type: "add" }
  | { type: "edit"; tag: ContentTagRow };

type BadgeModalState =
  | { type: "closed" }
  | { type: "add" }
  | { type: "edit"; badge: AchievementBadgeRow };

export function SystemSettingsContent() {
  const locale = useLocale();
  const tSettings = useTranslations("Dashboard.systemSettings");
  const [activeTab, setActiveTab] = useState<SystemSettingsTabId>("categories");
  const [categories, setCategories] = useState<ContentCategoryRow[]>(() => [...sampleContentCategories]);
  const [categoryModal, setCategoryModal] = useState<CategoryModalState>({ type: "closed" });
  const [tags, setTags] = useState<ContentTagRow[]>(() => [...sampleContentTags]);
  const [tagModal, setTagModal] = useState<TagModalState>({ type: "closed" });
  const [badges, setBadges] = useState<AchievementBadgeRow[]>(() => [...sampleAchievementBadges]);
  const [badgeModal, setBadgeModal] = useState<BadgeModalState>({ type: "closed" });
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplateListItem[]>(() => [
    ...sampleEmailTemplates,
  ]);
  const [editEmailOpen, setEditEmailOpen] = useState(false);
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<MessageTemplate | null>(null);
  const [defaultLanguage, setDefaultLanguage] = useState("English");
  const [timezone, setTimezone] = useState<"utc" | "eastern" | "pacific" | "gmt">("utc");
  const [dateFormat, setDateFormat] = useState<"mdy" | "dmy" | "ymd">("mdy");
  const [multiLanguageEnabled, setMultiLanguageEnabled] = useState(false);
  const [communityGuidelines, setCommunityGuidelines] = useState("");
  const [contentPolicy, setContentPolicy] = useState("");

  useEffect(() => {
    setCommunityGuidelines(tSettings("guidelines.sampleCommunity"));
    setContentPolicy(tSettings("guidelines.sampleContentPolicy"));
  }, [locale, tSettings]);

  const handleCategorySave = (payload: { id?: string; name: string; slug: string }) => {
    if (categoryModal.type === "add") {
      setCategories((prev) => [
        ...prev,
        { id: `c-${Date.now()}`, name: payload.name, slug: payload.slug, itemCount: 0 },
      ]);
    } else if (categoryModal.type === "edit" && payload.id) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === payload.id ? { ...c, name: payload.name, slug: payload.slug } : c
        )
      );
    }
  };

  const closeCategoryModal = () => setCategoryModal({ type: "closed" });

  const handleTagSave = (payload: { id?: string; label: string }) => {
    if (tagModal.type === "add") {
      setTags((prev) => [...prev, { id: `tag-${Date.now()}`, label: payload.label }]);
    } else if (tagModal.type === "edit" && payload.id) {
      setTags((prev) =>
        prev.map((t) => (t.id === payload.id ? { ...t, label: payload.label } : t))
      );
    }
  };

  const closeTagModal = () => setTagModal({ type: "closed" });

  const handleBadgeSave = (payload: {
    id?: string;
    iconId: AchievementBadgeRow["iconId"];
    name: string;
    milestone: string;
  }) => {
    if (badgeModal.type === "add") {
      setBadges((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          iconId: payload.iconId,
          name: payload.name,
          milestone: payload.milestone,
        },
      ]);
    } else if (badgeModal.type === "edit" && payload.id) {
      setBadges((prev) =>
        prev.map((b) =>
          b.id === payload.id
            ? {
                ...b,
                iconId: payload.iconId,
                name: payload.name,
                milestone: payload.milestone,
              }
            : b
        )
      );
    }
  };

  const closeBadgeModal = () => setBadgeModal({ type: "closed" });
  const closeEditEmail = () => setEditEmailOpen(false);

  const formatLastEdited = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return tSettings("dateUnknown");
    }
  };

  const inputShell =
    "mt-2 w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-4 py-3 text-sm text-foreground placeholder-gray-500 focus:border-[#555] focus:outline-none";

  return (
    <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
      <div className="rounded-2xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 lg:p-8">
        <div className="flex flex-col gap-3">
          <div className="flex w-full flex-wrap items-center gap-1 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] p-1">
            {SYSTEM_SETTINGS_TAB_IDS.map((tabId) => (
              <button
                key={tabId}
                type="button"
                onClick={() => setActiveTab(tabId)}
                className={`rounded-md px-4 py-2.5 text-sm font-medium transition-all sm:px-5 ${
                  activeTab === tabId
                    ? "border border-[#4A4A4A] bg-[var(--tott-dash-control-bg)] text-foreground shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                    : "border border-transparent bg-transparent text-[#AAAAAA] hover:text-[#E0E0E0]"
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
                className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-[#111] transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                <span className="[&_svg]:h-4 [&_svg]:w-4">
                  <PlusIcon />
                </span>
                {tSettings("categories.add")}
              </button>
            </div>
          )}

          {activeTab === "tags" && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setTagModal({ type: "add" })}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-[#111] transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                <span className="[&_svg]:h-4 [&_svg]:w-4">
                  <PlusIcon />
                </span>
                {tSettings("tags.add")}
              </button>
            </div>
          )}

          {activeTab === "badges" && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setBadgeModal({ type: "add" })}
                className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-[#111] transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                <span className="[&_svg]:h-4 [&_svg]:w-4">
                  <PlusIcon />
                </span>
                {tSettings("badges.add")}
              </button>
            </div>
          )}
        </div>

        {activeTab === "categories" && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-foreground">{tSettings("categories.title")}</h2>
            <p className="mt-1 text-sm text-gray-500">{tSettings("categories.subtitle")}</p>
            <div className="mt-6 space-y-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-4 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-4 sm:gap-5 sm:px-5 sm:py-4"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] text-[#E8DDC0]"
                    aria-hidden
                  >
                    <span className="[&_svg]:h-[18px] [&_svg]:w-[18px]">
                      <FolderIcon />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{cat.name}</p>
                    <p className="mt-0.5 font-mono text-sm text-gray-500">{cat.slug}</p>
                  </div>
                  <span className="hidden shrink-0 text-sm text-gray-500 sm:inline">
                    {tSettings("itemCount", { count: cat.itemCount })}
                  </span>
                  <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                    <span className="sm:hidden text-xs text-gray-500">
                      {tSettings("itemCount", { count: cat.itemCount })}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCategoryModal({ type: "edit", category: cat })}
                      className="rounded-lg p-2 text-[#E8DDC0] transition-colors hover:bg-[var(--tott-dash-ghost-hover)]"
                      aria-label={tSettings("categories.editAria", { name: cat.name })}
                    >
                      <span className="[&_svg]:h-[18px] [&_svg]:w-[18px]">
                        <ContributeIcon />
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategories((prev) => prev.filter((c) => c.id !== cat.id))}
                      className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      aria-label={tSettings("categories.deleteAria", { name: cat.name })}
                    >
                      <span className="[&_svg]:h-[18px] [&_svg]:w-[18px]">
                        <TrashIcon />
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "tags" && (
          <div className="mt-8 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 sm:p-8">
            <h2 className="text-lg font-bold text-foreground">{tSettings("tags.title")}</h2>
            <p className="mt-1 text-sm text-gray-500">{tSettings("tags.subtitle")}</p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="flex items-center gap-4 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-4 sm:px-5 sm:py-4"
                >
                  <TagHexShell>
                    <LinkIcon />
                  </TagHexShell>
                  <p className="min-w-0 flex-1 font-semibold text-foreground">{tag.label}</p>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setTagModal({ type: "edit", tag })}
                      className="rounded-lg p-2 text-[#E8DDC0] transition-colors hover:bg-[var(--tott-dash-ghost-hover)]"
                      aria-label={tSettings("tags.editAria", { name: tag.label })}
                    >
                      <span className="[&_svg]:h-[18px] [&_svg]:w-[18px]">
                        <ContributeIcon />
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTags((prev) => prev.filter((t) => t.id !== tag.id))}
                      className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      aria-label={tSettings("tags.deleteAria", { name: tag.label })}
                    >
                      <span className="[&_svg]:h-[18px] [&_svg]:w-[18px]">
                        <TrashIcon />
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "badges" && (
          <div className="mt-8 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 sm:p-8">
            <h2 className="text-lg font-bold text-foreground">{tSettings("badges.title")}</h2>
            <p className="mt-1 text-sm text-gray-500">{tSettings("badges.subtitle")}</p>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-4 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-4 sm:px-5 sm:py-4"
                >
                  <TagHexShell>
                    <BadgeIconRenderer iconId={badge.iconId} />
                  </TagHexShell>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">{badge.name}</p>
                    <p className="mt-0.5 text-sm text-gray-500">{badge.milestone}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBadgeModal({ type: "edit", badge })}
                    className="shrink-0 rounded-lg p-2 text-gray-500 transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-[#E8DDC0]"
                    aria-label={tSettings("badges.editAria", { name: badge.name })}
                  >
                    <span className="[&_svg]:h-[18px] [&_svg]:w-[18px]">
                      <PenLineIcon />
                    </span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "email" && (
          <div className="mt-8">
            <h2 className="text-lg font-bold text-foreground">{tSettings("email.title")}</h2>
            <p className="mt-1 text-sm text-gray-500">{tSettings("email.subtitle")}</p>

            <div className="mt-6 space-y-4">
              {emailTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-5 py-5"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] text-gray-400">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M4 6h16v12H4z" />
                        <path d="m4 7 8 6 8-6" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold text-foreground">{tpl.name}</p>
                      <p className="mt-1 text-sm text-gray-500">
                        {tSettings("lastEdited", { date: formatLastEdited(tpl.lastEditedAt) })}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedEmailTemplate(tpl);
                      setEditEmailOpen(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-4 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-[var(--tott-dash-surface-inset)]"
                  >
                    <span className="[&_svg]:h-4 [&_svg]:w-4" style={{ color: ACCENT }}>
                      <ContributeIcon />
                    </span>
                    {tSettings("email.editTemplate")}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "localisation" && (
          <div className="mt-8 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 sm:p-8">
            <h2 className="text-lg font-bold text-foreground">{tSettings("localisation.title")}</h2>
            <p className="mt-1 text-sm text-gray-500">{tSettings("localisation.subtitle")}</p>

            <div className="mt-6 space-y-6">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {tSettings("localisation.defaultLanguage")}
                </p>
                <select
                  value={defaultLanguage}
                  onChange={(e) => setDefaultLanguage(e.target.value)}
                  className={inputShell}
                >
                  <option value="English">{tSettings("localisation.languageNames.English")}</option>
                  <option value="Spanish">{tSettings("localisation.languageNames.Spanish")}</option>
                  <option value="French">{tSettings("localisation.languageNames.French")}</option>
                  <option value="German">{tSettings("localisation.languageNames.German")}</option>
                  <option value="Arabic">{tSettings("localisation.languageNames.Arabic")}</option>
                </select>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">{tSettings("localisation.timezone")}</p>
                <select
                  value={timezone}
                  onChange={(e) =>
                    setTimezone(e.target.value as "utc" | "eastern" | "pacific" | "gmt")
                  }
                  className={inputShell}
                >
                  <option value="utc">{tSettings("localisation.timezones.utc")}</option>
                  <option value="eastern">{tSettings("localisation.timezones.eastern")}</option>
                  <option value="pacific">{tSettings("localisation.timezones.pacific")}</option>
                  <option value="gmt">{tSettings("localisation.timezones.gmt")}</option>
                </select>
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">{tSettings("localisation.dateFormat")}</p>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value as "mdy" | "dmy" | "ymd")}
                  className={inputShell}
                >
                  <option value="mdy">{tSettings("localisation.dateFormats.mdy")}</option>
                  <option value="dmy">{tSettings("localisation.dateFormats.dmy")}</option>
                  <option value="ymd">{tSettings("localisation.dateFormats.ymd")}</option>
                </select>
              </div>

              <div className="flex items-center justify-between gap-6">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {tSettings("localisation.multiLanguage")}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">{tSettings("localisation.multiLanguageHint")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMultiLanguageEnabled((v) => !v)}
                  className={`relative h-7 w-12 rounded-full border border-[var(--tott-card-border)] transition-colors ${
                    multiLanguageEnabled ? "bg-[#E8DDC0]" : "bg-[var(--tott-dash-surface-inset)]"
                  }`}
                  aria-pressed={multiLanguageEnabled}
                  aria-label={tSettings("toggleMultiLanguageAria")}
                >
                  <span
                    className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full transition-all ${
                      multiLanguageEnabled ? "left-6 bg-[var(--tott-dash-surface-2)]" : "left-1 bg-[var(--tott-dash-surface-2)]"
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-[#111] transition-opacity hover:opacity-90"
                  style={{ backgroundColor: ACCENT }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <path d="M17 21v-8H7v8" />
                    <path d="M7 3v5h8" />
                  </svg>
                  {tSettings("saveChanges")}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "guidelines" && (
          <div className="mt-8 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 sm:p-8">
            <h2 className="text-lg font-bold text-foreground">{tSettings("guidelines.title")}</h2>
            <p className="mt-1 text-sm text-gray-500">{tSettings("guidelines.subtitle")}</p>

            <div className="mt-6 space-y-6">
              <div>
                <p className="text-sm font-semibold text-foreground">{tSettings("guidelines.communityLabel")}</p>
                <textarea
                  value={communityGuidelines}
                  onChange={(e) => setCommunityGuidelines(e.target.value)}
                  rows={4}
                  className={`${inputShell} resize-y`}
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-foreground">
                  {tSettings("guidelines.contentPolicyLabel")}
                </p>
                <textarea
                  value={contentPolicy}
                  onChange={(e) => setContentPolicy(e.target.value)}
                  rows={4}
                  className={`${inputShell} resize-y`}
                />
              </div>

              <div className="flex items-center justify-between gap-6">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {tSettings("localisation.multiLanguage")}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">{tSettings("localisation.multiLanguageHint")}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMultiLanguageEnabled((v) => !v)}
                  className={`relative h-7 w-12 rounded-full border border-[var(--tott-card-border)] transition-colors ${
                    multiLanguageEnabled ? "bg-[#E8DDC0]" : "bg-[var(--tott-dash-surface-inset)]"
                  }`}
                  aria-pressed={multiLanguageEnabled}
                  aria-label={tSettings("toggleMultiLanguageAria")}
                >
                  <span
                    className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full transition-all ${
                      multiLanguageEnabled ? "left-6 bg-[var(--tott-dash-surface-2)]" : "left-1 bg-[var(--tott-dash-surface-2)]"
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-[#111] transition-opacity hover:opacity-90"
                  style={{ backgroundColor: ACCENT }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <path d="M17 21v-8H7v8" />
                    <path d="M7 3v5h8" />
                  </svg>
                  {tSettings("saveChanges")}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      <CategoryFormModal
        open={categoryModal.type !== "closed"}
        onClose={closeCategoryModal}
        mode={categoryModal.type === "edit" ? "edit" : "add"}
        categoryId={categoryModal.type === "edit" ? categoryModal.category.id : undefined}
        initialName={categoryModal.type === "edit" ? categoryModal.category.name : ""}
        initialSlug={categoryModal.type === "edit" ? categoryModal.category.slug : ""}
        onSave={handleCategorySave}
      />

      <TagFormModal
        open={tagModal.type !== "closed"}
        onClose={closeTagModal}
        mode={tagModal.type === "edit" ? "edit" : "add"}
        tagId={tagModal.type === "edit" ? tagModal.tag.id : undefined}
        initialLabel={tagModal.type === "edit" ? tagModal.tag.label : ""}
        onSave={handleTagSave}
      />

      <BadgeFormModal
        open={badgeModal.type !== "closed"}
        onClose={closeBadgeModal}
        mode={badgeModal.type === "edit" ? "edit" : "add"}
        badgeId={badgeModal.type === "edit" ? badgeModal.badge.id : undefined}
        initialIconId={badgeModal.type === "edit" ? badgeModal.badge.iconId : undefined}
        initialName={badgeModal.type === "edit" ? badgeModal.badge.name : ""}
        initialMilestone={badgeModal.type === "edit" ? badgeModal.badge.milestone : ""}
        onSave={handleBadgeSave}
      />

      <EditMessageTemplateModal
        open={editEmailOpen}
        template={selectedEmailTemplate}
        onClose={() => {
          closeEditEmail();
          setSelectedEmailTemplate(null);
        }}
        onSave={(updated) => {
          setEmailTemplates((prev) =>
            prev.map((t) =>
              t.id === updated.id
                ? { ...(updated as EmailTemplateListItem), lastEditedAt: new Date().toISOString() }
                : t
            )
          );
        }}
      />
    </div>
  );
}
