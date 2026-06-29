"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/services/api";
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
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";
import { securityAdminRoles } from "@/lib/dashboard/security-constants";

interface LiveSession {
  id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  expires_at: string;
  is_current?: boolean;
}

interface AuditEntry {
  id: string;
  action: string;
  entity_type: string;
  created_at: string;
  user?: { full_name: string; username: string };
  details?: Record<string, unknown>;
}

const ACCENT = "var(--tott-gold-chip-bg)";

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

  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    api.get("/author/settings/account/sessions").then((r: { data: any }) => {
      setSessions(r.data?.sessions ?? []);
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    api.get("/audit-trails", { params: { limit: 20, sortBy: "timestamp", order: "DESC" } }).then((r: { data: any }) => {
      const rows = r.data?.data ?? r.data?.rows ?? r.data ?? [];
      setAuditLogs(Array.isArray(rows) ? rows : []);
    });
  }, []);

  const [require2fa, setRequire2fa] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState<SessionTimeoutKey>("m30");
  const [lockoutAttempts, setLockoutAttempts] = useState(5);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [ipWhitelist, setIpWhitelist] = useState(false);

  const openConfigure = (title: string) => {
    setConfigureRoleTitle(title);
    setConfigureOpen(true);
  };

  const endSession = async (id: string) => {
    await api.delete(`/author/settings/account/sessions/${id}`);
    setSessions((prev) => prev.filter((r) => r.id !== id));
  };

  const endAllOtherSessions = async () => {
    const others = sessions.filter((s) => !s.is_current);
    await Promise.all(others.map((s) => api.delete(`/author/settings/account/sessions/${s.id}`)));
    setSessions((prev) => prev.filter((s) => s.is_current));
  };

  const tabIconClass = "text-[var(--tott-dash-gold-text)] [&_svg]:h-4 [&_svg]:w-4";

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
        <div className="flex w-fit flex-wrap items-center gap-1 rounded-xl bg-[var(--tott-elevated)] p-1">
          {SECURITY_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all sm:px-5 ${
                  activeTab === tab.id
                    ? "bg-[var(--tott-dash-control-bg)] text-foreground"
                    : "bg-transparent text-[var(--tott-tab-inactive)] hover:text-[var(--tott-tab-inactive-hover)]"
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
            <p className="mt-1 text-sm text-[var(--tott-muted)]">{t("roles.intro")}</p>
            <div className="mt-6 space-y-3">
              {securityAdminRoles.map((role) => (
                <div
                  key={role.id}
                  className="relative flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                >
                  <ChamferedFrame />
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] text-[var(--tott-dash-gold-text)]"
                      aria-hidden
                    >
                      <span className="[&_svg]:h-[18px] [&_svg]:w-[18px]">
                        <ShieldIcon />
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{t(`roles.${role.id}.title`)}</p>
                      <span className="mt-1 inline-block rounded-full border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-2.5 py-0.5 text-xs text-[var(--tott-muted)]">
                        {t(`roles.${role.id}.userBadge`)}
                      </span>
                      <p className="mt-2 text-sm text-[var(--tott-muted)]">{t(`roles.${role.id}.description`)}</p>
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
                <p className="mt-1 text-sm text-[var(--tott-muted)]">{t("sessions.intro")}</p>
              </div>
              <button
                type="button"
                onClick={endAllOtherSessions}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-[var(--tott-on-accent)] transition-opacity hover:opacity-90"
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
                        className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--tott-dash-gold-text)] ${
                          h === "" ? "w-24 text-end" : ""
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--tott-card-border)]">
                  {sessions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-[var(--tott-muted)]">{t("sessions.empty")}</td>
                    </tr>
                  )}
                  {sessions.map((row) => (
                    <tr key={row.id} className="bg-[var(--tott-dash-surface)]">
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {row.is_current ? t("sessions.youCurrent") : t("sessions.userFallback")}
                      </td>
                      <td className="px-4 py-3 text-[var(--tott-muted)]">{row.ip_address ?? "—"}</td>
                      <td className="px-4 py-3 text-[var(--tott-muted)]">—</td>
                      <td className="px-4 py-3 text-[var(--tott-muted)] text-xs truncate max-w-[160px]">{row.user_agent ?? "—"}</td>
                      <td className="px-4 py-3 text-[var(--tott-muted)] text-xs">
                        {row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}
                      </td>
                      <td className={`px-4 py-3 font-medium text-sm ${row.is_current ? "text-emerald-400" : "text-[var(--tott-muted)]"}`}>
                        {row.is_current ? t("sessions.status.current") : t("sessions.status.idle")}
                      </td>
                      <td className="px-4 py-3 text-end">
                        {row.is_current ? (
                          <span className="text-xs text-[var(--tott-muted)]">—</span>
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
            <p className="mt-1 text-sm text-[var(--tott-muted)]">{t("controlPanel.settingsTabSubtitle")}</p>

            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="relative p-5 sm:p-6">
                <ChamferedFrame />
                <h3 className="text-base font-bold text-foreground">{t("controlPanel.authenticationCardTitle")}</h3>
                <p className="mt-1 text-sm text-[var(--tott-muted)]">{t("controlPanel.authenticationCardSubtitle")}</p>

                <div className="mt-6 space-y-5 border-t border-[var(--tott-card-border)] pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground">{t("controlPanel.require2faTitle")}</p>
                      <p className="mt-0.5 text-sm text-[var(--tott-muted)]">{t("controlPanel.require2faDescription")}</p>
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
                      <p className="mt-0.5 text-sm text-[var(--tott-muted)]">{t("controlPanel.sessionTimeoutShortDescription")}</p>
                    </div>
                    <select
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value as SessionTimeoutKey)}
                      className="w-full max-w-[200px] rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-3 py-2 text-sm text-foreground focus:border-[var(--tott-card-border)] focus:outline-none sm:w-auto"
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
                      <p className="mt-0.5 text-sm text-[var(--tott-muted)]">{t("controlPanel.lockoutDescription")}</p>
                    </div>
                    <input
                      type="number"
                      min={3}
                      max={20}
                      value={lockoutAttempts}
                      onChange={(e) => setLockoutAttempts(Number(e.target.value) || 5)}
                      className="w-full max-w-[100px] rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-3 py-2 text-sm text-foreground focus:border-[var(--tott-card-border)] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="relative p-5 sm:p-6">
                <ChamferedFrame />
                <h3 className="text-base font-bold text-foreground">{t("controlPanel.systemControlsTitle")}</h3>
                <p className="mt-1 text-sm text-[var(--tott-muted)]">{t("controlPanel.systemControlsSubtitle")}</p>

                <div className="mt-6 space-y-5 border-t border-[var(--tott-card-border)] pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-foreground">{t("controlPanel.maintenanceTitle")}</p>
                      <p className="mt-0.5 text-sm text-[var(--tott-muted)]">{t("controlPanel.maintenanceDescription")}</p>
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
                      <p className="mt-0.5 text-sm text-[var(--tott-muted)]">{t("controlPanel.ipWhitelistDescription")}</p>
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
                    <span className="text-[var(--tott-dash-gold-text)] [&_svg]:h-4 [&_svg]:w-4">
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
            <p className="mt-1 text-sm text-[var(--tott-muted)]">{t("logs.intro")}</p>
            <div className="mt-6 space-y-3">
              {auditLogs.length === 0 && (
                <p className="text-center text-sm text-[var(--tott-muted)] py-8">{t("logs.empty")}</p>
              )}
              {auditLogs.map((entry) => {
                const isDelete = entry.action === "DELETE";
                return (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 rounded-xl border bg-[var(--tott-dash-surface)] px-4 py-4 sm:gap-5 sm:px-5 ${
                      isDelete ? "border-red-600/45" : "border-[var(--tott-card-border)]"
                    }`}
                  >
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] text-[var(--tott-dash-gold-text)]"
                      aria-hidden
                    >
                      <span className="[&_svg]:h-[18px] [&_svg]:w-[18px]">
                        {isDelete ? <AlertTriangleIcon /> : <SquareCheckIcon />}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground capitalize">
                        {entry.action} {entry.entity_type?.replace(/_/g, " ")}
                      </p>
                      <p className="mt-0.5 text-sm text-[var(--tott-muted)]">
                        {entry.user?.full_name ?? entry.user?.username ?? t("logs.systemUser")}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm text-[var(--tott-muted)]">
                      {entry.created_at ? new Date(entry.created_at).toLocaleString() : "—"}
                    </p>
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
