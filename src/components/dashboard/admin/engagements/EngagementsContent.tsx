"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { theme } from "@/lib/theme";
import { CreateBadgeModal } from "@/components/dashboard/modals/CreateBadgeModal";
import { AwardBadgeModal } from "@/components/dashboard/modals/AwardBadgeModal";
import {
  EyeIcon,
  GiftIcon,
  LockIcon,
  PlusIcon,
  SearchIcon,
  MoreDotsIcon,
  HeartIcon,
  MessageSquareIcon,
  StarIcon,
  SunIcon,
  UserCheckIcon,
  UsersIcon,
} from "@/components/ui/icons";
import {
  sampleBadges,
  sampleComments,
  sampleTrendingDiscussions,
  type Badge,
  type Comment,
  type TrendingDiscussion,
} from "@/lib/dashboard/engagements-constants";

const ENGAGEMENT_TAB_IDS = ["comments", "trending", "badges"] as const;

function CommentCard({ comment }: { comment: Comment }) {
  const t = useTranslations("Dashboard.engagementsPage.comments");
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex gap-4 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-4">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-foreground"
        style={{ backgroundColor: theme.accentGoldFocus }}
      >
        {comment.author.charAt(0)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground">
          <span className="font-medium">{comment.author}</span>
          <span className="text-gray-400"> {t("on")} </span>
          <span className="text-gray-400">
            {comment.contentTitle}
            {comment.flagged && (
              <span className="ms-2 inline-flex rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium uppercase text-red-400">
                {t("flaggedBadge")}
              </span>
            )}
          </span>
        </p>
        <p className="mt-1 text-sm text-gray-400 line-clamp-2">{comment.content}</p>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span
              className="[&_svg]:h-4 [&_svg]:w-4"
              style={{ color: "#E8DDC0" }}
            >
              <HeartIcon />
            </span>
            {comment.likes}
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="[&_svg]:h-4 [&_svg]:w-4"
              style={{ color: "#E8DDC0" }}
            >
              <MessageSquareIcon />
            </span>
            {t("replies", { count: comment.replies })}
          </span>
          <span>{comment.timeAgo}</span>
        </div>
      </div>
      <div ref={ref} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setIsOpen((o) => !o)}
          className="rounded p-1.5 transition-colors hover:bg-[var(--tott-dash-ghost-hover)]"
          style={{ color: "#A3A3A3" }}
          aria-label={t("menuAria")}
        >
          <MoreDotsIcon />
        </button>
        {isOpen && (
          <div className="absolute end-0 top-full z-20 mt-1 min-w-[140px] rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] py-1 shadow-lg">
            <button
              type="button"
              className="w-full px-4 py-2 text-start text-sm text-foreground hover:bg-[var(--tott-dash-surface-inset)]"
            >
              {t("view")}
            </button>
            <button
              type="button"
              className="w-full px-4 py-2 text-start text-sm text-foreground hover:bg-[var(--tott-dash-surface-inset)]"
            >
              {t("edit")}
            </button>
            <button
              type="button"
              className="w-full px-4 py-2 text-start text-sm text-red-400 hover:bg-red-500/10"
            >
              {t("delete")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function TrendingDiscussionCard({
  discussion,
  onToggleLocked,
  onView,
}: {
  discussion: TrendingDiscussion;
  onToggleLocked: () => void;
  onView: () => void;
}) {
  const t = useTranslations("Dashboard.engagementsPage.trending");
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-4 py-4">
      <div className="flex min-w-0 gap-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-foreground"
          style={{ backgroundColor: theme.accentGoldFocus }}
          aria-hidden="true"
        >
          {discussion.title.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{discussion.title}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <span
                className="[&_svg]:h-4 [&_svg]:w-4"
                style={{ color: "#E8DDC0" }}
              >
                <MessageSquareIcon />
              </span>
              {t("commentsCount", { count: discussion.comments })}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="[&_svg]:h-4 [&_svg]:w-4"
                style={{ color: "#E8DDC0" }}
              >
                <UsersIcon />
              </span>
              {t("participantsCount", { count: discussion.participants })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onView}
          className="inline-flex h-[40px] w-[120px] items-center justify-center gap-2 rounded-md border border-[#555] bg-[var(--tott-dash-control-bg)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)] whitespace-nowrap"
        >
          <EyeIcon />
          {t("view")}
        </button>
        <button
          type="button"
          onClick={onToggleLocked}
          className="inline-flex h-[40px] w-[120px] items-center justify-center gap-2 rounded-md border border-[#555] bg-[var(--tott-dash-control-bg)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)] whitespace-nowrap"
          aria-label={discussion.locked ? t("unlockDiscussionAria") : t("lockDiscussionAria")}
        >
          <LockIcon />
          {discussion.locked ? t("unlock") : t("lock")}
        </button>
      </div>
    </div>
  );
}

function BadgeCard({
  badge,
  onAward,
}: {
  badge: Badge;
  onAward: () => void;
}) {
  const t = useTranslations("Dashboard.engagementsPage.badges");
  const icon =
    badge.icon === "award" ? (
      <GiftIcon />
    ) : badge.icon === "star" ? (
      <StarIcon />
    ) : badge.icon === "heart" ? (
      <HeartIcon />
    ) : badge.icon === "check" ? (
      <UserCheckIcon />
    ) : (
      <SunIcon />
    );

  return (
    <div className="rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-5">
      <div className="flex items-start gap-4">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)]"
          style={{ color: "#E8DDC0" }}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-foreground">{badge.name}</p>
          <p className="mt-1 text-sm text-gray-500">{t("recipients", { count: badge.recipients })}</p>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-sm text-gray-500">{badge.description}</p>

      <button
        type="button"
        onClick={onAward}
        className="mt-5 w-full rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-bg)]"
      >
        {t("awardBadge")}
      </button>
    </div>
  );
}

export function EngagementsContent() {
  const t = useTranslations("Dashboard.engagementsPage");
  const [activeTab, setActiveTab] = useState<(typeof ENGAGEMENT_TAB_IDS)[number]>("comments");
  const [filter, setFilter] = useState<"all" | "flagged">("all");
  const [commentSearch, setCommentSearch] = useState("");
  const [badgeSearch, setBadgeSearch] = useState("");
  const [createBadgeOpen, setCreateBadgeOpen] = useState(false);
  const [awardBadgeOpen, setAwardBadgeOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [trendingDiscussions, setTrendingDiscussions] =
    useState<TrendingDiscussion[]>(sampleTrendingDiscussions);
  const [badges, setBadges] = useState<Badge[]>(sampleBadges);

  const filtered = sampleComments.filter((c) => {
    const matchesFilter = filter === "all" || c.flagged;
    const matchesSearch =
      !commentSearch.trim() ||
      c.author.toLowerCase().includes(commentSearch.toLowerCase()) ||
      c.content.toLowerCase().includes(commentSearch.toLowerCase()) ||
      c.contentTitle.toLowerCase().includes(commentSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredBadges = badges.filter((b) => {
    const q = badgeSearch.trim().toLowerCase();
    if (!q) return true;
    return b.name.toLowerCase().includes(q) || b.description.toLowerCase().includes(q);
  });

  const flaggedCount = sampleComments.filter((c) => c.flagged).length;

  return (
    <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
      <CreateBadgeModal
        open={createBadgeOpen}
        onClose={() => setCreateBadgeOpen(false)}
        onCreate={(created) => {
          setBadges((prev) => [
            {
              id: `b_${Date.now()}`,
              recipients: 0,
              ...created,
            },
            ...prev,
          ]);
        }}
      />
      <AwardBadgeModal
        open={awardBadgeOpen}
        badge={selectedBadge}
        onClose={() => setAwardBadgeOpen(false)}
        onAward={() => {
          // Placeholder: wire to API; optionally increment recipients.
        }}
      />
      {/* Tabs */}
      <div className="flex w-fit gap-1 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] p-1">
        {ENGAGEMENT_TAB_IDS.map((tabId) => (
          <button
            key={tabId}
            type="button"
            onClick={() => setActiveTab(tabId)}
            className={`rounded-md px-6 py-3 text-sm font-medium transition-all ${
              activeTab === tabId
                ? "border border-[#4A4A4A] bg-[var(--tott-dash-control-bg)] text-foreground shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                : "border border-transparent bg-transparent text-[#AAAAAA] hover:text-[#E0E0E0]"
            }`}
          >
            {t(`tabs.${tabId}`)}
          </button>
        ))}
      </div>

      {activeTab === "comments" && (
        <>
          {/* Search and filters */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div className="relative flex-1 max-w-md">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder={t("comments.searchPlaceholder")}
                value={commentSearch}
                onChange={(e) => setCommentSearch(e.target.value)}
                className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-gray-500 focus:border-[#555] focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  filter === "all"
                    ? "border-[#555] bg-[var(--tott-dash-control-bg)] text-foreground"
                    : "border-[var(--tott-card-border)] bg-transparent text-gray-400 hover:text-foreground"
                }`}
              >
                {t("filter.all")}
              </button>
              <button
                type="button"
                onClick={() => setFilter("flagged")}
                className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  filter === "flagged"
                    ? "border-[#555] bg-[var(--tott-dash-control-bg)] text-foreground"
                    : "border-[var(--tott-card-border)] bg-transparent text-gray-400 hover:text-foreground"
                }`}
              >
                {t("filter.flagged", { count: flaggedCount })}
              </button>
            </div>
          </div>

          {/* Comment list */}
          <div className="space-y-4">
            {filtered.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="py-12 text-center text-gray-500">{t("comments.emptyFiltered")}</p>
          )}
        </>
      )}

      {activeTab === "trending" && (
        <>
          <div className="space-y-4">
            {trendingDiscussions.map((discussion) => (
              <TrendingDiscussionCard
                key={discussion.id}
                discussion={discussion}
                onView={() => {
                  // Placeholder: wire this to a detail modal / route when available.
                }}
                onToggleLocked={() => {
                  setTrendingDiscussions((prev) =>
                    prev.map((d) => (d.id === discussion.id ? { ...d, locked: !d.locked } : d))
                  );
                }}
              />
            ))}
          </div>

          {trendingDiscussions.length === 0 && (
            <p className="py-12 text-center text-gray-500">{t("trending.empty")}</p>
          )}
        </>
      )}

      {activeTab === "badges" && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <SearchIcon />
              </span>
              <input
                type="text"
                placeholder={t("badges.searchPlaceholder")}
                value={badgeSearch}
                onChange={(e) => setBadgeSearch(e.target.value)}
                className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-gray-500 focus:border-[#555] focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setCreateBadgeOpen(true);
              }}
              className="inline-flex h-[42px] items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-[#111] whitespace-nowrap"
              style={{ backgroundColor: theme.accentGoldFocus }}
            >
              <PlusIcon />
              {t("badges.createBadge")}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {filteredBadges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                onAward={() => {
                  setSelectedBadge(badge);
                  setAwardBadgeOpen(true);
                }}
              />
            ))}
          </div>

          {filteredBadges.length === 0 && (
            <p className="py-12 text-center text-gray-500">{t("badges.emptySearch")}</p>
          )}
        </>
      )}
    </div>
  );
}
