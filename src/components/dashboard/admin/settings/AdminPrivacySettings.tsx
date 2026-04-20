"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { theme } from "@/lib/theme";
import { SettingsRow, settingsCardClass, SettingsToggle } from "./SettingsPrimitives";

const VISIBILITY_VALUES = ["public", "followers", "private"] as const;

export function AdminPrivacySettings() {
  const t = useTranslations("Dashboard.adminPrivacy");
  const [profileVisibility, setProfileVisibility] =
    useState<(typeof VISIBILITY_VALUES)[number]>("public");
  const [showEmail, setShowEmail] = useState(true);
  const [showActivity, setShowActivity] = useState(false);
  const [allowFollows, setAllowFollows] = useState(true);

  const selectClass =
    "min-w-[9.5rem] cursor-pointer appearance-none rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] py-2.5 pl-3 pr-9 text-sm text-foreground outline-none focus:border-[#C9A96E]";

  const [savedFlash, setSavedFlash] = useState(false);
  const onSave = useCallback(() => {
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <div className={settingsCardClass} style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}>
        <h1 className="text-lg font-bold text-foreground">{t("pageTitle")}</h1>

        <div className="mt-6">
          <SettingsRow
            title={t("profileVisibility")}
            description={t("profileVisibilityDescription")}
            control={
              <div className="relative">
                <select
                  value={profileVisibility}
                  onChange={(e) => setProfileVisibility(e.target.value as typeof profileVisibility)}
                  className={selectClass}
                  aria-label={t("profileVisibilityAria")}
                >
                  {VISIBILITY_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {t(`visibility.${value}`)}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <ChevronDownIcon />
                </span>
              </div>
            }
          />
          <SettingsRow
            title={t("showEmail")}
            description={t("showEmailDescription")}
            control={
              <SettingsToggle checked={showEmail} onChange={setShowEmail} aria-label={t("showEmailAria")} />
            }
          />
          <SettingsRow
            title={t("showActivity")}
            description={t("showActivityDescription")}
            control={
              <SettingsToggle checked={showActivity} onChange={setShowActivity} aria-label={t("showActivityAria")} />
            }
          />
          <SettingsRow
            title={t("allowFollows")}
            description={t("allowFollowsDescription")}
            control={
              <SettingsToggle checked={allowFollows} onChange={setAllowFollows} aria-label={t("allowFollowsAria")} />
            }
            showDivider={false}
          />
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={onSave}
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

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
