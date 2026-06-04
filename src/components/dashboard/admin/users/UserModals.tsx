"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { TrashIcon } from "@/components/ui/icons";
import { FilterDropdown } from "./FilterDropdown";
import {
  EDITABLE_USER_STATUSES,
  KNOWN_ROLE_SLUGS,
  USER_STATUS_COLORS,
} from "@/lib/dashboard/users-management-constants";
import { formatApiError } from "@/lib/api/error-message";
import {
  useAssignUserRole,
  useRevokeUserRole,
  useUpdateUser,
  useUpdateUserStatus,
} from "@/hooks/mutations/users";
import type { AdminUserListItem, AdminUserStatus } from "@/services/users.service";

type Translate = ReturnType<typeof useTranslations>;

function statusColor(status: string): string {
  return USER_STATUS_COLORS[status.trim().toLowerCase()] ?? "#9CA3AF";
}

function roleLabel(slug: string, tRoles: Translate): string {
  const key = slug.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (KNOWN_ROLE_SLUGS.includes(key as (typeof KNOWN_ROLE_SLUGS)[number])) {
    return tRoles(key);
  }
  return slug;
}

function formatDate(iso: string | null | undefined, locale: string): string {
  if (!iso?.trim()) return "—";
  const d = new Date(iso.trim());
  if (Number.isNaN(d.getTime())) return "—";
  const loc = locale.startsWith("ar") ? "ar" : "en-US";
  return d.toLocaleDateString(loc, { month: "short", day: "numeric", year: "numeric" });
}

/* ───────────────────────── View Profile ───────────────────────── */

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-[var(--tott-card-border)] py-3 last:border-b-0">
      <dt className="text-[11px] font-medium uppercase tracking-wide text-[var(--tott-dash-gold-label)]">
        {label}
      </dt>
      <dd className="break-words text-sm text-foreground">{children}</dd>
    </div>
  );
}

export function ViewProfileModal({
  user,
  onClose,
}: {
  user: AdminUserListItem | null;
  onClose: () => void;
}) {
  const t = useTranslations("Dashboard.usersManagement.modals");
  const tStatus = useTranslations("Dashboard.usersManagement.statusLabels");
  const tRoles = useTranslations("Dashboard.adminHome.usersByRole.roles");
  const locale = useLocale();

  const statusKey = user?.status.trim().toLowerCase() ?? "";

  return (
    <Modal open={!!user} title={t("view.title")} onClose={onClose}>
      {user ? (
        <dl>
          <DetailRow label={t("fields.fullName")}>{user.full_name || "—"}</DetailRow>
          <DetailRow label={t("fields.username")}>{user.username || "—"}</DetailRow>
          <DetailRow label={t("fields.email")}>{user.email || "—"}</DetailRow>
          <DetailRow label={t("fields.status")}>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: statusColor(user.status) }}
              />
              <span style={{ color: statusColor(user.status) }}>
                {statusKey ? tStatus(statusKey) : "—"}
              </span>
            </span>
          </DetailRow>
          <DetailRow label={t("fields.roles")}>
            {user.roles.length ? (
              <span className="flex flex-wrap gap-1.5">
                {user.roles.map((r) => (
                  <span
                    key={r}
                    className="inline-flex rounded-full bg-[var(--tott-elevated)] px-2.5 py-1 text-xs font-medium"
                  >
                    {roleLabel(r, tRoles)}
                  </span>
                ))}
              </span>
            ) : (
              "—"
            )}
          </DetailRow>
          <DetailRow label={t("fields.joined")}>{formatDate(user.joined_at, locale)}</DetailRow>
          <DetailRow label={t("fields.lastActive")}>
            {formatDate(user.last_active_at, locale)}
          </DetailRow>
          <DetailRow label={t("fields.contributions")}>{user.contributions_count}</DetailRow>
        </dl>
      ) : null}
    </Modal>
  );
}

/* ───────────────────────── Edit User ───────────────────────── */

const FIELD_CLASS =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--tott-muted)] focus:border-[var(--tott-muted)] focus:outline-none";

