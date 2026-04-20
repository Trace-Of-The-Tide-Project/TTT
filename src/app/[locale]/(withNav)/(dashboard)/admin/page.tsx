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
import {
  quickActions,
  editorApps,
  contentRows,
  userRoles,
  financeCards,
  recentActivity,
  pendingEditorApplicationsModal,
} from "@/lib/dashboard/admin-dashboard-constants";
import { BroadcastModal } from "@/components/dashboard/modals/BroadcastModal";
import { DetailModal } from "@/components/dashboard/modals/DetailModal";
import { FeatureContentModal } from "@/components/dashboard/modals/FeatureContentModal";
import { MaintenanceModal } from "@/components/dashboard/modals/MaintenanceModal";

export default function AdminDashboardPage() {
  const tModals = useTranslations("Dashboard.adminHome.modals");
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [editorApplicationsOpen, setEditorApplicationsOpen] = useState(false);
  const [featureContentOpen, setFeatureContentOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const quickActionsWithModals = quickActions.map((item) => {
    if (item.id === "1") return { ...item, href: undefined, onClick: () => setBroadcastOpen(true) };
    if (item.id === "2") return { ...item, href: undefined, onClick: () => setEditorApplicationsOpen(true) };
    if (item.id === "3") return { ...item, href: undefined, onClick: () => setFeatureContentOpen(true) };
    if (item.id === "4") return { ...item, href: undefined, onClick: () => setMaintenanceOpen(true) };
    return item;
  });

  return (
    <div className="space-y-8 p-4">
      {/* Notifications from GET /notifications (scoped to signed-in user) */}
      <DashboardNotifications />

      {/* Quick Actions + Editor Applications */}
      <div className="grid gap-6 lg:grid-cols-2">
        <QuickActions items={quickActionsWithModals} />
        <EditorApplications items={editorApps} viewAllHref="/admin/users" />
      </div>

      {/* Content Overview */}
      <ContentOverview rows={contentRows} totalValue="3,438" manageHref="/admin/content" />

      {/* Users by Role */}
      <UsersByRole roles={userRoles} totalValue="12,546" viewAllHref="/admin/users" />

      {/* Finance + Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <FinanceSnapshot cards={financeCards} detailsHref="/admin/analytics" />
        <RecentActivity items={recentActivity} />
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
