"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { DashboardNotifications } from "@/components/dashboard/admin/mainDashboard/DashboardNotifications";
import { QuickActions } from "@/components/dashboard/admin/mainDashboard/QuickActions";
import { EditorApplications } from "@/components/dashboard/admin/mainDashboard/EditorApplications";
import { ContentOverview } from "@/components/dashboard/admin/mainDashboard/ContentOverview";
import { UsersByRole } from "@/components/dashboard/admin/mainDashboard/UsersByRole";
import { FinanceSnapshot } from "@/components/dashboard/admin/mainDashboard/FinanceSnapshot";
import { RecentActivity } from "@/components/dashboard/admin/mainDashboard/RecentActivity";
import { quickActions } from "@/lib/dashboard/admin-dashboard-constants";
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
import type {
  FinanceSnapshot as FinanceSnapshotData,
  ActivityEntry,
} from "@/services/dashboard.service";
import {
  useDashboardContentOverview,
  useDashboardEditorApplications,
  useDashboardFinanceSnapshot,
  useDashboardRecentActivity,
  useDashboardUsersByRole,
} from "@/hooks/queries/dashboard";
import {
  useApproveEditorApplication,
  useRejectEditorApplication,
} from "@/hooks/mutations/dashboard";
import { SkeletonStats } from "@/components/ui/SkeletonStats";
import { SkeletonTable } from "@/components/ui/SkeletonTable";

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

type ActivityT = (key: string, values?: Record<string, string | number>) => string;

function formatActivityTitle(a: ActivityEntry, t: ActivityT): string {
  const name = a.user?.name ?? t("unknown");
  switch (a.type) {
    case "new_user": return t("newUser", { name });
    case "content_published": return t("publishedBy", { name });
    case "content_updated": return t("updatedBy", { name });
    case "moderation": return t("moderation", { action: a.action });
    default: return t("activityOn", { action: a.action || "", entity: a.entityType || "" });
  }
}

function formatActivityDescription(a: ActivityEntry, t: ActivityT): string {
  const d = a.details ?? {};
  if (typeof d.contributionTitle === "string") return d.contributionTitle;
  if (typeof d.reason === "string") return d.reason;
  const entity = (a.entityType ?? "").toLowerCase();
  if (entity === "contribution") return t("contribution");
  if (entity === "article") return t("article");
  return a.entityType ?? "";
}

function relativeTime(dateStr: string, t: ActivityT): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return t("minutesAgo", { count: mins });
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t("hoursAgo", { count: hours });
  return t("daysAgo", { count: Math.floor(hours / 24) });
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
  const tActivity = useTranslations("Dashboard.adminHome.recentActivity");
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [editorApplicationsOpen, setEditorApplicationsOpen] = useState(false);
  const [featureContentOpen, setFeatureContentOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);

  const { data: editorApps = [] } = useDashboardEditorApplications(5);
  const { data: contentOverview } = useDashboardContentOverview();
  const { data: userRoles } = useDashboardUsersByRole();
  const { data: financeData } = useDashboardFinanceSnapshot();
  const { data: activityItems = [] } = useDashboardRecentActivity(8);

  const approveMutation = useApproveEditorApplication();
  const rejectMutation = useRejectEditorApplication();

  const contentRows = contentOverview?.categories ?? [];

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
    title: formatActivityTitle(a, tActivity),
    description: formatActivityDescription(a, tActivity),
    time: relativeTime(a.timestamp, tActivity),
  }));

  const financeCards = financeData ? buildFinanceCards(financeData) : [];

  const isLoadingDashboard = !contentOverview && !userRoles && !financeData && activityItems.length === 0;

  if (isLoadingDashboard) {
    return (
      <div className="space-y-6 p-3 sm:p-5 sm:space-y-8">
        <SkeletonStats />
        <SkeletonTable />
      </div>
    );
  }

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
          onApprove={(id) => approveMutation.mutate(id)}
          onReject={(id) => rejectMutation.mutate(id)}
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
        items={editorApps.map((a) => ({
          id: a.id,
          title: a.name,
          subtitle: [a.experience, a.timeAgo].filter(Boolean).join(" · "),
          processButtons: true,
        }))}
        viewAllHref="/admin/users"
        viewAllLabel={tModals("viewAll")}
      />
      <FeatureContentModal open={featureContentOpen} onClose={() => setFeatureContentOpen(false)} />
      <MaintenanceModal open={maintenanceOpen} onClose={() => setMaintenanceOpen(false)} />
    </div>
  );
}
