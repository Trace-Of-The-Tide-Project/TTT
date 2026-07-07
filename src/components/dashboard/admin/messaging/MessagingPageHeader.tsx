"use client";

import { useTranslations } from "next-intl";
import { DashboardHeader } from "@/components/dashboard/shared/DashboardHeader";
import { theme } from "@/lib/theme";
import {
  ContributeIcon,
  ClockIcon,
  MessageSquareIcon,
  SquareCheckIcon,
  TrendingUpIcon,
} from "@/components/ui/icons";
import { useMessagingSummary } from "@/hooks/queries/messaging";
import { ChamferedFrame } from "@/components/ui/ChamferedFrame";

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number | null; label: string }) {
  return (
    <div className="relative flex flex-col items-center gap-2 px-4 py-7">
      <ChamferedFrame />
      <span style={{ color: "var(--tott-stat-icon)" }}>{icon}</span>
      <span className="text-2xl font-bold text-foreground">
        {value === null ? "—" : value.toLocaleString()}
      </span>
      <span className="text-xs text-[var(--tott-muted)]">{label}</span>
    </div>
  );
}

export function MessagingPageHeader() {
  const t = useTranslations("Dashboard.headers.messaging");
  const { data: summary } = useMessagingSummary();

  return (
    <div className="px-6 py-6 sm:px-8 sm:py-8">
      <DashboardHeader
        lastUpdated
        title={t("title")}
        subtitle={t("subtitle")}
        compactPadding
        actions={
          <button
            type="button"
            className="inline-flex h-[40px] items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-[var(--tott-on-accent)] whitespace-nowrap"
            style={{ backgroundColor: theme.accentGoldFocus }}
          >
            <span className="[&_svg]:h-4 [&_svg]:w-4">
              <ContributeIcon />
            </span>
            {t("newBroadcast")}
          </button>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<MessageSquareIcon />} value={summary?.unread_messages ?? null} label={t("cards.unreadMessages")} />
        <StatCard icon={<TrendingUpIcon />}    value={summary?.high_priority ?? null}    label={t("cards.highPriority")} />
        <StatCard icon={<ClockIcon />}         value={summary?.pending_response ?? null} label={t("cards.pendingResponse")} />
        <StatCard icon={<SquareCheckIcon />}   value={summary?.resolved_this_week ?? null} label={t("cards.resolvedThisWeek")} />
      </div>
    </div>
  );
}
