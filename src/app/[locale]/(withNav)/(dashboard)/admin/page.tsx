"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { DashboardNotifications } from "@/components/dashboard/admin/mainDashboard/DashboardNotifications";
import { QuickActions } from "@/components/dashboard/admin/mainDashboard/QuickActions";
import { EditorApplications } from "@/components/dashboard/admin/mainDashboard/EditorApplications";
import type { EditorApplication } from "@/components/dashboard/admin/mainDashboard/EditorApplications";
import { ContentOverview } from "@/components/dashboard/admin/mainDashboard/ContentOverview";
import { UsersByRole } from "@/components/dashboard/admin/mainDashboard/UsersByRole";
import { FinanceSnapshot } from "@/components/dashboard/admin/mainDashboard/FinanceSnapshot";
import { RecentActivity } from "@/components/dashboard/admin/mainDashboard/RecentActivity";
import { quickActions, pendingEditorApplicationsModal } from "@/lib/dashboard/admin-dashboard-constants";
import { BroadcastModal } from "@/components/dashboard/modals/BroadcastModal";
import { DetailModal } from "@/components/dashboard/modals/DetailModal";
import { FeatureContentModal } from "@/components/dashboard/modals/FeatureContentModal";
import { MaintenanceModal } from "@/components/dashboard/modals/MaintenanceModal";
import {
  FileTextIcon,
  FilmIcon,
  MusicIcon,
  CameraIcon,
  BookIcon,
  MicIcon,
  UsersIcon,
  HeartHandshakeIcon,
  PenLineIcon,
  BarChartIcon,
  ShieldIcon,
  DollarSignIcon,
  TrendingUpIcon,
  CreditCardIcon,
  PersonIcon,
  AlertTriangleIcon,
  EyeIcon,
} from "@/components/ui/icons";
import type { ComponentType } from "react";
import {
  getDashboardEditorApplications,
  getDashboardContentOverview,
  getDashboardUsersByRole,
  getDashboardFinanceSnapshot,
  getDashboardRecentActivity,
  approveEditorApplication,
  rejectEditorApplication,
} from "@/services/dashboard.service";
import type {
  ContentCategory,
  RoleRow,
  FinanceSnapshot as FinanceSnapshotData,
  ActivityEntry,
} from "@/services/dashboard.service";

// ── Icon mapping helpers ────────────────────────────────────────

function getCategoryIcon(label: string): ComponentType {
  const l = label.toLowerCase();
  if (l.includes("article")) return FileTextIcon;
  if (l.includes("film") || l.includes("video")) return FilmIcon;
  if (l.includes("music") || l.includes("audio")) return MusicIcon;
  if (l.includes("photo") || l.includes("image") || l.includes("camera")) return CameraIcon;
  if (l.includes("essay")) return BookIcon;
  if (l.includes("podcast")) return MicIcon;
  return FileTextIcon;
}

function getRoleIcon(label: string): ComponentType {
  const l = label.toLowerCase();
  if (l === "user" || l === "users") return UsersIcon;
  if (l === "contributor" || l === "contributors") return HeartHandshakeIcon;
  if (l === "author" || l === "authors") return PenLineIcon;
  if (l === "editor" || l === "editors") return BarChartIcon;
  if (l === "admin" || l === "admins") return ShieldIcon;
  return UsersIcon;
}

function getActivityIcon(type: string): ComponentType {
  switch (type) {
    case "new_user": return PersonIcon;
    case "content_published": case "content_updated": return FileTextIcon;
    case "moderation": return AlertTriangleIcon;
    default: return EyeIcon;
  }
}

function formatActivityTitle(a: ActivityEntry): string {
  switch (a.type) {
    case "new_user": return `New user: ${a.user?.name ?? "Unknown"}`;
    case "content_published": return `Published by ${a.user?.name ?? "Unknown"}`;
    case "content_updated": return `Updated by ${a.user?.name ?? "Unknown"}`;
    case "moderation": return `Moderation: ${a.action}`;
    default: return `${a.action || "Activity"} on ${a.entityType || "item"}`;
  }
}

