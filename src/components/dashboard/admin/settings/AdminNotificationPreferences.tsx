"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { theme } from "@/lib/theme";
import { SettingsRow, settingsCardClass, SettingsToggle } from "./SettingsPrimitives";
import { useNotificationPreferences } from "@/hooks/queries/notifications";
import { useUpdateNotificationPreferences } from "@/hooks/mutations/notifications";
import type { NotificationPreferences } from "@/services/notifications.service";
import { useAuthUser } from "@/components/providers/AuthProvider";
import { canManageEditorNotifications } from "@/lib/auth/roles";

type SaveState = "idle" | "saving" | "saved" | "error";

const DEFAULTS: NotificationPreferences = {
  article_updates: true,
  new_followers: true,
  new_contributors: true,
  comments: false,
  weekly_digest: true,
  push_browser: true,
  new_submissions: true,
  author_messages: true,
  revision_updates: true,
  flagged_content: false,
};

export function AdminNotificationPreferences() {
  const t = useTranslations("Dashboard.notificationsPage.preferences");
  const user = useAuthUser();
  const showEditor = canManageEditorNotifications(user);
  const { data: serverPrefs, isPending: loading } = useNotificationPreferences();
  const updateMutation = useUpdateNotificationPreferences();
  const [prefs, setPrefs] = useState<NotificationPreferences>(DEFAULTS);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  // Seed local prefs from the server response. Render-phase prev-value
  // pattern instead of an effect.
  const [prevServerPrefs, setPrevServerPrefs] = useState(serverPrefs);
  if (serverPrefs && serverPrefs !== prevServerPrefs) {
    setPrevServerPrefs(serverPrefs);
    setPrefs(serverPrefs);
  }

  const toggle = useCallback((key: keyof NotificationPreferences) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }, []);

  const handleSave = useCallback(() => {
    setSaveState("saving");
    updateMutation.mutate(prefs, {
      onSuccess: (updated) => {
        if (updated) setPrefs(updated);
        setSaveState("saved");
        window.setTimeout(() => setSaveState("idle"), 2000);
      },
      onError: () => {
        setSaveState("error");
        window.setTimeout(() => setSaveState("idle"), 3000);
      },
    });
  }, [prefs, updateMutation]);

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
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--tott-muted)]">{t("emailSection")}</h2>
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
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--tott-muted)]">{t("pushSection")}</h2>
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

        {showEditor ? (
          <div className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--tott-muted)]">
              {t("editorSection")}
            </h2>
            <div className="mt-2">
              <SettingsRow
                title={t("newSubmissions")}
                description={t("newSubmissionsDescription")}
                control={
                  <SettingsToggle
                    checked={prefs.new_submissions}
                    onChange={() => toggle("new_submissions")}
                    aria-label={t("newSubmissionsAria")}
                  />
                }
              />
              <SettingsRow
                title={t("authorMessages")}
                description={t("authorMessagesDescription")}
                control={
                  <SettingsToggle
                    checked={prefs.author_messages}
                    onChange={() => toggle("author_messages")}
                    aria-label={t("authorMessagesAria")}
                  />
                }
              />
              <SettingsRow
                title={t("revisionUpdates")}
                description={t("revisionUpdatesDescription")}
                control={
                  <SettingsToggle
                    checked={prefs.revision_updates}
                    onChange={() => toggle("revision_updates")}
                    aria-label={t("revisionUpdatesAria")}
                  />
                }
              />
              <SettingsRow
                title={t("flaggedContent")}
                description={t("flaggedContentDescription")}
                control={
                  <SettingsToggle
                    checked={prefs.flagged_content}
                    onChange={() => toggle("flagged_content")}
                    aria-label={t("flaggedContentAria")}
                  />
                }
                showDivider={false}
              />
            </div>
          </div>
        ) : null}

        <div className="mt-10">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || saveState === "saving"}
            className="w-full rounded-lg py-3.5 text-sm font-semibold text-[var(--tott-on-accent)] transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: saveState === "error" ? "#ef4444" : theme.accentGold }}
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
