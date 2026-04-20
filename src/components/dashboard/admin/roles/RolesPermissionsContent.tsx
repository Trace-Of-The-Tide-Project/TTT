"use client";

import type { ReactNode } from "react";
import { useState, useRef, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { matrixRoleColumnKey, permissionRowKey } from "@/lib/dashboard/matrix-i18n";
import {
  roleStats,
  roleHierarchy,
  MATRIX_ROLES,
  PERMISSIONS,
  sampleEditorApplications,
  type EditorApplication,
  type EditorAppStatus,
} from "@/lib/dashboard/roles-constants";
import { theme } from "@/lib/theme";
import {
  SearchIcon,
  EyeIcon,
  SquareCheckIcon,
  XIcon,
  ClockIcon,
  MoreDotsIcon,
} from "@/components/ui/icons";
import { ConfigureRoleModal } from "@/components/dashboard/modals/ConfigureRoleModal";
import { PermissionToggle } from "@/components/dashboard/admin/roles/PermissionToggle";

function hexPath(cx: number, cy: number, r: number) {
  const corners = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
  const rounding = r * 0.18;
  let d = "";
  for (let i = 0; i < 6; i++) {
    const prev = corners[(i + 5) % 6];
    const curr = corners[i];
    const next = corners[(i + 1) % 6];
    const dx1 = curr.x - prev.x,
      dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x,
      dy2 = next.y - curr.y;
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    const sx = curr.x - (dx1 / len1) * rounding;
    const sy = curr.y - (dy1 / len1) * rounding;
    const ex = curr.x + (dx2 / len2) * rounding;
    const ey = curr.y + (dy2 / len2) * rounding;
    if (i === 0) d += `M${sx},${sy}`;
    else d += `L${sx},${sy}`;
    d += `Q${curr.x},${curr.y} ${ex},${ey}`;
  }
  return d + "Z";
}

function RoleHierarchyHex({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 48 48" fill="none">
        <path
          d={hexPath(24, 24, 22)}
          fill="var(--tott-dash-icon-bg)"
          stroke="var(--tott-card-border)"
          strokeWidth="1.5"
        />
      </svg>
      <span
        className="relative z-10 flex items-center justify-center [&>svg]:h-5 [&>svg]:w-5"
        style={{ color: "#E8DDC0" }}
      >
        {children}
      </span>
    </div>
  );
}

const TAB_IDS = ["overview", "permissions", "editor-apps"] as const;
type RolesTabId = (typeof TAB_IDS)[number];

type MatrixState = Record<string, Record<string, boolean>>;

function getInitialMatrix(): MatrixState {
  const matrix: MatrixState = {};
  PERMISSIONS.forEach((perm) => {
    matrix[perm] = {};
    MATRIX_ROLES.forEach((role, ri) => {
      // Admin has all permissions; others have partial
      const isAdmin = role === "Admin";
      const defaultForRole =
        isAdmin ||
        perm === "View Content" ||
        (perm === "Create Content" && ri >= 1) ||
        (perm === "Edit Own Content" && ri >= 2) ||
        (perm === "Edit All Content" && ri >= 4) ||
        (perm === "Delete Content" && ri >= 4) ||
        (perm === "Access Analytics" && ri >= 3);
      matrix[perm][role] = defaultForRole;
    });
  });
  return matrix;
}

function EditorAppActionsDropdown({
  app,
  onAction,
}: {
  app: EditorApplication;
  onAction?: (action: string, appId: string) => void;
}) {
  const t = useTranslations("Dashboard.rolesPermissions.editorApps.actions");
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const actions = [
    { id: "view", labelKey: "viewApplication" as const },
    ...(app.status === "approved"
      ? [{ id: "revoke", labelKey: "revokeApproval" as const, destructive: true }]
      : app.status === "rejected"
        ? [{ id: "reconsider", labelKey: "reconsider" as const }]
        : []),
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="rounded-full p-2 transition-colors hover:bg-[var(--tott-dash-ghost-hover)]"
        style={{ backgroundColor: "#333", color: "#A3A3A3" }}
        aria-label={t("menuAria")}
        aria-expanded={isOpen}
      >
        <MoreDotsIcon />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full z-20 mt-1 min-w-[160px] rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] py-1 shadow-lg">
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => {
                onAction?.(action.id, app.id);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[var(--tott-dash-surface-inset)] ${
                (action as { destructive?: boolean }).destructive
                  ? "text-red-400 hover:bg-red-500/10"
                  : "text-foreground"
              }`}
            >
              {t(action.labelKey)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EditorApplications() {
  const te = useTranslations("Dashboard.rolesPermissions.editorApps");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<EditorAppStatus | "all">("all");
  const [applications, setApplications] = useState<EditorApplication[]>(
    () => sampleEditorApplications
  );

  const statusFilters = useMemo(
    () =>
      (["all", "pending", "approved", "rejected"] as const).map((value) => ({
        value,
        label:
          value === "all"
            ? te("filterAll")
            : value === "pending"
              ? te("filterPending")
              : value === "approved"
                ? te("filterApproved")
                : te("filterRejected"),
      })),
    [te],
  );

  const filtered = applications.filter((app) => {
    const matchesSearch =
      !search.trim() ||
      app.name.toLowerCase().includes(search.toLowerCase().trim()) ||
      app.email.toLowerCase().includes(search.toLowerCase().trim());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const counts = {
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const handleStatusChange = (status: EditorAppStatus | "all") => {
    setStatusFilter(status);
  };

  const handleApprove = (id: string) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "approved" as const } : a))
    );
  };

  const handleReject = (id: string) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "rejected" as const } : a))
    );
  };

  const statusBadgeStyle = (s: EditorAppStatus) => {
    if (s === "pending") return "rounded-md bg-[#444] px-3 py-1 text-sm font-medium text-foreground";
    if (s === "approved")
      return "rounded-md bg-emerald-600/80 px-3 py-1 text-sm font-medium text-foreground";
    return "rounded-md bg-red-600/80 px-3 py-1 text-sm font-medium text-foreground";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder={te("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-gray-500 focus:border-[#555] focus:outline-none"
          />
        </div>
        <div className="flex gap-2">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => handleStatusChange(f.value)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                statusFilter === f.value
                  ? "border-[#555] bg-[var(--tott-dash-control-bg)] text-foreground"
                  : "border-[var(--tott-card-border)] bg-transparent text-gray-400 hover:text-foreground"
              }`}
            >
              {f.label} (
              {f.value === "all"
                ? applications.length
                : f.value === "pending"
                  ? counts.pending
                  : f.value === "approved"
                    ? counts.approved
                    : counts.rejected}
              )
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map((app) => (
          <div key={app.id} className="rounded-xl border border-[var(--tott-card-border)] p-4">
            <div className="flex items-start gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold text-foreground"
                style={{ backgroundColor: theme.accentGoldFocus }}
              >
                {app.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex min-w-0 flex-1 flex-col leading-tight">
                <p className="font-semibold text-foreground">{app.name}</p>
                <p className="text-sm text-gray-500">{app.email}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <span className={statusBadgeStyle(app.status)}>
                  {te(`status.${app.status}`)}
                </span>
                {app.status === "pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => {}}
                      className="flex items-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)]"
                    >
                      <span className="[&>svg]:h-4 [&>svg]:w-4">
                        <EyeIcon />
                      </span>
                      {te("review")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApprove(app.id)}
                      className="flex items-center gap-2 rounded-lg border border-emerald-600/50 bg-emerald-600/80 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-emerald-600"
                    >
                      <span className="[&>svg]:h-4 [&>svg]:w-4">
                        <SquareCheckIcon />
                      </span>
                      {te("approve")}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReject(app.id)}
                      className="flex items-center gap-2 rounded-lg border border-red-600/50 bg-red-600/80 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-red-600"
                    >
                      <span className="[&>svg]:h-4 [&>svg]:w-4">
                        <XIcon />
                      </span>
                      {te("reject")}
                    </button>
                  </>
                )}
                <EditorAppActionsDropdown app={app} />
              </div>
            </div>
            {/* Details in separate row so they don't wrap */}
            <p className="mt-1 flex items-center gap-1.5 pl-16 text-sm text-gray-400">
              <span className="flex h-4 w-4 shrink-0 items-center justify-center [&>svg]:h-4 [&>svg]:w-4">
                <ClockIcon />
              </span>
              {te("appliedLine", {
                date: app.appliedAt,
                years: app.yearsInPublishing,
                articles: app.publishedArticles,
              })}
            </p>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-12 text-center text-gray-500">{te("empty")}</p>
      )}
    </div>
  );
}

