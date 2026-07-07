"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { toast } from "sonner";
import {
  deleteCollection,
  listCollectionsAdmin,
  type CollectionItem,
} from "@/services/collections.service";
import { formatApiError } from "@/lib/api/error-message";

export function CollectionsManagementContent() {
  const t = useTranslations("Dashboard.collections");
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<CollectionItem | null>(null);

  const { data: collections = [], isPending } = useQuery({
    queryKey: ["admin-collections"],
    queryFn: () => listCollectionsAdmin({ limit: 100 }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCollection(id),
    onSuccess: () => {
      toast.success(t("toasts.deleted"));
      qc.invalidateQueries({ queryKey: ["admin-collections"] });
      setPendingDelete(null);
    },
    onError: (err) => toast.error(formatApiError(err, t("errors.deleteFailed"))),
  });

  const q = search.trim().toLowerCase();
  const filtered = q
    ? collections.filter((c) => c.name.toLowerCase().includes(q))
    : collections;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-foreground">{t("list.pageTitle")}</h1>
        <Link
          href="/admin/collections/create"
          className="rounded-lg bg-[var(--tott-accent-gold)] px-4 py-2 text-sm font-semibold text-[var(--tott-on-accent)] hover:opacity-90 transition-opacity"
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

      {isPending ? (
        <p className="py-12 text-center text-sm text-[var(--tott-muted)]">{t("list.loading")}</p>
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-[var(--tott-card-border)] py-12 text-center text-sm text-[var(--tott-muted)]">
          {q ? t("list.empty.noMatch") : t("list.empty.none")}
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{c.name}</p>
                {c.description ? (
                  <p className="truncate text-xs text-[var(--tott-muted)]">{c.description}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-md border border-[var(--tott-card-border)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--tott-muted)]">
                  {(c.language ?? "en").toUpperCase()}
                </span>
                <Link
                  href={`/admin/collections/${c.id}/edit`}
                  className="rounded-md px-3 py-1.5 text-sm text-[var(--tott-dash-gold-label)] hover:text-foreground"
                >
                  {t("list.edit")}
                </Link>
                <button
                  type="button"
                  onClick={() => setPendingDelete(c)}
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
              {t("deleteModal.description", { name: pendingDelete.name })}
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
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(pendingDelete.id)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-[var(--tott-on-media)] hover:bg-red-700 disabled:opacity-40"
              >
                {deleteMutation.isPending ? t("deleteModal.confirmBusy") : t("deleteModal.confirm")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
