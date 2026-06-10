"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useUsers } from "@/hooks/queries/users";
import type { AdminUserListItem } from "@/services/users.service";
import { nameInitials } from "./initials";

export function UserPicker({
  value,
  onChange,
  disabled,
}: {
  value: AdminUserListItem | null;
  onChange: (user: AdminUserListItem | null) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("Dashboard.writersManagement.form.account");
  const [searchInput, setSearchInput] = useState("");
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(searchInput.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const params = useMemo(
    () => ({ search: debounced || undefined, limit: 8, page: 1 }),
    [debounced],
  );
  const usersQuery = useUsers(params, { silent: true });
  // Results are only rendered while no user is selected.
  const results = value ? [] : (usersQuery.data?.users ?? []);

  if (value) {
    const name = value.full_name?.trim() || value.username?.trim() || value.email;
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--tott-elevated)] text-xs font-semibold text-[var(--tott-gold)]">
            {nameInitials(name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{name}</p>
            <p className="truncate text-xs text-[var(--tott-muted)]">{value.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          disabled={disabled}
          className="shrink-0 text-xs text-[var(--tott-gold)] hover:underline disabled:opacity-40"
        >
          {t("clear")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.preventDefault();
        }}
        placeholder={t("searchPlaceholder")}
        disabled={disabled}
        className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder-gray-500 outline-none focus:border-[var(--tott-gold)]/60 transition-colors"
      />
      <div className="max-h-56 overflow-y-auto rounded-lg border border-[var(--tott-card-border)]">
        {usersQuery.isPending && (
          <p className="px-3 py-3 text-xs text-gray-500">{t("searching")}</p>
        )}
        {!usersQuery.isPending && results.length === 0 && (
          <p className="px-3 py-3 text-xs text-gray-500">{t("noResults")}</p>
        )}
        {results.map((u) => {
          const name = u.full_name?.trim() || u.username?.trim() || u.email;
          return (
            <button
              key={u.id}
              type="button"
              onClick={() => onChange(u)}
              disabled={disabled}
              className="flex w-full items-center gap-3 border-b border-[var(--tott-card-border)] px-3 py-2 text-start last:border-b-0 hover:bg-[var(--tott-elevated)] disabled:opacity-40"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--tott-elevated)] text-xs font-semibold text-[var(--tott-gold)]">
                {nameInitials(name)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm text-foreground">{name}</span>
                <span className="block truncate text-xs text-[var(--tott-muted)]">{u.email}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
