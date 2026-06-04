/** API user status (lowercase) → badge color */
export const USER_STATUS_COLORS: Record<string, string> = {
  active: "#2ECC71",
  suspended: "#E74C3C",
  inactive: "#9CA3AF",
  pending: "#E67E22",
};

/** Role slugs the UI knows how to translate / assign. Mirrors the backend `roles` table seed. */
export const KNOWN_ROLE_SLUGS = [
  "user",
  "contributor",
  "author",
  "editor",
  "admin",
  "moderator",
  "manager",
  "artist",
] as const;

/** Statuses an admin can set from the Edit User form (excludes `deleted`). */
export const EDITABLE_USER_STATUSES = [
  "active",
  "pending",
  "suspended",
  "inactive",
] as const;