function PermissionsMatrix() {
  const tm = useTranslations("Dashboard.rolesPermissions.matrix");
  const [matrix, setMatrix] = useState<MatrixState>(getInitialMatrix);

  const setCell = (permission: string, role: string, value: boolean) => {
    setMatrix((prev) => ({
      ...prev,
      [permission]: { ...prev[permission], [role]: value },
    }));
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-foreground">{tm("title")}</h3>
        <p className="mt-1 text-sm text-gray-500">{tm("subtitle")}</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-[var(--tott-card-border)]">
        <table className="w-full min-w-[600px] border-collapse text-start">
          <thead>
            <tr className="border-b border-[var(--tott-card-border)]">
              <th
                className="px-4 py-3 text-start text-sm font-semibold"
                style={{ color: theme.accentGoldFocus }}
              >
                {tm("colPermission")}
              </th>
              {MATRIX_ROLES.map((role) => (
                <th
                  key={role}
                  className="px-4 py-3 text-center text-sm font-semibold"
                  style={{ color: theme.accentGoldFocus }}
                >
                  {(tm as (key: string) => string)(`columns.${matrixRoleColumnKey(role)}`)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#444]/60">
            {PERMISSIONS.map((permission) => (
              <tr key={permission} className="transition-colors hover:bg-white/2">
                <td className="px-4 py-3 text-sm text-foreground">
                  {(tm as (key: string) => string)(`permissionNames.${permissionRowKey(permission)}`)}
                </td>
                {MATRIX_ROLES.map((role) => (
                  <td key={role} className="px-4 py-3 text-center">
                    <div className="flex justify-center">
                      <PermissionToggle
                        checked={matrix[permission]?.[role] ?? false}
                        onChange={(v) => setCell(permission, role, v)}
                        checkedColor={role === "Admin" ? "#332217" : undefined}
                      />
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function RolesPermissionsContent() {
  const tr = useTranslations("Dashboard.rolesPermissions");
  const [activeTab, setActiveTab] = useState<RolesTabId>("overview");
  const [configureRoleOpen, setConfigureRoleOpen] = useState(false);

  return (
    <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
      {/* Tabs - left-aligned */}
      <div className="flex w-fit gap-1 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] p-1">
        {TAB_IDS.map((tabId) => (
          <button
            key={tabId}
            type="button"
            onClick={() => setActiveTab(tabId)}
            className={`rounded-md px-6 py-3 text-sm font-medium transition-all ${
              activeTab === tabId
                ? "border border-[#4A4A4A] bg-[var(--tott-dash-control-bg)] text-foreground shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                : "border border-transparent bg-transparent text-[#AAAAAA] hover:text-[#E0E0E0]"
            }`}
          >
            {(tr as (key: string) => string)(`tabs.${tabId}`)}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="rounded-xl border border-[var(--tott-card-border)] p-6">
          <div className="space-y-8">
            {/* Role stat cards - octagonal SVG border only, no bg */}
            <div className="flex flex-nowrap gap-6 overflow-x-auto">
              {roleStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.id}
                    className="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-3 px-4 py-6"
                  >
                    <svg
                      className="pointer-events-none absolute inset-0 h-full w-full"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M14.6 0 L85.4 0 L100 14.6 L100 85.4 L85.4 100 L14.6 100 L0 85.4 L0 14.6 Z"
                        fill="none"
                        stroke="#222"
                        strokeWidth="1.5"
                      />
                    </svg>
                    <span style={{ color: "#E8DDC0" }}>
                      <Icon />
                    </span>
                    <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                    <span className="text-center text-sm text-gray-500">
                      {(tr as (key: string) => string)(`stats.${stat.id}`)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Role Hierarchy */}
            <div className="rounded-xl border border-[var(--tott-card-border)] p-6">
              <h3 className="text-lg font-bold text-foreground">{tr("hierarchy.title")}</h3>
              <p className="mt-1 text-sm text-gray-500">{tr("hierarchy.subtitle")}</p>
              <div className="mt-6 flex flex-nowrap items-center justify-center gap-0 overflow-x-auto">
                {roleHierarchy.map((role, index) => {
                  const Icon = role.icon;
                  const isSuperAdmin = role.id === "admin";
                  const inner = (
                    <>
                      <RoleHierarchyHex>
                        <Icon />
                      </RoleHierarchyHex>
                      <span className="text-sm font-medium text-foreground">
                        {(tr as (key: string) => string)(`hierarchy.labels.${role.id}`)}
                      </span>
                    </>
                  );
                  return (
                    <div key={role.id} className="flex items-center">
                      {isSuperAdmin ? (
                        <button
                          type="button"
                          onClick={() => setConfigureRoleOpen(true)}
                          className="flex flex-col items-center gap-2 rounded-xl p-1 transition-colors hover:bg-white/6 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8DDC0]/40"
                          aria-label={tr("hierarchy.configureSuperAdminAria")}
                        >
                          {inner}
                        </button>
                      ) : (
                        <div className="flex flex-col items-center gap-2">{inner}</div>
                      )}
                      {index < roleHierarchy.length - 1 && (
                        <div
                          className="mx-2 h-1 w-12 shrink-0 overflow-hidden rounded-full bg-[#222] sm:mx-4 sm:w-12"
                          aria-hidden
                        >
                          <div
                            className="h-full w-full rounded-full"
                            style={{
                              background:
                                "linear-gradient(to right, rgba(203,161,88,0.35), #CBA158)",
                            }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "permissions" && (
        <div className="rounded-xl border border-[var(--tott-card-border)] p-16 py-10">
          <PermissionsMatrix />
        </div>
      )}

      {activeTab === "editor-apps" && (
        <div className="rounded-xl border border-[var(--tott-card-border)] p-6">
          <EditorApplications />
        </div>
      )}

      <ConfigureRoleModal
        open={configureRoleOpen}
        onClose={() => setConfigureRoleOpen(false)}
        roleDisplayName={tr("superAdminRoleName")}
      />
    </div>
  );
}
