"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { toast } from "sonner";
import { formatApiError } from "@/lib/api/error-message";
import { useEncountersAdmin } from "@/hooks/queries/encounters-admin";
import { useDeleteEncounter } from "@/hooks/mutations/encounters-admin";
import type { EncounterAdmin } from "@/services/encounters.service";

function formatDate(input?: string | null): string {
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return input;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function EncountersListContent() {
  const t = useTranslations("Dashboard.encounters");
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<EncounterAdmin | null>(null);

  const { data: encounters = [], isLoading } = useEncountersAdmin({ limit: 100 });
  const del = useDeleteEncounter();

  const q = search.trim().toLowerCase();
  const filtered = q
    ? encounters.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          (e.location ?? "").toLowerCase().includes(q) ||
          (e.type ?? "").toLowerCase().includes(q),
      )
    : encounters;

  const handleDelete = () => {
    if (!pendingDelete) return;
    del.mutate(pendingDelete.id, {
      onSuccess: () => {
        toast.success(t("toasts.deleted"));
        setPendingDelete(null);
      },
      onError: (err) =>
        toast.error(t("toasts.deleteFailed"), {
          description: formatApiError(err, t("toasts.errorBody")),
        }),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">{t("list.pageTitle")}</h2>
        <Link
          href="/admin/encounters/create"
          className="rounded-lg bg-[var(--tott-accent-gold)] px-4 py-2 text-sm font-semibold text-[var(--tott-on-accent)] transition-opacity hover:opacity-90"
        >
          + {t("list.addNew")}
        </Link>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("list.searchPlaceholder")}
        className="w-full max-w-sm rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--tott-muted)] outline-none focus:border-[var(--tott-accent-gold)]/60"
      />

      {isLoading ? (
        <p className="py-12 text-center text-sm text-[var(--tott-muted)]">{t("list.loading")}</p>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-[var(--tott-card-border)] py-12 text-center text-sm text-[var(--tott-muted)]">
          {q ? t("list.empty.noMatch") : t("list.empty.none")}
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{e.title}</p>
                  <p className="truncate text-xs text-[var(--tott-muted)]">
                    {formatDate(e.date) || t("list.noDate")}
                    {e.location ? ` · ${e.location}` : ""}
                  </p>
                </div>
                {e.status !== "published" ? (
                  <span className="shrink-0 rounded-md border border-[var(--tott-status-amber)] px-2 py-0.5 text-[10px] text-[var(--tott-status-amber)]">
                    {t("list.draft")}
                  </span>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {e.type ? (
                  <span className="rounded-md border border-[var(--tott-card-border)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--tott-muted)]">
                    {e.type}
                  </span>
                ) : null}
                <Link
                  href={`/admin/encounters/${e.id}/edit`}
                  className="rounded-md px-3 py-1.5 text-sm text-[var(--tott-dash-gold-label)] hover:text-foreground"
                >
                  {t("list.edit")}
                </Link>
                <button
                  type="button"
                  onClick={() => setPendingDelete(e)}
                  className="rounded-md px-3 py-1.5 text-sm text-red-400 hover:text-red-300"
                >
                  {t("list.delete")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pendingDelete ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6">
            <h2 className="text-sm font-semibold text-foreground">{t("deleteModal.title")}</h2>
            <p className="mt-2 text-sm text-[var(--tott-muted)]">
              {t("deleteModal.description", { name: pendingDelete.title })}
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="rounded-lg px-4 py-2 text-sm text-[var(--tott-muted)] hover:text-foreground"
              >
                {t("deleteModal.cancel")}
              </button>
              <button
                type="button"
                disabled={del.isPending}
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-[var(--tott-on-media)] hover:bg-red-700 disabled:opacity-40"
              >
                {del.isPending ? t("deleteModal.confirmBusy") : t("deleteModal.confirm")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}