function formatActivityDescription(a: ActivityEntry): string {
  const d = a.details ?? {};
  if (typeof d.contributionTitle === "string") return d.contributionTitle;
  if (typeof d.reason === "string") return d.reason;
  return a.entityType ?? "";
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ── Finance card shape ──────────────────────────────────────────

function buildFinanceCards(data: FinanceSnapshotData) {
  const fmt = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 0 })}`;
  return [
    {
      id: "1",
      icon: DollarSignIcon,
      amount: fmt(data.todayDonations.value),
      trend: undefined as { value: string; direction: "up" | "down" } | undefined,
    },
    {
      id: "2",
      icon: TrendingUpIcon,
      amount: fmt(data.monthlyRevenue.value),
      trend: data.monthlyRevenue.change !== 0
        ? { value: `${Math.abs(data.monthlyRevenue.change)}%`, direction: data.monthlyRevenue.change >= 0 ? "up" as const : "down" as const }
        : undefined,
    },
    {
      id: "3",
      icon: CreditCardIcon,
      amount: fmt(data.pendingPayouts.value),
      trend: undefined as { value: string; direction: "up" | "down" } | undefined,
    },
    {
      id: "4",
      icon: CreditCardIcon,
      amount: fmt(data.platformFees.value),
      trend: undefined as { value: string; direction: "up" | "down" } | undefined,
    },
  ];
}

// ── Page ────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const tModals = useTranslations("Dashboard.adminHome.modals");
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [editorApplicationsOpen, setEditorApplicationsOpen] = useState(false);
  const [featureContentOpen, setFeatureContentOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);

  // Real data state
  const [editorApps, setEditorApps] = useState<EditorApplication[]>([]);
  const [contentRows, setContentRows] = useState<ContentCategory[]>([]);
  const [userRoles, setUserRoles] = useState<{ roles: RoleRow[]; totalUsers: number } | null>(null);
  const [financeData, setFinanceData] = useState<FinanceSnapshotData | null>(null);
  const [activityItems, setActivityItems] = useState<ActivityEntry[]>([]);

  const loadEditorApps = useCallback(async () => {
    const rows = await getDashboardEditorApplications(5);
    setEditorApps(rows);
  }, []);

  useEffect(() => {
    Promise.allSettled([
      getDashboardEditorApplications(5).then(setEditorApps),
      getDashboardContentOverview().then((d) => setContentRows(d.categories)),
      getDashboardUsersByRole().then(setUserRoles),
      getDashboardFinanceSnapshot().then(setFinanceData),
      getDashboardRecentActivity(8).then(setActivityItems),
    ]);
  }, []);

  const handleApprove = async (id: string) => {
    await approveEditorApplication(id);
    await loadEditorApps();
  };

  const handleReject = async (id: string) => {
    await rejectEditorApplication(id);
    await loadEditorApps();
  };

  // Map data to component props
  const mappedContentRows = contentRows.map((c) => ({
    id: c.id,
    icon: getCategoryIcon(c.label),
    label: c.label,
    published: c.published,
    drafts: c.drafts,
    flagged: c.flagged,
  }));

  const mappedRoles = (userRoles?.roles ?? []).map((r) => ({
    id: r.id,
    icon: getRoleIcon(r.label),
    label: r.label,
    count: r.count.toLocaleString(),
    percentage: r.percentage,
    change: r.change !== 0 ? `${r.change > 0 ? "+" : ""}${r.change}%` : undefined,
  }));

  const mappedActivity = activityItems.map((a) => ({
    id: a.id,
    icon: getActivityIcon(a.type),
    title: formatActivityTitle(a),
    description: formatActivityDescription(a),
    time: relativeTime(a.timestamp),
  }));

  const financeCards = financeData ? buildFinanceCards(financeData) : [];

  const quickActionsWithModals = quickActions.map((item) => {
    if (item.id === "1") return { ...item, href: undefined, onClick: () => setBroadcastOpen(true) };
    if (item.id === "2") return { ...item, href: undefined, onClick: () => setEditorApplicationsOpen(true) };
    if (item.id === "3") return { ...item, href: undefined, onClick: () => setFeatureContentOpen(true) };
    if (item.id === "4") return { ...item, href: undefined, onClick: () => setMaintenanceOpen(true) };
    return item;
  });

  return (
    <div className="space-y-6 p-3 sm:p-5 sm:space-y-8">
      <DashboardNotifications />

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <QuickActions items={quickActionsWithModals} />
        <EditorApplications
          items={editorApps}
          viewAllHref="/admin/users"
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>

      <ContentOverview
        rows={mappedContentRows}
        totalValue={contentRows.reduce((s, c) => s + c.published + c.drafts + c.flagged, 0).toLocaleString()}
        manageHref="/admin/content"
      />

      <UsersByRole
        roles={mappedRoles}
        totalValue={userRoles?.totalUsers.toLocaleString()}
        viewAllHref="/admin/users"
      />

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <FinanceSnapshot cards={financeCards} detailsHref="/admin/analytics" />
        <RecentActivity items={mappedActivity} />
      </div>

      <BroadcastModal open={broadcastOpen} onClose={() => setBroadcastOpen(false)} />
      <DetailModal
        open={editorApplicationsOpen}
        onClose={() => setEditorApplicationsOpen(false)}
        title={tModals("pendingEditors.title")}
        description={tModals("pendingEditors.description")}
        items={pendingEditorApplicationsModal.items}
        viewAllHref={pendingEditorApplicationsModal.viewAllHref}
        viewAllLabel={tModals("viewAll")}
      />
      <FeatureContentModal open={featureContentOpen} onClose={() => setFeatureContentOpen(false)} />
      <MaintenanceModal open={maintenanceOpen} onClose={() => setMaintenanceOpen(false)} />
    </div>
  );
}
