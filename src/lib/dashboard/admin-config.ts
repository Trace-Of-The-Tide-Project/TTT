import {
  LayoutDashboardIcon,
  FileTextIcon,
  PenLineIcon,
  HeartHandshakeIcon,
  UsersIcon,
  ShieldIcon,
  FolderIcon,
  CodeIcon,
  MessageSquareIcon,
  DollarSignIcon,
  BarChartIcon,
  AlertTriangleIcon,
  LockIcon,
  SettingsIcon,
  PersonIcon,
  EyeIcon,
  BellIcon,
  UserCheckIcon,
} from "@/components/ui/icons";
import type { DashboardConfig } from "./types";

export const adminConfig: DashboardConfig = {
  basePath: "/admin",
  sections: [
    {
      items: [
        {
          kind: "item",
          labelKey: "sidebar.mainDashboard",
          href: "/admin",
          icon: LayoutDashboardIcon,
        },
        {
          kind: "group",
          groupId: "articles",
          labelKey: "sidebar.articles",
          icon: FileTextIcon,
          defaultOpen: true,
          items: [
            {
              kind: "item",
              labelKey: "sidebar.allArticles",
              href: "/admin/articles",
              icon: FileTextIcon,
            },
            {
              kind: "item",
              labelKey: "sidebar.createArticles",
              href: "/admin/articles/create",
              icon: PenLineIcon,
            },
          ],
        },
        {
          kind: "group",
          groupId: "contributions",
          labelKey: "sidebar.contributions",
          icon: HeartHandshakeIcon,
          defaultOpen: true,
          items: [
            {
              kind: "item",
              labelKey: "sidebar.supporters",
              href: "/admin/supporters",
              icon: UsersIcon,
            },
            {
              kind: "item",
              labelKey: "sidebar.contributionsAnalytics",
              href: "/admin/contributions-analytics",
              icon: BarChartIcon,
            },
          ],
        },
        {
          kind: "group",
          groupId: "management",
          labelKey: "sidebar.management",
          icon: UsersIcon,
          defaultOpen: true,
          items: [
            {
              kind: "item",
              labelKey: "sidebar.users",
              href: "/admin/users",
              icon: UsersIcon,
              badge: "12.4k",
            },
            {
              kind: "item",
              labelKey: "sidebar.rolesPermissions",
              href: "/admin/roles",
              icon: ShieldIcon,
            },
          ],
        },
        {
          kind: "group",
          groupId: "content",
          labelKey: "sidebar.content",
          icon: FolderIcon,
          defaultOpen: true,
          items: [
            {
              kind: "item",
              labelKey: "sidebar.contentLibrary",
              href: "/admin/content",
              icon: FolderIcon,
            },
            {
              kind: "item",
              labelKey: "sidebar.visualEditor",
              href: "/admin/editor",
              icon: CodeIcon,
            },
          ],
        },
        {
          kind: "group",
          groupId: "community",
          labelKey: "sidebar.community",
          icon: HeartHandshakeIcon,
          defaultOpen: true,
          items: [
            {
              kind: "item",
              labelKey: "sidebar.engagements",
              href: "/admin/engagements",
              icon: HeartHandshakeIcon,
            },
            {
              kind: "item",
              labelKey: "sidebar.messaging",
              href: "/admin/messaging",
              icon: MessageSquareIcon,
            },
          ],
        },
        {
          kind: "group",
          groupId: "business",
          labelKey: "sidebar.business",
          icon: DollarSignIcon,
          defaultOpen: true,
          items: [
            {
              kind: "item",
              labelKey: "sidebar.financePayout",
              href: "/admin/finance",
              icon: DollarSignIcon,
            },
            {
              kind: "item",
              labelKey: "sidebar.businessAnalytics",
              href: "/admin/analytics",
              icon: BarChartIcon,
            },
          ],
        },
        {
          kind: "group",
          groupId: "system",
          labelKey: "sidebar.systemSettings",
          icon: SettingsIcon,
          defaultOpen: true,
          items: [
            {
              kind: "item",
              labelKey: "sidebar.reportsModeration",
              href: "/admin/reports",
              icon: AlertTriangleIcon,
              badge: 8,
            },
            {
              kind: "item",
              labelKey: "sidebar.securityAuth",
              href: "/admin/security",
              icon: LockIcon,
            },
            {
              kind: "item",
              labelKey: "sidebar.systemSettingsPage",
              href: "/admin/settings",
              icon: SettingsIcon,
            },
          ],
        },
        {
          kind: "group",
          groupId: "adminSettings",
          labelKey: "sidebar.adminSettings",
          icon: SettingsIcon,
          defaultOpen: true,
          items: [
            {
              kind: "item",
              labelKey: "sidebar.profile",
              href: "/admin/profile",
              icon: PersonIcon,
            },
            {
              kind: "item",
              labelKey: "sidebar.availability",
              href: "/admin/availability",
              icon: EyeIcon,
            },
            {
              kind: "item",
              labelKey: "sidebar.notifications",
              href: "/admin/notifications",
              icon: BellIcon,
            },
            {
              kind: "item",
              labelKey: "sidebar.privacy",
              href: "/admin/privacy",
              icon: ShieldIcon,
            },
            {
              kind: "item",
              labelKey: "sidebar.password",
              href: "/admin/password",
              icon: LockIcon,
            },
            {
              kind: "item",
              labelKey: "sidebar.account",
              href: "/admin/account",
              icon: UserCheckIcon,
            },
          ],
        },
      ],
    },
  ],
};
