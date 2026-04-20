import {
  LayoutDashboardIcon,
  FileTextIcon,
  PenLineIcon,
  HeartHandshakeIcon,
  UsersIcon,
  BarChartIcon,
  SettingsIcon,
  PersonIcon,
  EyeIcon,
  BellIcon,
  ShieldIcon,
  LockIcon,
  UserCheckIcon,
} from "@/components/ui/icons";
import type { DashboardConfig } from "./types";

export const userConfig: DashboardConfig = {
  basePath: "/profile",
  sections: [
    {
      items: [
        {
          kind: "item",
          labelKey: "sidebar.mainDashboard",
          href: "/profile",
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
              href: "/profile/articles",
              icon: FileTextIcon,
            },
            {
              kind: "item",
              labelKey: "sidebar.createArticles",
              href: "/profile/articles/create",
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
              href: "/profile/supporters",
              icon: UsersIcon,
            },
            {
              kind: "item",
              labelKey: "sidebar.profileAnalytics",
              href: "/profile/analytics",
              icon: BarChartIcon,
            },
          ],
        },
      ],
    },
    {
      items: [
        {
          kind: "group",
          groupId: "settings",
          labelKey: "sidebar.settingsGroup",
          icon: SettingsIcon,
          defaultOpen: true,
          items: [
            {
              kind: "item",
              labelKey: "sidebar.profile",
              href: "/profile/settings",
              icon: PersonIcon,
            },
            {
              kind: "item",
              labelKey: "sidebar.availability",
              href: "/profile/settings/availability",
              icon: EyeIcon,
            },
            {
              kind: "item",
              labelKey: "sidebar.notifications",
              href: "/profile/settings/notifications",
              icon: BellIcon,
            },
            {
              kind: "item",
              labelKey: "sidebar.privacy",
              href: "/profile/settings/privacy",
              icon: ShieldIcon,
            },
            {
              kind: "item",
              labelKey: "sidebar.password",
              href: "/profile/settings/password",
              icon: LockIcon,
            },
            {
              kind: "item",
              labelKey: "sidebar.account",
              href: "/profile/settings/account",
              icon: UserCheckIcon,
            },
          ],
        },
      ],
    },
  ],
};
