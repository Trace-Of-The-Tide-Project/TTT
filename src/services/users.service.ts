import { api } from "./api";

export type AdminUserStatus = "active" | "suspended" | "inactive" | "pending";

export type AdminUserListItem = {
  id: string;
  username: string;
  full_name: string;
  email: string;
  status: string;
  /** Primary role slug for display. Derived from the API `userRoles[].role.name` (falls back to legacy `role` / `user_role`). Defaults to `user`. */
  role: string;
  /** Every role slug assigned to the user (from `userRoles[].role.name`). Used by the Change Role UI. */
  roles: string[];
  /** ISO date string when available (`joined_at`, `created_at`, etc.). */
  joined_at: string | null;
  /** ISO date string for last activity (`last_active_at`, `last_login_at`, etc.). */
  last_active_at: string | null;
  contributions_count: number;
};

export type UsersListMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type GetUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: AdminUserStatus;
  sortBy?: string;
  order?: "ASC" | "DESC";
};

export type UsersListResult = {
  users: AdminUserListItem[];
  meta: UsersListMeta;
  status: number;
  results: number;
};

function firstParsableDateString(o: Record<string, unknown>, keys: readonly string[]): string | null {
  for (const k of keys) {
    const v = o[k];
    if (v == null) continue;
    if (typeof v === "string" && v.trim()) {
      const t = Date.parse(v.trim());
      if (Number.isFinite(t)) return v.trim();
    }
    if (typeof v === "number" && Number.isFinite(v)) {
      const d = new Date(v);
      if (!Number.isNaN(d.getTime())) return d.toISOString();
    }
  }
  return null;
}

function firstIntField(o: Record<string, unknown>, keys: readonly string[]): number {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "number" && Number.isFinite(v)) return Math.max(0, Math.trunc(v));
    if (typeof v === "string" && v.trim()) {
      const n = parseInt(v.trim(), 10);
      if (Number.isFinite(n)) return Math.max(0, n);
    }
  }
  return 0;
}

function roleNameFromObject(r: unknown): string {
  if (typeof r === "string" && r.trim()) return r.trim();
  if (r && typeof r === "object") {
    const ro = r as Record<string, unknown>;
    if (typeof ro.name === "string" && ro.name.trim()) return ro.name.trim();
    if (typeof ro.slug === "string" && ro.slug.trim()) return ro.slug.trim();
  }
  return "";
}

/**
 * Extracts every role slug assigned to a user. The admin API (`GET /users`)
 * returns roles via the Sequelize association `userRoles: [{ role: { name } }]`,
 * so that is the primary source. Legacy single-value shapes (`role`,
 * `user_role`) are still honoured as a fallback.
 */
function extractRolesFromPayload(o: Record<string, unknown>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const push = (name: string) => {
    const slug = name.trim();
    if (!slug) return;
    const key = slug.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    out.push(slug);
  };

  const userRoles = o.userRoles ?? o.user_roles;
  if (Array.isArray(userRoles)) {
    for (const ur of userRoles) {
      if (ur && typeof ur === "object") {
        push(roleNameFromObject((ur as Record<string, unknown>).role));
      } else {
        push(roleNameFromObject(ur));
      }
    }
  }

  // Legacy / alternate single-value fallbacks.
  push(roleNameFromObject(o.role));
  push(roleNameFromObject(o.user_role));

  return out;
}

// Higher number = higher privilege. The display column shows the user's
// highest-privilege role so an admin who also carries `user` isn't mislabelled.
const ROLE_PRIORITY: Record<string, number> = {
  admin: 60,
  manager: 50,
  moderator: 40,
  editor: 30,
  author: 20,
  artist: 15,
  contributor: 10,
  user: 1,
};

function primaryRole(roles: string[]): string {
  let best = "";
  let bestScore = -1;
  for (const r of roles) {
    const score = ROLE_PRIORITY[r.trim().toLowerCase()] ?? 5;
    if (score > bestScore) {
      bestScore = score;
      best = r.trim();
    }
  }
  return best;
}

function normalizeUserRow(raw: unknown): AdminUserListItem | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.id !== "string" || typeof o.email !== "string") return null;
  const roles = extractRolesFromPayload(o);
  return {
    id: o.id,
    username: String(o.username ?? ""),
    full_name: String(o.full_name ?? ""),
    email: o.email,
    status: String(o.status ?? "inactive"),
    role: primaryRole(roles) || "user",
    roles,
    joined_at: firstParsableDateString(o, [
      "joined_at",
      "created_at",
      "registered_at",
      "date_joined",
      "createdAt",
      "joinedAt",
    ]),
    last_active_at: firstParsableDateString(o, [
      "last_active_at",
      "last_seen_at",
      "last_login_at",
      "lastActiveAt",
      "lastLoginAt",
      "updated_at",
      "updatedAt",
    ]),
    contributions_count: firstIntField(o, [
      "contributions_count",
      "contributions",
      "contribution_count",
      "articles_count",
      "published_articles_count",
      "published_count",
    ]),
  };
}

