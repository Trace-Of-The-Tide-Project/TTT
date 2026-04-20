"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  ShieldIcon,
  ActivityIcon,
  SettingsIcon,
  UsersIcon,
  XIcon,
  DownloadIcon,
  SquareCheckIcon,
  AlertTriangleIcon,
} from "@/components/ui/icons";
import { ConfigureRoleModal } from "@/components/dashboard/modals/ConfigureRoleModal";
import { PermissionToggle } from "@/components/dashboard/admin/roles/PermissionToggle";
import {
  securityAdminRoles,
  adminSessionTableRows,
  securityLogEntries,
  type AdminSessionTableRow,
} from "@/lib/dashboard/security-constants";

const ACCENT = "#E8DDC0";

const SECURITY_TABS = [
  { id: "roles" as const, icon: ShieldIcon },
  { id: "sessions" as const, icon: ActivityIcon },
  { id: "settings" as const, icon: SettingsIcon },
  { id: "logs" as const, icon: UsersIcon },
];

type SecurityTabId = (typeof SECURITY_TABS)[number]["id"];

const SESSION_TIMEOUT_KEYS = ["m15", "m30", "m60"] as const;
type SessionTimeoutKey = (typeof SESSION_TIMEOUT_KEYS)[number];

export function SecurityContent() {
  const t = useTranslations("Dashboard.securityPage");
  const [activeTab, setActiveTab] = useState<SecurityTabId>("roles");
  const [configureOpen, setConfigureOpen] = useState(false);
  const [configureRoleTitle, setConfigureRoleTitle] = useState<string | null>(null);

  const [sessions, setSessions] = useState<AdminSessionTableRow[]>(() => [...adminSessionTableRows]);

  const [require2fa, setRequire2fa] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState<SessionTimeoutKey>("m30");
  const [lockoutAttempts, setLockoutAttempts] = useState(5);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [ipWhitelist, setIpWhitelist] = useState(false);

  const openConfigure = (title: string) => {
    setConfigureRoleTitle(title);
    setConfigureOpen(true);
  };

  const endSession = (id: string) => {
    setSessions((prev) => prev.filter((r) => r.id !== id));
  };

  const endAllOtherSessions = () => {
    setSessions((prev) => prev.filter((r) => r.status === "current"));
  };

  const tabIconClass = "text-[#E8DDC0] [&_svg]:h-4 [&_svg]:w-4";

  const statusLabel = (s: AdminSessionTableRow["status"]) => t(`sessions.status.${s}`);

  const statusClass = (s: AdminSessionTableRow["status"]) => {
    if (s === "idle") return "text-gray-500";
    return "text-emerald-400";
  };

  const sessionColumns = [
    t("sessions.columns.user"),
    t("sessions.columns.ip"),
    t("sessions.columns.location"),
    t("sessions.columns.device"),
    t("sessions.columns.lastActive"),
    t("sessions.columns.status"),
    "",
  ] as const;

  return (
    <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
      <div className="rounded-2xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 lg:p-8">
        <div className="flex w-fit flex-wrap items-center gap-1 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] p-1">
          {SECURITY_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all sm:px-5 ${
                  activeTab === tab.id
                    ? "border border-[#4A4A4A] bg-[var(--tott-dash-control-bg)] text-foreground shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                    : "border border-transparent bg-transparent text-[#AAAAAA] hover:text-[#E0E0E0]"
                }`}
              >
                <span className={tabIconClass}>
                  <Icon />
                </span>
                {t(`tabs.${tab.id}`)}
              </button>
            );
          })}
        </div>

        {activeTab === "roles" && (
          <div className="mt-6">
            <h2 className="text-lg font-bold text-foreground">{t("tabs.roles")}</h2>
            <p className="mt-1 text-sm text-gray-500">{t("roles.intro")}</p>
            <div className="mt-6 space-y-3">
              {securityAdminRoles.map((role) => (
                <div
                  key={role.id}
                  className="flex flex-col gap-4 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] text-[#E8DDC0]"
                      aria-hidden
                    >
                      <span className="[&_svg]:h-[18px] [&_svg]:w-[18px]">
                        <ShieldIcon />
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{t(`roles.${role.id}.title`)}</p>
                      <span className="mt-1 inline-block rounded-full border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-2.5 py-0.5 text-xs text-gray-400">
                        {t(`roles.${role.id}.userBadge`)}
                      </span>
                      <p className="mt-2 text-sm text-gray-500">{t(`roles.${role.id}.description`)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => openConfigure(t(`roles.${role.id}.title`))}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-surface-inset)] sm:self-center"
                  >
                    <span className="text-foreground [&_svg]:h-4 [&_svg]:w-4">
                      <SettingsIcon />
                    </span>
                    {t("roles.configure")}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="mt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">{t("tabs.sessions")}</h2>
                <p className="mt-1 text-sm text-gray-500">{t("sessions.intro")}</p>
              </div>
              <button
                type="button"
                onClick={endAllOtherSessions}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-[#111] transition-opacity hover:opacity-90"
                style={{ backgroundColor: ACCENT }}
              >
                <span className="[&_svg]:h-4 [&_svg]:w-4">
                  <XIcon />
                </span>
                {t("sessions.endAllOther")}
              </button>
            </div>

            <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)]">
              <table className="w-full min-w-[720px] border-collapse text-start text-sm">
                <thead>
                  <tr className="border-b border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)]">
                    {sessionColumns.map((h) => (
                      <th
                        key={h || "actions"}
                        className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[#E8DDC0] ${
                          h === "" ? "w-24 text-end" : ""
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--tott-card-border)]">
                  {sessions.map((row) => (
                    <tr key={row.id} className="bg-[var(--tott-dash-surface)]">
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {t(`sessions.sampleRows.${row.id}.user`)}
                      </td>
                      <td className="px-4 py-3 text-gray-400">{row.ip}</td>
                      <td className="px-4 py-3 text-gray-400">{t(`sessions.sampleRows.${row.id}.location`)}</td>
                      <td className="px-4 py-3 text-gray-400">{t(`sessions.sampleRows.${row.id}.device`)}</td>
                      <td className="px-4 py-3 text-gray-400">{t(`sessions.sampleRows.${row.id}.lastActive`)}</td>
                      <td className={`px-4 py-3 font-medium ${statusClass(row.status)}`}>
                        {statusLabel(row.status)}
                      </td>
                      <td className="px-4 py-3 text-end">
                        {row.status === "current" ? (
                          <span className="text-xs text-gray-600">—</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => endSession(row.id)}
                            className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-[var(--tott-dash-surface-inset)]"
                          >
                            {t("sessions.end")}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="mt-6">
            <h2 className="text-lg font-bold text-foreground">{t("tabs.settings")}</h2>
            <p className="mt-1 text-sm text-gray-500">{t("controlPanel.settingsTabSubtitle")}</p>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-5 sm:p-6">
                <h3 className="text-base font-bold text-foreground">{t("controlPanel.authenticationCardTitle")}</h3>
                <p className="mt-1 text-sm text-gray-500">{t("controlPanel.authenticationCardSubtitle")}</p>

                <div className="mt-6 space-y-5 border-t border-[var(--tott-card-border)] pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground">{t("controlPanel.require2faTitle")}</p>
                      <p className="mt-0.5 text-sm text-gray-500">{t("controlPanel.require2faDescription")}</p>
                    </div>
                    <PermissionToggle
                      checked={require2fa}
                      onChange={setRequire2fa}
                      checkedColor={ACCENT}
                    />
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-foreground">{t("controlPanel.sessionTimeoutShortLabel")}</p>
                      <p className="mt-0.5 text-sm text-gray-500">{t("controlPanel.sessionTimeoutShortDescription")}</p>
                    </div>
                    <select
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value as SessionTimeoutKey)}
                      className="w-full max-w-[200px] rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-3 py-2 text-sm text-foreground focus:border-[#555] focus:outline-none sm:w-auto"
                    >
                      {SESSION_TIMEOUT_KEYS.map((key) => (
                        <option key={key} value={key}>
                          {t(`settings.timeoutOptions.${key}`)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium text-foreground">{t("controlPanel.lockoutTitle")}</p>
                      <p className="mt-0.5 text-sm text-gray-500">{t("controlPanel.lockoutDescription")}</p>
                    </div>
                    <input
                      type="number"
                      min={3}
                      max={20}
                      value={lockoutAttempts}
                      onChange={(e) => setLockoutAttempts(Number(e.target.value) || 5)}
                      className="w-full max-w-[100px] rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-3 py-2 text-sm text-foreground focus:border-[#555] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-5 sm:p-6">
                <h3 className="text-base font-bold text-foreground">{t("controlPanel.systemControlsTitle")}</h3>
                <p className="mt-1 text-sm text-gray-500">{t("controlPanel.systemControlsSubtitle")}</p>

                <div className="mt-6 space-y-5 border-t border-[var(--tott-card-border)] pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground">{t("controlPanel.maintenanceTitle")}</p>
                      <p className="mt-0.5 text-sm text-gray-500">{t("controlPanel.maintenanceDescription")}</p>
                    </div>
                    <PermissionToggle
                      checked={maintenanceMode}
                      onChange={setMaintenanceMode}
                      checkedColor={ACCENT}
                    />
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground">{t("controlPanel.ipWhitelistTitle")}</p>
                      <p className="mt-0.5 text-sm text-gray-500">{t("controlPanel.ipWhitelistDescription")}</p>
                    </div>
                    <PermissionToggle
                      checked={ipWhitelist}
                      onChange={setIpWhitelist}
                      checkedColor={ACCENT}
                    />
                  </div>

                  <button
                    type="button"
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] py-3 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)]"
                  >
                    <span className="text-[#E8DDC0] [&_svg]:h-4 [&_svg]:w-4">
                      <DownloadIcon />
                    </span>
                    {t("settings.backup")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="mt-6">
            <h2 className="text-lg font-bold text-foreground">{t("tabs.logs")}</h2>
            <p className="mt-1 text-sm text-gray-500">{t("logs.intro")}</p>
            <div className="mt-6 space-y-3">
              {securityLogEntries.map((entry) => {
                const isWarning = entry.variant === "warning";
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 rounded-xl border bg-[var(--tott-dash-surface)] px-4 py-4 sm:gap-5 sm:px-5 ${
                      isWarning ? "border-red-600/45" : "border-[var(--tott-card-border)]"
                    }`}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] text-[#E8DDC0]"
                      aria-hidden
                    >
                      <span className="[&_svg]:h-[18px] [&_svg]:w-[18px]">
                        {isWarning ? <AlertTriangleIcon /> : <SquareCheckIcon />}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{t(`logs.entries.${entry.id}.title`)}</p>
                      <p className="mt-0.5 text-sm text-gray-500">{t(`logs.entries.${entry.id}.meta`)}</p>
                    </div>
                    <p className="shrink-0 text-sm text-gray-500">{t(`logs.entries.${entry.id}.timeAgo`)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <ConfigureRoleModal
        open={configureOpen}
        onClose={() => setConfigureOpen(false)}
        roleDisplayName={configureRoleTitle ?? undefined}
      />
    </div>
  );
}
