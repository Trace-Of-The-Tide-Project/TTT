"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { DashboardLayout } from "@/components/dashboard/shared/DashboardLayout";
import { DashboardHeader } from "@/components/dashboard/shared/DashboardHeader";
import { FeedArticleCard } from "@/components/feed/FeedArticleCard";
import { useFollowingFeed } from "@/hooks/queries/follows";
import { userConfig } from "@/lib/dashboard/user-config";

export default function FollowingFeedPage() {
  const t = useTranslations("Feed");
  const { data, isLoading, isError } = useFollowingFeed();
  const articles = data?.data ?? [];

  return (
    <DashboardLayout config={userConfig}>
      <DashboardHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="mt-2 space-y-6">
        {isLoading ? (
          <p className="text-sm" style={{ color: "var(--tott-home-text-muted)" }}>
            {t("loading")}
          </p>
        ) : isError ? (
          <p className="text-sm" style={{ color: "var(--tott-home-text-muted)" }}>
            {t("error")}
          </p>
        ) : articles.length === 0 ? (
          <div
            className="flex flex-col items-start gap-3 p-8"
            style={{
              border: "1px solid var(--tott-card-border)",
              borderRadius: 12,
            }}
          >
            <h2
              className="text-lg font-medium"
              style={{ color: "var(--tott-home-text-strong)" }}
            >
              {t("emptyTitle")}
            </h2>
            <p className="text-sm" style={{ color: "var(--tott-home-text-muted)" }}>
              {t("emptyBody")}
            </p>
            <Link
              href="/writers"
              className="mt-1 inline-flex items-center justify-center transition-opacity hover:opacity-90"
              style={{
                padding: "8px 20px",
                borderRadius: 8,
                fontWeight: 500,
                fontSize: 14,
                backgroundColor: "var(--tott-magazine-btn-bg)",
                color: "var(--tott-auth-btn-text)",
              }}
            >
              {t("emptyCta")}
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <FeedArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
