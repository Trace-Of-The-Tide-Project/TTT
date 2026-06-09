"use client";

import { useTranslations } from "next-intl";
import { DashboardHeader } from "@/components/dashboard/shared/DashboardHeader";
import { StatCard } from "@/components/dashboard/shared/StatCard";
import { RecentList, type RecentListItem } from "@/components/dashboard/shared/RecentList";
import { GridIcon, HeartHandshakeIcon, BarChartIcon, CalendarIcon } from "@/components/ui/icons";
import { theme } from "@/lib/theme";
import { useProfile } from "@/hooks/queries/profile";
import { useAuthUser } from "@/components/providers/AuthProvider";
import { useAuthorDashboard } from "@/hooks/queries/author-dashboard";
import Link from "next/link";
import type { RecentArticle, RecentSupporter } from "@/services/author-dashboard.service";

const statsConfig = [
  { key: "published", icon: <GridIcon /> },
  { key: "contributions", icon: <HeartHandshakeIcon /> },
  { key: "totalReads", icon: <BarChartIcon /> },
  { key: "daysActive", icon: <CalendarIcon /> },
] as const;

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function formatArticleSubtitle(article: RecentArticle): string {
  const label = article.status === "published" ? "Published article" : "Draft article";
  const date = article.published_at ?? article.createdAt;
  if (!date) return label;
  try {
    return `${label} · ${new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(date))}`;
  } catch {
    return label;
  }
}

function articleToListItem(article: RecentArticle): RecentListItem {
  return {
    id: article.id,
    title: article.title || "Untitled",
    subtitle: formatArticleSubtitle(article),
    href: `/admin/articles/${article.id}`,
  };
}

function supporterToListItem(supporter: RecentSupporter): RecentListItem {
  const name = supporter.User?.full_name || supporter.User?.username || "Anonymous";
  const initials = getInitials(name);
  const amount = supporter.amount ? `$${supporter.amount}` : "";
  return {
    id: supporter.id,
    avatar: { initials },
    title: name,
    trailing: amount || undefined,
  };
}

function formatNumber(n: number): string {
  if (n >= 1000) return n.toLocaleString("en-US");
  return String(n);
}

export default function ProfileDashboardPage() {
  const tDash = useTranslations("Dashboard");
  const tProfile = useTranslations("Dashboard.profileHome");

  const sessionUser = useAuthUser();
  const { data: profile } = useProfile();
  const { data: dashboard, isLoading: dashLoading } = useAuthorDashboard();

  const displayName =
    profile?.full_name || sessionUser?.full_name || sessionUser?.username || "";
  const email = profile?.email || sessionUser?.email || "";
  const initials = displayName ? getInitials(displayName) : "?";

  const meta: string[] = [];
  if (email) meta.push(email);
  if (profile?.location) meta.push(profile.location);
  if (profile?.personal_link) meta.push(profile.personal_link);

  const stats = dashboard?.stats;
  const statValues = [
    formatNumber(stats?.articles_published ?? 0),
    formatNumber(stats?.contributions ?? 0),
    formatNumber(stats?.total_reads ?? 0),
    formatNumber(stats?.days_active ?? 0),
  ] as const;

  const recentArticles: RecentListItem[] = dashboard?.recent_articles.map(articleToListItem) ?? [];
  const recentSupporters: RecentListItem[] = dashboard?.recent_supporters.map(supporterToListItem) ?? [];

  return (
    <div>
      <DashboardHeader
        title={tProfile("title")}
        profile={{
          initials,
          name: displayName || tProfile("title"),
          meta: meta.length > 0 ? meta : undefined,
        }}
        actions={
          <div className="flex gap-2">
            <Link
              href="/profile/settings"
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-gray-500 hover:text-white"
            >
              {tProfile("editProfile")}
            </Link>
            <button
              type="button"
              className="rounded-lg px-4 py-2 text-sm font-medium text-[#1a1a1a] transition-opacity hover:opacity-90"
              style={{ backgroundColor: theme.accentGold }}
            >
              {tProfile("createArticle")}
            </button>
          </div>
        }
      />

      <div className="space-y-6 p-6 sm:p-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statsConfig.map((stat, i) => (
            <StatCard
              key={stat.key}
              icon={stat.icon}
              value={dashLoading ? "…" : statValues[i]}
              label={tDash(`articles.stats.${stat.key}`)}
            />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <RecentList
            heading={tProfile("recentArticles")}
            viewAllHref="/profile/articles"
            items={recentArticles}
          />
          <RecentList
            heading={tProfile("recentContributors")}
            viewAllHref="/profile/supporters"
            items={recentSupporters}
          />
        </div>
      </div>
    </div>
  );
}
