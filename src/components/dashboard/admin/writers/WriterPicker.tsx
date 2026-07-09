"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useWriters } from "@/hooks/queries/writers";
import type { WriterProfile } from "@/services/writers.service";
import { nameInitials } from "./initials";

/** Display name for a writer: pen name, then legacy display name, then the
 * linked user's full name. Accepts any object carrying these optional fields. */
export function writerDisplayName(w: {
  pen_name?: string | null;
  display_name?: string | null;
  user?: { full_name?: string | null; username?: string | null } | null;
}): string {
  return (
    w.pen_name?.trim() ||
    w.display_name?.trim() ||
    w.user?.full_name?.trim() ||
    w.user?.username?.trim() ||
    "—"
  );
}

/** Debounced autocomplete over writer profiles. Clone of UserPicker. */
export function WriterPicker({
  value,
  onChange,
  disabled,
}: {
  value: WriterProfile | null;
  onChange: (writer: WriterProfile | null) => void;
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
  const writersQuery = useWriters(params);
  const results = value ? [] : (writersQuery.data ?? []);

  if (value) {
    const name = writerDisplayName(value);
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--tott-elevated)] text-xs font-semibold text-[var(--tott-gold)]">
            {nameInitials(name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{name}</p>
            {value.headline ? (
              <p className="truncate text-xs text-[var(--tott-muted)]">
                {value.headline}
              </p>
            ) : null}
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
        className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--tott-muted)] outline-none focus:border-[var(--tott-gold)]/60 transition-colors"
      />
      <div className="max-h-56 overflow-y-auto rounded-lg border border-[var(--tott-card-border)]">
        {writersQuery.isPending && (
          <p className="px-3 py-3 text-xs text-[var(--tott-muted)]">
            {t("searching")}
          </p>
        )}
        {!writersQuery.isPending && results.length === 0 && (
          <p className="px-3 py-3 text-xs text-[var(--tott-muted)]">
            {t("noResults")}
          </p>
        )}
        {results.map((w) => {
          const name = writerDisplayName(w);
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => onChange(w)}
              disabled={disabled}
              className="flex w-full items-center gap-3 border-b border-[var(--tott-card-border)] px-3 py-2 text-start last:border-b-0 hover:bg-[var(--tott-elevated)] disabled:opacity-40"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--tott-elevated)] text-xs font-semibold text-[var(--tott-gold)]">
                {nameInitials(name)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm text-foreground">
                  {name}
                </span>
                {w.headline ? (
                  <span className="block truncate text-xs text-[var(--tott-muted)]">
                    {w.headline}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