function parseMeta(raw: unknown): UsersListMeta | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Record<string, unknown>;
  const total = typeof m.total === "number" ? m.total : Number(m.total);
  const page = typeof m.page === "number" ? m.page : Number(m.page);
  const limit = typeof m.limit === "number" ? m.limit : Number(m.limit);
  const totalPages = typeof m.totalPages === "number" ? m.totalPages : Number(m.totalPages);
  if (!Number.isFinite(total) || !Number.isFinite(page) || !Number.isFinite(limit)) return null;
  const tp = Number.isFinite(totalPages) ? totalPages : Math.max(1, Math.ceil(total / Math.max(1, limit)));
  return { total, page, limit, totalPages: tp };
}

/**
 * GET /users — admin only; passwords excluded.
 */
export function normalizeUsersListPayload(raw: unknown): UsersListResult {
  if (!raw || typeof raw !== "object") {
    return {
      users: [],
      meta: { total: 0, page: 1, limit: 10, totalPages: 1 },
      status: 200,
      results: 0,
    };
  }
  const o = raw as Record<string, unknown>;
  const data = Array.isArray(o.data) ? o.data : [];
  const users = data.map(normalizeUserRow).filter((u): u is AdminUserListItem => u !== null);
  const results = typeof o.results === "number" && Number.isFinite(o.results) ? o.results : users.length;
  const status = typeof o.status === "number" && Number.isFinite(o.status) ? o.status : 200;
  let meta = parseMeta(o.meta);
  if (!meta) {
    const limit = 10;
    meta = {
      total: users.length,
      page: 1,
      limit,
      totalPages: Math.max(1, Math.ceil(users.length / limit)),
    };
  }
  return { users, meta, status, results };
}

export async function getUsers(params?: GetUsersParams): Promise<UsersListResult> {
  const query: Record<string, string | number> = {};
  if (params?.page != null) query.page = params.page;
  if (params?.limit != null) query.limit = Math.min(100, Math.max(1, params.limit));
  if (params?.search?.trim()) query.search = params.search.trim();
  if (params?.status) query.status = params.status;
  if (params?.sortBy?.trim()) query.sortBy = params.sortBy.trim();
  if (params?.order) query.order = params.order;

  const { data } = await api.get<unknown>("/users", { params: query });
  return normalizeUsersListPayload(data);
}

export type UpdateUserPayload = Partial<{
  status: AdminUserStatus;
  full_name: string;
  username: string;
  email: string;
}>;

export async function updateUser(id: string, payload: UpdateUserPayload): Promise<void> {
  await api.patch(`/users/${id}`, payload);
}

export async function updateUserStatus(id: string, status: AdminUserStatus): Promise<void> {
  await api.patch(`/users/${id}/status`, { status });
}

/** Assigns a role to a user. Backend: PATCH /roles/assign/:userId  body: { role } */
export async function assignUserRole(userId: string, role: string): Promise<void> {
  await api.patch(`/roles/assign/${userId}`, { role });
}

/** Revokes a role from a user. Backend: PATCH /roles/revoke/:userId  body: { role } */
export async function revokeUserRole(userId: string, role: string): Promise<void> {
  await api.patch(`/roles/revoke/${userId}`, { role });
}

export type CreateAdminUserPayload = {
  full_name: string;
  email: string;
  password: string;
};

export type CreatedAdminUser = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  username?: string | null;
};

/** Creates a user account. Backend: POST /users (admin only).
 * Username is auto-generated from the email prefix server-side. */
export async function createAdminUser(
  payload: CreateAdminUserPayload,
): Promise<CreatedAdminUser> {
  const { data } = await api.post<unknown>("/users", payload);
  const inner =
    data && typeof data === "object" && "data" in (data as object)
      ? (data as { data?: unknown }).data
      : data;
  if (
    inner &&
    typeof inner === "object" &&
    typeof (inner as { id?: unknown }).id === "string"
  ) {
    return inner as CreatedAdminUser;
  }
  throw new Error("Invalid response from create user");
}

const EXPORT_PAGE_LIMIT = 100;
const EXPORT_MAX_PAGES = 500;

type AllUsersParams = Pick<GetUsersParams, "search" | "status" | "sortBy" | "order">;

/**
 * Fetches every user page from GET /users (limit 100) until done. Safe cap on page count.
 */
export async function getAllUsersForExport(params?: AllUsersParams): Promise<AdminUserListItem[]> {
  const sortBy = params?.sortBy?.trim() || "username";
  const order = params?.order ?? "ASC";
  const all: AdminUserListItem[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const res = await getUsers({
      page,
      limit: EXPORT_PAGE_LIMIT,
      search: params?.search?.trim() || undefined,
      status: params?.status,
      sortBy,
      order,
    });
    all.push(...res.users);
    totalPages = Math.max(1, res.meta.totalPages);
    page += 1;
    if (page > EXPORT_MAX_PAGES) break;
  } while (page <= totalPages);

  return all;
}
