"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { theme } from "@/lib/theme";
import { SettingsRow, settingsCardClass, SettingsToggle } from "./SettingsPrimitives";

export function AdminNotificationPreferences() {
  const t = useTranslations("Dashboard.notificationsPage.preferences");
  const [articleUpdates, setArticleUpdates] = useState(true);
  const [newFollowers, setNewFollowers] = useState(true);
  const [newContributor, setNewContributor] = useState(true);
  const [comments, setComments] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(true);
  const [savedFlash, setSavedFlash] = useState(false);

  const handleSave = useCallback(() => {
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <div className={settingsCardClass} style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}>
        <h1 className="text-lg font-bold text-foreground">{t("pageTitle")}</h1>

        <div className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">{t("emailSection")}</h2>
          <div className="mt-2">
            <SettingsRow
              title={t("articleUpdates")}
              description={t("articleUpdatesDescription")}
              control={
                <SettingsToggle
                  checked={articleUpdates}
                  onChange={setArticleUpdates}
                  aria-label={t("articleUpdatesAria")}
                />
              }
            />
            <SettingsRow
              title={t("newFollowers")}
              description={t("newFollowersDescription")}
              control={
                <SettingsToggle checked={newFollowers} onChange={setNewFollowers} aria-label={t("newFollowersAria")} />
              }
            />
            <SettingsRow
              title={t("newContributor")}
              description={t("newContributorDescription")}
              control={
                <SettingsToggle
                  checked={newContributor}
                  onChange={setNewContributor}
                  aria-label={t("newContributorAria")}
                />
              }
            />
            <SettingsRow
              title={t("comments")}
              description={t("commentsDescription")}
              control={<SettingsToggle checked={comments} onChange={setComments} aria-label={t("commentsAria")} />}
            />
            <SettingsRow
              title={t("weeklyDigest")}
              description={t("weeklyDigestDescription")}
              control={
                <SettingsToggle checked={weeklyDigest} onChange={setWeeklyDigest} aria-label={t("weeklyDigestAria")} />
              }
              showDivider={false}
            />
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">{t("pushSection")}</h2>
          <div className="mt-2">
            <SettingsRow
              title={t("browserNotifications")}
              description={t("browserNotificationsDescription")}
              control={
                <SettingsToggle
                  checked={browserNotifications}
                  onChange={setBrowserNotifications}
                  aria-label={t("browserNotificationsAria")}
                />
              }
              showDivider={false}
            />
          </div>
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
