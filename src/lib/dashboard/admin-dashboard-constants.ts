import {
  AlertTriangleIcon,
  ShieldIcon,
  PersonIcon,
  SendIcon,
  PersonPlusIcon,
  StarIcon,
  SettingsIcon,
} from "@/components/ui/icons";

export const topPerformingArticles = [
  { id: "1", title: "British Restrict Jewish Immigration to Palestine", contributors: 32, views: "2,321", trend: { value: "+12%", direction: "up" as const } },
  { id: "2", title: "British Restrict Jewish Immigration to Palestine", contributors: 28, views: "1,956", trend: { value: "-8%", direction: "down" as const } },
  { id: "3", title: "British Restrict Jewish Immigration to Palestine", contributors: 24, views: "1,802", trend: { value: "+12%", direction: "up" as const } },
  { id: "4", title: "British Restrict Jewish Immigration to Palestine", contributors: 21, views: "1,654", trend: { value: "-8%", direction: "down" as const } },
  { id: "5", title: "British Restrict Jewish Immigration to Palestine", contributors: 18, views: "1,423", trend: { value: "+12%", direction: "up" as const } },
];

export const unusualLogins = [
  { id: "l1", editor: "Sarah Marzouq", location: "Cairo, Egypt", time: "30 min ago" },
  { id: "l2", editor: "Ahmed Hassan", location: "Amman, Jordan", time: "1h ago" },
  { id: "l3", editor: "Layla Khalil", location: "Beirut, Lebanon", time: "2h ago" },
];

export const alerts = [
  {
    id: "1",
    icon: AlertTriangleIcon,
    title: "8 content items flagged",
    description: "Requires immediate review for policy violations",
    actionLabel: "Review now",
    actionHref: "/admin/reports",
    modal: {
      badge: { label: "Critical", color: "#ef4444" },
      items: [
        { id: "f1", title: "Controversial Opinion Piece", subtitle: "By User1234 · Hate speech · 1h ago", actionLabel: "Review" },
        { id: "f2", title: "Controversial Opinion Piece", subtitle: "By User1234 · Hate speech · 1h ago", actionLabel: "Review" },
        { id: "f3", title: "Controversial Opinion Piece", subtitle: "By User1234 · Hate speech · 1h ago", actionLabel: "Review" },
      ],
      viewAllHref: "/admin/reports",
    },
  },
  {
    id: "2",
    icon: ShieldIcon,
    title: "Unusual login activity",
    description: "3 editor accounts accessed from new locations",
    actionLabel: "View details",
    actionHref: "/admin/security",
    modal: {
      badge: { label: "Warning", color: "#ef4444" },
      items: unusualLogins.map((l) => ({
        id: l.id,
        title: `Editor: ${l.editor}`,
        subtitle: `New location: ${l.location} · ${l.time}`,
        actionLabel: "Flag",
        actionColor: "#CBA158",
      })),
      viewAllHref: "/admin/security",
    },
  },
  {
    id: "3",
    icon: PersonIcon,
    title: "5 pending editor applications",
    description: "Awaiting review for more than 24 hours",
    actionLabel: "Process",
    actionHref: "/admin/users",
    modal: {
      badge: { label: "Pending", color: "#CBA158" },
      items: [
        { id: "a1", title: "Mariam Ali", subtitle: "5 years journalism · Applied 26h ago", processButtons: true },
        { id: "a2", title: "Fatima Zahra", subtitle: "Photographer · 5 years experience · Applied 1d ago", processButtons: true },
        { id: "a3", title: "Omar Farouq", subtitle: "Writer · 2 years experience · Applied 1d ago", processButtons: true },
      ],
      viewAllHref: "/admin/users",
    },
  },
];

export type QuickActionId = "sendBroadcast" | "approveEditor" | "featureContent" | "maintenanceMode";

export const quickActions = [
  { id: "1", actionId: "sendBroadcast" as const, icon: SendIcon, href: "/admin/messaging" },
  { id: "2", actionId: "approveEditor" as const, icon: PersonPlusIcon, href: "/admin/users" },
  { id: "3", actionId: "featureContent" as const, icon: StarIcon, href: "/admin/content" },
  { id: "4", actionId: "maintenanceMode" as const, icon: SettingsIcon, href: "/admin/settings" },
];

