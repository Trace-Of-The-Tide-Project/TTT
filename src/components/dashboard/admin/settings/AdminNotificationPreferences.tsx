"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { theme } from "@/lib/theme";
import { SettingsRow, settingsCardClass, SettingsToggle } from "./SettingsPrimitives";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
} from "@/services/notifications.service";

type SaveState = "idle" | "saving" | "saved" | "error";

const DEFAULTS: NotificationPreferences = {
  article_updates: true,
  new_followers: true,
  new_contributors: true,
  comments: false,
  weekly_digest: true,
  push_browser: true,
};

export function AdminNotificationPreferences() {
  const t = useTranslations("Dashboard.notificationsPage.preferences");
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  useEffect(() => {
    getNotificationPreferences()
      .then(setPrefs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = useCallback((key: keyof NotificationPreferences) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaveState("saving");
    try {
      const updated = await updateNotificationPreferences(prefs);
      setPrefs(updated);
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 2000);
    } catch {
      setSaveState("error");
      window.setTimeout(() => setSaveState("idle"), 3000);
    }
  }, [prefs]);

  const saveLabel =
    saveState === "saving"
      ? "Saving…"
      : saveState === "saved"
        ? t("saved")
        : saveState === "error"
          ? "Error — try again"
          : t("saveChanges");

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
                  checked={prefs.article_updates}
                  onChange={() => toggle("article_updates")}
                  aria-label={t("articleUpdatesAria")}
                />
              }
            />
            <SettingsRow
              title={t("newFollowers")}
              description={t("newFollowersDescription")}
              control={
                <SettingsToggle
                  checked={prefs.new_followers}
                  onChange={() => toggle("new_followers")}
                  aria-label={t("newFollowersAria")}
                />
              }
            />
            <SettingsRow
              title={t("newContributor")}
              description={t("newContributorDescription")}
              control={
                <SettingsToggle
                  checked={prefs.new_contributors}
                  onChange={() => toggle("new_contributors")}
                  aria-label={t("newContributorAria")}
                />
              }
            />
            <SettingsRow
              title={t("comments")}
              description={t("commentsDescription")}
              control={
                <SettingsToggle
                  checked={prefs.comments}
                  onChange={() => toggle("comments")}
                  aria-label={t("commentsAria")}
                />
              }
            />
            <SettingsRow
              title={t("weeklyDigest")}
              description={t("weeklyDigestDescription")}
              control={
                <SettingsToggle
                  checked={prefs.weekly_digest}
                  onChange={() => toggle("weekly_digest")}
                  aria-label={t("weeklyDigestAria")}
                />
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
                  checked={prefs.push_browser}
                  onChange={() => toggle("push_browser")}
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
            disabled={loading || saveState === "saving"}
            className="w-full rounded-lg py-3.5 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: saveState === "error" ? "#ef4444" : theme.accentGold }}
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
