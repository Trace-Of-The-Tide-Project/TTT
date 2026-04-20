import { getTranslations } from "next-intl/server";
import { DashboardHeader } from "@/components/dashboard/shared/DashboardHeader";
import { StatCard } from "@/components/dashboard/shared/StatCard";
import { RecentList } from "@/components/dashboard/shared/RecentList";
import { GridIcon, HeartHandshakeIcon, BarChartIcon, CalendarIcon } from "@/components/ui/icons";
import { theme } from "@/lib/theme";

const statsConfig = [
  { key: "published", icon: <GridIcon /> },
  { key: "contributions", icon: <HeartHandshakeIcon /> },
  { key: "totalReads", icon: <BarChartIcon /> },
  { key: "daysActive", icon: <CalendarIcon /> },
] as const;

const statValues = ["8", "420", "1,200", "765"] as const;

const recentArticles = [
  {
    id: "1",
    title: "British Restrict Jewish Immigration to Palestine",
    subtitle: "Published article · January 22, 2025",
    href: "#",
  },
  {
    id: "2",
    title: "British Restrict Jewish Immigration to Palestine",
    subtitle: "Published article · January 20, 2025",
    href: "#",
  },
  {
    id: "3",
    title: "British Restrict Jewish Immigration to Palestine",
    subtitle: "Published article · January 22, 2025",
    href: "#",
  },
];

const recentContributors = [
  { id: "1", avatar: { initials: "AS" }, title: "Ahmed Sameer", subtitle: "3 mins ago", trailing: "$5" },
  { id: "2", avatar: { initials: "SF" }, title: "Salma Fathi", subtitle: "6 mins ago", trailing: "$100" },
  { id: "3", avatar: { initials: "MK" }, title: "Mustafa Khaled", subtitle: "10 mins ago", trailing: "$25" },
];

export default async function ProfileDashboardPage() {
  const tDash = await getTranslations("Dashboard");
  const tProfile = await getTranslations("Dashboard.profileHome");

  return (
    <div>
      <DashboardHeader
        title={tProfile("title")}
        profile={{
          initials: "FB",
          name: "Fadi Barghouti",
          meta: [
            "Joined June 2025",
            "Gaza, Palestine State of",
            "fadi.b@example.com",
            "about.me/fadi-b",
          ],
        }}
        actions={
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-gray-500 hover:text-white"
            >
              {tProfile("editProfile")}
            </button>
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
              value={statValues[i]}
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
            items={recentContributors}
          />
        </div>
      </div>
    </div>
  );
}
