"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { theme } from "@/lib/theme";
import { SettingsRow, settingsCardClass, SettingsToggle } from "./SettingsPrimitives";
import { usePrivacy } from "@/hooks/queries/privacy";
import { useUpdatePrivacy } from "@/hooks/mutations/privacy";
import { accountErrorMessage } from "@/services/account.service";
import type { PrivacyData, ProfileVisibility } from "@/services/privacy.service";

type SaveState = "idle" | "saving" | "saved" | "error";

const VISIBILITY_VALUES: readonly ProfileVisibility[] = ["public", "followers_only", "private"];

// The i18n label key kept the legacy short name `followers`; the stored value is
// the backend-canonical `followers_only`. Map value → label key here.
const VISIBILITY_LABEL_KEY: Record<ProfileVisibility, string> = {
  public: "public",
  followers_only: "followers",
  private: "private",
};

const DEFAULTS: PrivacyData = {
  profile_visibility: "public",
  show_email: true,
  show_activity: false,
  allow_follows: true,
};

export function AdminPrivacySettings() {
  const t = useTranslations("Dashboard.adminPrivacy");
  const { data: serverPrivacy, isPending: loading, isError } = usePrivacy();
  const updateMutation = useUpdatePrivacy();
  const [privacy, setPrivacy] = useState<PrivacyData>(DEFAULTS);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  // Seed local state from the server response (render-phase prev-value pattern).
  const [prev, setPrev] = useState<PrivacyData | undefined>(undefined);
  if (serverPrivacy && serverPrivacy !== prev) {
    setPrev(serverPrivacy);
    setPrivacy(serverPrivacy);
  }

  const selectClass =
    "min-w-[9.5rem] cursor-pointer appearance-none rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] py-2.5 pl-3 pr-9 text-sm text-foreground outline-none focus:border-[var(--tott-accent-gold)]";

  const handleSave = useCallback(() => {
    setSaveState("saving");
    setSaveError(null);
    updateMutation.mutate(privacy, {
      onSuccess: () => {
        setSaveState("saved");
        window.setTimeout(() => setSaveState("idle"), 2000);
      },
      onError: (e) => {
        setSaveError(accountErrorMessage(e, t("saveError")));
        setSaveState("error");
        window.setTimeout(() => setSaveState("idle"), 4000);
      },
    });
  }, [privacy, updateMutation, t]);

  const saveLabel =
    saveState === "saving" ? t("saving") : saveState === "saved" ? t("saved") : t("saveChanges");

  return (
    <div className="mx-auto max-w-3xl">
      <div className={settingsCardClass} style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}>
        <h1 className="text-lg font-bold text-foreground">{t("pageTitle")}</h1>

        {loading ? (
          <p className="mt-6 text-sm text-[var(--tott-muted)]">{t("loading")}</p>
        ) : isError ? (
          <p className="mt-6 text-sm text-[var(--tott-dash-negative)]" role="alert">
            {t("loadError")}
          </p>
        ) : null}

        <div className="mt-6">
          <SettingsRow
            title={t("profileVisibility")}
            description={t("profileVisibilityDescription")}
            control={
              <div className="relative">
                <select
                  value={privacy.profile_visibility}
                  onChange={(e) =>
                    setPrivacy((p) => ({
                      ...p,
                      profile_visibility: e.target.value as ProfileVisibility,
                    }))
                  }
                  className={selectClass}
                  aria-label={t("profileVisibilityAria")}
                >
                  {VISIBILITY_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {t(`visibility.${VISIBILITY_LABEL_KEY[value]}`)}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--tott-muted)]">
                  <ChevronDownIcon />
                </span>
              </div>
            }
          />
          <SettingsRow
            title={t("showEmail")}
            description={t("showEmailDescription")}
            control={
              <SettingsToggle
                checked={privacy.show_email}
                onChange={(next) => setPrivacy((p) => ({ ...p, show_email: next }))}
                aria-label={t("showEmailAria")}
              />
            }
          />
          <SettingsRow
            title={t("showActivity")}
            description={t("showActivityDescription")}
            control={
              <SettingsToggle
                checked={privacy.show_activity}
                onChange={(next) => setPrivacy((p) => ({ ...p, show_activity: next }))}
                aria-label={t("showActivityAria")}
              />
            }
          />
          <SettingsRow
            title={t("allowFollows")}
            description={t("allowFollowsDescription")}
            control={
              <SettingsToggle
                checked={privacy.allow_follows}
                onChange={(next) => setPrivacy((p) => ({ ...p, allow_follows: next }))}
                aria-label={t("allowFollowsAria")}
              />
            }
            showDivider={false}
          />
        </div>

        {saveError ? (
          <p className="mt-6 text-sm text-[var(--tott-dash-negative)]" role="alert">
            {saveError}
          </p>
        ) : null}

        <div className="mt-8">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || saveState === "saving"}
            className="w-full rounded-lg py-3.5 text-sm font-semibold text-[var(--tott-on-accent)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: saveState === "error" ? "#ef4444" : theme.accentGold }}
          >
            {saveLabel}
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
