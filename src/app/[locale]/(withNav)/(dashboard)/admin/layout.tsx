"use client";

import { Fragment, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { DashboardLayout } from "@/components/dashboard/shared/DashboardLayout";
import { AdminTopbar } from "@/components/dashboard/admin/AdminTopbar";
import { AdminCommandCenter } from "@/components/dashboard/admin/AdminCommandCenter";
import { ArticlesPageHeader } from "@/components/dashboard/admin/articles/articles-main";
import { UsersPageHeader } from "@/components/dashboard/admin/users/UsersPageHeader";
import { RolesPageHeader } from "@/components/dashboard/admin/roles/RolesPageHeader";
import { ContentLibraryPageHeader } from "@/components/dashboard/admin/content/ContentLibraryPageHeader";
import { VisualEditorPageHeader } from "@/components/dashboard/admin/editor/VisualEditorPageHeader";
import { EngagementsPageHeader } from "@/components/dashboard/admin/engagements/EngagementsPageHeader";
import { MessagingPageHeader } from "@/components/dashboard/admin/messaging/MessagingPageHeader";
import { FinancePageHeader } from "@/components/dashboard/admin/finance/FinancePageHeader";
import { AnalyticsPageHeader } from "@/components/dashboard/admin/analytics/AnalyticsPageHeader";
import { ReportsPageHeader } from "@/components/dashboard/admin/reports/ReportsPageHeader";
import { SecurityPageToolbar } from "@/components/dashboard/admin/security/SecurityPageToolbar";
import { AdminSettingsPageHeader } from "@/components/dashboard/admin/settings/AdminSettingsPageHeader";
import { adminConfig } from "@/lib/dashboard/admin-config";
import { shouldShowAdminSettingsHeader } from "@/lib/dashboard/admin-settings-header-paths";
import { normalizeAppPathname } from "@/lib/i18n/strip-locale-from-path";

function getCommandCenter(pathname: string | null) {
  const path = normalizeAppPathname(pathname);
  if (!path) return null;
  if (path === "/admin") return <AdminCommandCenter />;
  if (shouldShowAdminSettingsHeader(pathname)) {
    if (path.startsWith("/admin/security")) {
      return (
        <Fragment>
          <AdminSettingsPageHeader />
          <SecurityPageToolbar />
        </Fragment>
      );
    }
    return <AdminSettingsPageHeader />;
  }
  if (path.startsWith("/admin/users")) return <UsersPageHeader />;
  if (path.startsWith("/admin/roles")) return <RolesPageHeader />;
  if (path.startsWith("/admin/content")) return <ContentLibraryPageHeader />;
  if (path.startsWith("/admin/editor")) return <VisualEditorPageHeader />;
  if (path.startsWith("/admin/engagements")) return <EngagementsPageHeader />;
  if (path.startsWith("/admin/messaging")) return <MessagingPageHeader />;
  if (path.startsWith("/admin/finance")) return <FinancePageHeader />;
  if (path.startsWith("/admin/analytics")) return <AnalyticsPageHeader />;
  if (path.startsWith("/admin/reports")) return <ReportsPageHeader />;
  if (
    path.startsWith("/admin/articles") ||
    path.startsWith("/admin/trips") ||
    path.startsWith("/admin/supporters") ||
    path.startsWith("/admin/contributions-analytics")
  )
    return <ArticlesPageHeader />;
  return null;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const routePath = normalizeAppPathname(pathname);
  const tLayout = useTranslations("Dashboard.layout");
  const commandCenter = getCommandCenter(pathname);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="min-h-screen w-full bg-background"
        aria-busy="true"
        aria-label={tLayout("loadingAdmin")}
      />
    );
  }

  const mobileBarTitle = shouldShowAdminSettingsHeader(routePath)
    ? tLayout("adminSettings")
    : tLayout("dashboard");

  return (
    <DashboardLayout
      config={adminConfig}
      header={<AdminTopbar />}
      commandCenter={commandCenter}
      mobileBarTitle={mobileBarTitle}
    >
      {children}
    </DashboardLayout>
  );
}
