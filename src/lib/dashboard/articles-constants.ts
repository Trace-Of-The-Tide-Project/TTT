import type { ArticleRow } from "@/components/dashboard/admin/articles/articles-main/ArticlesTable";

export const articleStats = [
  { id: "1", value: "8", labelKey: "articles.stats.published", iconKey: "book" },
  { id: "2", value: "420", labelKey: "articles.stats.contributions", iconKey: "pen" },
  { id: "3", value: "1,200", labelKey: "articles.stats.totalReads", iconKey: "barChart" },
  { id: "4", value: "765", labelKey: "articles.stats.daysActive", iconKey: "calendar" },
] as const;

export const articleTabs = [
  { id: "all", labelKey: "all" as const },
  { id: "drafts", labelKey: "drafts" as const },
  { id: "published", labelKey: "published" as const },
  { id: "scheduled", labelKey: "scheduled" as const },
] as const;

/** Demo / storybook shape — matches live `ArticleRow` (ISO + normalized status). */
export const articlesTableData: ArticleRow[] = [
  {
    id: "1",
    slug: "british-restrict",
    title: "British Restrict Jewish..",
    content_type: "article",
    status: "published",
    statusColor: "emerald",
    updatedAtIso: "2025-01-22T10:00:00.000Z",
    views: "1,456",
    supporters: "4",
  },
  {
    id: "2",
    slug: "future-cinema",
    title: "The Future of Cinema",
    content_type: "article",
    status: "published",
    statusColor: "emerald",
    updatedAtIso: "2025-01-21T15:30:00.000Z",
    views: "2,890",
    supporters: "12",
  },
  {
    id: "3",
    slug: "antis-article",
    title: "Antis Article...",
    content_type: "article",
    status: "draft",
    statusColor: "orange",
    updatedAtIso: "2025-01-21T08:00:00.000Z",
    views: "—",
    supporters: "—",
  },
  {
    id: "4",
    slug: "climate-culture",
    title: "Climate and Culture",
    content_type: "article",
    status: "published",
    statusColor: "emerald",
    updatedAtIso: "2025-01-20T09:00:00.000Z",
    views: "945",
    supporters: "7",
  },
  {
    id: "5",
    slug: "scheduled-one",
    title: "Scheduled Article...",
    content_type: "article",
    status: "scheduled",
    statusColor: "blue",
    updatedAtIso: "2025-01-22T11:00:00.000Z",
    views: "—",
    supporters: "—",
  },
  {
    id: "6",
    slug: "wip",
    title: "Work in Progress...",
    content_type: "article",
    status: "draft",
    statusColor: "orange",
    updatedAtIso: "2025-01-22T06:00:00.000Z",
    views: "—",
    supporters: "—",
  },
  {
    id: "7",
    slug: "documenting-tide",
    title: "Documenting the Tide",
    content_type: "article",
    status: "published",
    statusColor: "emerald",
    updatedAtIso: "2025-01-18T12:00:00.000Z",
    views: "3,210",
    supporters: "23",
  },
  {
    id: "8",
    slug: "upcoming-feature",
    title: "Upcoming Feature...",
    content_type: "article",
    status: "scheduled",
    statusColor: "blue",
    updatedAtIso: "2025-01-25T08:00:00.000Z",
    views: "—",
    supporters: "—",
  },
];

export const draftsData = [
  { id: "d1", title: "Antis Article...", updatedAt: "2 hours ago", continueHref: "/admin/articles/create" },
  { id: "d2", title: "Draft Title Two...", updatedAt: "5 hours ago", continueHref: "/admin/articles/create" },
  { id: "d3", title: "Another Draft...", updatedAt: "1 day ago", continueHref: "/admin/articles/create" },
];

export const scheduledData = [
  { id: "s1", title: "Scheduled Article...", date: "January 22, 2024", views: "1.2k", viewHref: "#" },
  { id: "s2", title: "Upcoming Piece...", date: "January 25, 2024", views: "—", viewHref: "#" },
  { id: "s3", title: "Upcoming l.k...", date: "January 25, 2024", views: "—", viewHref: "#" },
];