export function EditUserModal({
  user,
  onClose,
}: {
  user: AdminUserListItem | null;
  onClose: () => void;
}) {
  const t = useTranslations("Dashboard.usersManagement.modals");
  const tStatus = useTranslations("Dashboard.usersManagement.statusLabels");
  const updateUser = useUpdateUser();
  const updateUserStatus = useUpdateUserStatus();
  const [error, setError] = useState<string | null>(null);

  // Local form state, re-seeded each time a different user opens the modal.
  const [seededId, setSeededId] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<AdminUserStatus>("active");

  if (user && user.id !== seededId) {
    setSeededId(user.id);
    setFullName(user.full_name ?? "");
    setUsername(user.username ?? "");
    setEmail(user.email ?? "");
    const s = user.status.trim().toLowerCase();
    setStatus(
      (EDITABLE_USER_STATUSES as readonly string[]).includes(s) ? (s as AdminUserStatus) : "active",
    );
    setError(null);
  }

  const statusOptions = useMemo(
    () => EDITABLE_USER_STATUSES.map((value) => ({ value, label: tStatus(value) })),
    [tStatus],
  );

  const busy = updateUser.isPending || updateUserStatus.isPending;

  const submit = async () => {
    if (!user) return;
    setError(null);
    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();
    if (!trimmedEmail) {
      setError(t("edit.errors.emailRequired"));
      return;
    }
    if (!trimmedUsername) {
      setError(t("edit.errors.usernameRequired"));
      return;
    }

    // Profile fields go to PATCH /users/:id. `status` is NOT part of that
    // endpoint's DTO (it would 400 "property status should not exist") — it has
    // its own endpoint PATCH /users/:id/status, so it is sent separately.
    const profilePayload: Record<string, string> = {};
    if (fullName.trim() !== (user.full_name ?? "")) profilePayload.full_name = fullName.trim();
    if (trimmedUsername !== user.username) profilePayload.username = trimmedUsername;
    if (trimmedEmail !== user.email) profilePayload.email = trimmedEmail;

    const statusChanged = status !== user.status.trim().toLowerCase();

    if (Object.keys(profilePayload).length === 0 && !statusChanged) {
      onClose();
      return;
    }

    try {
      if (Object.keys(profilePayload).length > 0) {
        await updateUser.mutateAsync({ id: user.id, payload: profilePayload });
      }
      if (statusChanged) {
        await updateUserStatus.mutateAsync({ id: user.id, status });
      }
      toast.success(t("edit.toasts.saved"));
      onClose();
    } catch (e) {
      setError(formatApiError(e, t("edit.errors.saveFailed")));
    }
  };

  return (
    <Modal
      open={!!user}
      title={t("edit.title")}
      busy={busy}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="rounded-lg border border-[var(--tott-card-border)] bg-transparent px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-[var(--tott-dash-control-bg)] disabled:opacity-50"
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit()}
            className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? t("edit.saving") : t("common.save")}
          </button>
        </>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--tott-dash-gold-label)]">
            {t("fields.fullName")}
          </span>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={FIELD_CLASS}
            disabled={busy}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--tott-dash-gold-label)]">
            {t("fields.username")}
          </span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={FIELD_CLASS}
            disabled={busy}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--tott-dash-gold-label)]">
            {t("fields.email")}
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={FIELD_CLASS}
            disabled={busy}
          />
        </label>
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--tott-dash-gold-label)]">
            {t("fields.status")}
          </span>
          <FilterDropdown
            options={statusOptions}
            value={status}
            onChange={(v) => setStatus(v as AdminUserStatus)}
          />
        </div>

        {error ? (
          <p className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}

/* ───────────────────────── Change Role ───────────────────────── */

export function ChangeRoleModal({
  user,
  onClose,
}: {
  user: AdminUserListItem | null;
  onClose: () => void;
}) {
  const t = useTranslations("Dashboard.usersManagement.modals");
  const tRoles = useTranslations("Dashboard.adminHome.usersByRole.roles");
  const assign = useAssignUserRole();
  const revoke = useRevokeUserRole();
  const [error, setError] = useState<string | null>(null);
  const [roleToAdd, setRoleToAdd] = useState<string>("");

  const currentRoles = useMemo(() => user?.roles ?? [], [user?.roles]);
  const currentSet = useMemo(
    () => new Set(currentRoles.map((r) => r.trim().toLowerCase())),
    [currentRoles],
  );

  const addableOptions = useMemo(
    () =>
      KNOWN_ROLE_SLUGS.filter((slug) => !currentSet.has(slug)).map((slug) => ({
        value: slug,
        label: tRoles(slug),
      })),
    [currentSet, tRoles],
  );

  const busy = assign.isPending || revoke.isPending;

  const doAssign = (role: string) => {
    if (!user || !role) return;
    setError(null);
    assign.mutate(
      { userId: user.id, role },
      {
        onSuccess: () => {
          toast.success(t("role.toasts.assigned", { role: tRoles(role) }));
          setRoleToAdd("");
        },
        onError: (e) => setError(formatApiError(e, t("role.errors.assignFailed"))),
      },
    );
  };

  const doRevoke = (role: string) => {
    if (!user) return;
    setError(null);
    revoke.mutate(
      { userId: user.id, role },
      {
        onSuccess: () =>
          toast.success(t("role.toasts.revoked", { role: roleLabel(role, tRoles) })),
        onError: (e) => setError(formatApiError(e, t("role.errors.revokeFailed"))),
      },
    );
  };

  return (
    <Modal
      open={!!user}
      title={t("role.title")}
      busy={busy}
      onClose={onClose}
      footer={
        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)] disabled:opacity-50"
        >
          {t("common.done")}
        </button>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--tott-dash-gold-label)]">
            {t("role.currentRoles")}
          </span>
          {currentRoles.length ? (
            <ul className="flex flex-col gap-2">
              {currentRoles.map((r) => (
                <li
                  key={r}
                  className="flex items-center justify-between gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-3 py-2"
                >
                  <span className="text-sm text-foreground">{roleLabel(r, tRoles)}</span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => doRevoke(r)}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                    aria-label={t("role.revokeAria", { role: roleLabel(r, tRoles) })}
                  >
                    <TrashIcon />
                    {t("role.revoke")}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--tott-muted)]">{t("role.noRoles")}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--tott-dash-gold-label)]">
            {t("role.addRole")}
          </span>
          {addableOptions.length ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <FilterDropdown
                options={[{ value: "", label: t("role.selectRole") }, ...addableOptions]}
                value={roleToAdd}
                onChange={setRoleToAdd}
              />
              <button
                type="button"
                disabled={busy || !roleToAdd}
                onClick={() => doAssign(roleToAdd)}
                className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("role.assign")}
              </button>
            </div>
          ) : (
            <p className="text-sm text-[var(--tott-muted)]">{t("role.allAssigned")}</p>
          )}
        </div>

        {error ? (
          <p className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
