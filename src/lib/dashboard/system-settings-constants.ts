export const SYSTEM_SETTINGS_TAB_IDS = [
  "categories",
  "tags",
  "badges",
  "email",
  "localisation",
  "guidelines",
] as const;

export type SystemSettingsTabId = (typeof SYSTEM_SETTINGS_TAB_IDS)[number];

export type ContentCategoryRow = {
  id: string;
  name: string;
  slug: string;
  itemCount: number;
};

export const sampleContentCategories: ContentCategoryRow[] = [
  { id: "c1", name: "Documentary", slug: "/documentary", itemCount: 234 },
  { id: "c2", name: "Music", slug: "/music", itemCount: 189 },
  { id: "c3", name: "Photography", slug: "/photography", itemCount: 156 },
  { id: "c4", name: "Essay", slug: "/essay", itemCount: 98 },
  { id: "c5", name: "Experimental", slug: "/experimental", itemCount: 42 },
];

export type ContentTagRow = {
  id: string;
  label: string;
};

export const sampleContentTags: ContentTagRow[] = [
  { id: "tag1", label: "Featured" },
  { id: "tag2", label: "Editor's Pick" },
  { id: "tag3", label: "Trending" },
  { id: "tag4", label: "New" },
];

export const BADGE_ICON_IDS = ["gift", "star", "handshake", "check", "sun", "contribute"] as const;

export type BadgeIconId = (typeof BADGE_ICON_IDS)[number];

export type AchievementBadgeRow = {
  id: string;
  iconId: BadgeIconId;
  name: string;
  milestone: string;
};

export const sampleAchievementBadges: AchievementBadgeRow[] = [
  {
    id: "b1",
    iconId: "gift",
    name: "Top Contributor",
    milestone: "100+ contributions",
  },
  {
    id: "b2",
    iconId: "star",
    name: "Rising Star",
    milestone: "First 10 published works",
  },
  {
    id: "b3",
    iconId: "handshake",
    name: "Community Pillar",
    milestone: "50+ helpful comments",
  },
  {
    id: "b4",
    iconId: "check",
    name: "Verified Voice",
    milestone: "Editor-approved profile",
  },
];
