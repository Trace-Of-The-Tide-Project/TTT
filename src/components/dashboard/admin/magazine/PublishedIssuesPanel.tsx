"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  SearchIcon,
  PlusIcon,
  PenLineIcon,
  TrashIcon,
  XIcon,
  RefreshCwIcon,
} from "@/components/ui/icons";
import { mutationToast } from "@/hooks/useMutationToast";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { formatApiError } from "@/lib/api/error-message";
import { resolveArticleMediaSrc } from "@/lib/content/article-media-url";
import { uploadFileToUrl } from "@/services/uploads.service";
import { useMagazineIssues } from "@/hooks/queries/magazine-issues";
import { useMagazines } from "@/hooks/queries/magazines";
import {
  useCreateMagazineIssue,
  useUpdateMagazineIssue,
  useDeleteMagazineIssue,
} from "@/hooks/mutations/magazine-issues";
import type {
  MagazineIssue,
  MagazineIssueInput,
} from "@/services/magazine-issues.service";

const KINDS = ["article", "essay", "collection", "slides"] as const;
const STATUSES = ["published", "draft", "archived"] as const;
const TABS = ["all", "published", "draft", "archived"] as const;
const STATUS_KEYS = ["pending", "published", "archived", "rejected", "draft"];
const ROWS_PER_PAGE = 8;

type Tab = (typeof TABS)[number];

/** Status colors resolve to theme-aware CSS vars (defined in
 *  `globals.css` with light + dark variants). */
const statusColor: Record<string, string> = {
  pending: "var(--tott-status-amber)",
  published: "var(--tott-status-emerald)",
  archived: "var(--tott-muted)",
  rejected: "var(--tott-status-coral)",
  draft: "var(--tott-status-blue)",
};
const STATUS_FALLBACK = "var(--tott-muted)";

function normStatus(s: string | null | undefined): string {
  return (s ?? "draft").toLowerCase();
}

export function PublishedIssuesPanel() {
  const t = useTranslations("Dashboard.magazineIssues");
  const statusLabel = (s: string) =>
    STATUS_KEYS.includes(s) ? t(`statuses.${s}`) : s;
  const kindLabel = (k: string | null | undefined) => {
    const v = (k ?? "").toLowerCase();
    return (KINDS as readonly string[]).includes(v) ? t(`kinds.${v}`) : k || "—";
  };

  // Admin sees every issue regardless of status (the public page only
  // ever requests status=published) so drafts/archived are manageable.
  const query = useMagazineIssues({ limit: 100 });
  const issues = useMemo(() => query.data ?? [], [query.data]);

  const create = useCreateMagazineIssue();
  const update = useUpdateMagazineIssue();
  const remove = useDeleteMagazineIssue();

  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<MagazineIssue | "new" | null>(null);
  const [deleting, setDeleting] = useState<MagazineIssue | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: issues.length };
    for (const it of issues) {
      const s = normStatus(it.status);
      c[s] = (c[s] ?? 0) + 1;
    }
    return c;
  }, [issues]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return issues.filter((it) => {
      if (tab !== "all" && normStatus(it.status) !== tab) return false;
      if (!q) return true;
      return (
        it.title.toLowerCase().includes(q) ||
        (it.category ?? "").toLowerCase().includes(q) ||
        (it.edition ?? "").toLowerCase().includes(q) ||
        (it.kind ?? "").toLowerCase().includes(q)
      );
    });
  }, [issues, tab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (safePage - 1) * ROWS_PER_PAGE,
    safePage * ROWS_PER_PAGE,
  );

  const resetPage = () => setPage(1);

  const loadError = query.error
    ? formatApiError(query.error, t("published.list.loadError"))
    : null;

  return (
    <div className="space-y-4">
      {/* Status tabs + New button */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-1 flex-wrap gap-1 rounded-xl bg-[var(--tott-elevated)] p-1">
          {TABS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTab(id);
                resetPage();
              }}
              className={`flex-1 rounded-md px-3 py-2.5 text-sm font-medium transition-all ${
                tab === id
                  ? "bg-[var(--tott-dash-control-bg)] text-foreground"
                  : "bg-transparent text-[var(--tott-tab-inactive)] hover:text-[var(--tott-tab-inactive-hover)]"
              }`}
            >
              {t(`published.tabs.${id}`)}
              <span className="ms-1.5 text-xs opacity-60">
                {counts[id] ?? 0}
              </span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
          style={{
            borderColor: "color-mix(in srgb, var(--tott-accent-gold) 50%, transparent)",
            backgroundColor: "color-mix(in srgb, var(--tott-accent-gold) 14%, transparent)",
            color: "var(--tott-accent-gold)",
          }}
        >
          <span className="[&_svg]:h-4 [&_svg]:w-4">
            <PlusIcon />
          </span>
          {t("published.new")}
        </button>
      </div>

      {loadError ? (
        <div
          className="rounded-lg border px-4 py-3 text-sm"
          style={{
            borderColor: "color-mix(in srgb, var(--tott-status-coral) 40%, transparent)",
            backgroundColor: "color-mix(in srgb, var(--tott-status-coral) 12%, transparent)",
            color: "var(--tott-status-coral)",
          }}
        >
          <p>{loadError}</p>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium underline hover:opacity-80"
            style={{ color: "var(--tott-accent-gold)" }}
          >
            <span className="[&_svg]:h-3.5 [&_svg]:w-3.5">
              <RefreshCwIcon />
            </span>
            {t("published.list.retry")}
          </button>
        </div>
      ) : null}

      <ChamferedPanel className="px-3 pb-4 pt-4 min-[504px]:px-6 min-[504px]:pb-6 min-[504px]:pt-6">
        <div className="relative mb-4">
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--tott-muted)" }}
          >
            <SearchIcon />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
            placeholder={t("published.list.searchPlaceholder")}
            className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] py-2.5 pl-10 pr-4 text-sm text-foreground outline-none placeholder:text-[var(--tott-muted)] focus:border-[var(--tott-accent-gold)]"
          />
        </div>

        {query.isLoading ? (
          <div
            className="px-5 py-12 text-center text-sm"
            style={{ color: "var(--tott-muted)" }}
          >
            {t("published.list.loading")}
          </div>
        ) : pageRows.length === 0 ? (
          <div
            className="border border-[var(--tott-card-border)] px-5 py-12 text-center text-sm"
            style={{ color: "var(--tott-muted)" }}
          >
            {search.trim() || tab !== "all"
              ? t("published.list.noMatch")
              : t("published.list.empty")}
          </div>
        ) : (
          <>
            {/* Wide table ≥640px */}
            <div className="hidden sm:block">
              <div className="grid grid-cols-[36%_16%_16%_16%_16%] border border-[var(--tott-card-border)]">
                {["title", "kind", "edition", "status", ""].map((h, i) => (
                  <div
                    key={i}
                    className="px-4 py-3 text-start text-sm font-medium text-[var(--tott-dash-gold-label)]"
                  >
                    {h ? t(`published.list.headers.${h}`) : ""}
                  </div>
                ))}
              </div>
              {pageRows.map((it) => {
                const s = normStatus(it.status);
                return (
                  <div
                    key={it.id}
                    className="grid grid-cols-[36%_16%_16%_16%_16%] border-x border-b border-[var(--tott-card-border)] transition-colors hover:bg-[var(--tott-elevated)]"
                  >
                    <div className="px-4 py-3 text-sm font-medium text-foreground">
                      {it.title}
                    </div>
                    <div className="px-4 py-3 text-sm text-[var(--tott-muted)]">
                      {kindLabel(it.kind)}
                    </div>
                    <div className="px-4 py-3 text-sm text-[var(--tott-muted)]">
                      {it.edition || "—"}
                    </div>
                    <div className="px-4 py-3">
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${statusColor[s] ?? STATUS_FALLBACK} 12%, transparent)`,
                          color: statusColor[s] ?? STATUS_FALLBACK,
                        }}
                      >
                        {statusLabel(s)}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-1.5 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setEditing(it)}
                        aria-label={t("published.list.edit")}
                        className="inline-flex items-center justify-center rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] p-1.5 text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)] [&_svg]:h-3.5 [&_svg]:w-3.5"
                      >
                        <PenLineIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(it)}
                        aria-label={t("published.list.delete")}
                        className="inline-flex items-center justify-center rounded-lg border p-1.5 transition-opacity hover:opacity-90 [&_svg]:h-3.5 [&_svg]:w-3.5"
                        style={{
                          borderColor: "color-mix(in srgb, var(--tott-status-coral) 40%, transparent)",
                          color: "var(--tott-status-coral)",
                        }}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stacked cards <640px */}
            <div className="space-y-2 sm:hidden">
              {pageRows.map((it) => {
                const s = normStatus(it.status);
                return (
                  <div
                    key={it.id}
                    className="rounded-lg border border-[var(--tott-card-border)] p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {it.title}
                      </span>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${statusColor[s] ?? STATUS_FALLBACK} 12%, transparent)`,
                          color: statusColor[s] ?? STATUS_FALLBACK,
                        }}
                      >
                        {statusLabel(s)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--tott-muted)]">
                      {[it.kind ? kindLabel(it.kind) : null, it.edition || null]
                        .filter(Boolean)
                        .join(" · ") || "—"}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(it)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-3 py-1.5 text-xs font-medium text-foreground [&_svg]:h-3.5 [&_svg]:w-3.5"
                      >
                        <PenLineIcon />
                        {t("published.list.edit")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(it)}
                        className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium [&_svg]:h-3.5 [&_svg]:w-3.5"
                        style={{
                          borderColor: "color-mix(in srgb, var(--tott-status-coral) 40%, transparent)",
                          color: "var(--tott-status-coral)",
                        }}
                      >
                        <TrashIcon />
                        {t("published.list.delete")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filtered.length > ROWS_PER_PAGE ? (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span style={{ color: "var(--tott-muted)" }}>
                  {t("published.list.pagination", {
                    from: (safePage - 1) * ROWS_PER_PAGE + 1,
                    to: Math.min(safePage * ROWS_PER_PAGE, filtered.length),
                    total: filtered.length,
                  })}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={safePage <= 1}
                    onClick={() => setPage((x) => x - 1)}
                    className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2 text-[var(--tott-muted)] transition-colors hover:text-foreground disabled:opacity-40"
                  >
                    {t("published.list.previous")}
                  </button>
                  <button
                    type="button"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((x) => x + 1)}
                    className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-2 text-[var(--tott-muted)] transition-colors hover:text-foreground disabled:opacity-40"
                  >
                    {t("published.list.next")}
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </ChamferedPanel>

      {editing ? (
        <IssueFormModal
          item={editing === "new" ? null : editing}
          saving={create.isPending || update.isPending}
          onClose={() => setEditing(null)}
          onSave={(payload) => {
            const isNew = editing === "new";
            const run = isNew
              ? create.mutateAsync(payload)
              : update.mutateAsync({ id: (editing as MagazineIssue).id, payload });
            mutationToast(() => run, {
              loading: t("published.toast.saving"),
              success: isNew
                ? t("published.toast.created")
                : t("published.toast.updated"),
              error: t("published.toast.saveError"),
            })
              .then(() => setEditing(null))
              .catch(() => {});
          }}
        />
      ) : null}

      {deleting ? (
        <DeleteConfirm
          title={deleting.title}
          deleting={remove.isPending}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            mutationToast(() => remove.mutateAsync(deleting.id), {
              loading: t("published.toast.deleting"),
              success: t("published.toast.deleted"),
              error: t("published.toast.deleteError"),
            })
              .then(() => setDeleting(null))
              .catch(() => {});
          }}
        />
      ) : null}
    </div>
  );
}

// ─── Create / edit form ─────────────────────────────────────────────

type FormState = {
  title: string;
  magazine_id: string;
  kind: string;
  status: string;
  cover_image: string;
  excerpt: string;
  description: string;
  page_count: string;
  edition: string;
  category: string;
  published_at: string;
};

type FieldErrors = Partial<
  Record<"title" | "magazine_id" | "edition", string>
>;

function toForm(item: MagazineIssue | null): FormState {
  return {
    title: item?.title ?? "",
    magazine_id: item?.magazine_id ?? "",
    kind: item?.kind ?? "article",
    status: normStatus(item?.status ?? "published"),
    cover_image: item?.cover_image ?? "",
    excerpt: item?.excerpt ?? "",
    description: item?.description ?? "",
    page_count: item?.page_count != null ? String(item.page_count) : "",
    edition:
      item?.edition_number != null
        ? String(item.edition_number)
        : item?.edition ?? "",
    category: item?.category ?? "",
    published_at: item?.published_at ? item.published_at.slice(0, 10) : "",
  };
}

function IssueFormModal({
  item,
  saving,
  onClose,
  onSave,
}: {
  item: MagazineIssue | null;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: MagazineIssueInput) => void;
}) {
  const t = useTranslations("Dashboard.magazineIssues");
  const isEdit = Boolean(item);
  const [form, setForm] = useState<FormState>(() => toForm(item));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [uploading, setUploading] = useState(false);
  const busy = saving || uploading;

  const magazinesQuery = useMagazines({ limit: 100 });
  const magazines = useMemo(
    () => magazinesQuery.data ?? [],
    [magazinesQuery.data],
  );

  // Default to the only/first magazine when creating, so the common
  // single-magazine setup needs no manual pick.
  useEffect(() => {
    if (!form.magazine_id && magazines.length > 0) {
      setForm((prev) =>
        prev.magazine_id ? prev : { ...prev, magazine_id: magazines[0].id },
      );
    }
  }, [magazines, form.magazine_id]);

  const set =
    (field: keyof FormState) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setUploading(true);
    try {
      const url = await mutationToast(() => uploadFileToUrl(file), {
        loading: t("published.form.uploading"),
        success: t("published.form.uploaded"),
        error: t("published.form.uploadError"),
      });
      setForm((prev) => ({ ...prev, cover_image: url }));
    } catch {
      /* surfaced via toast */
    } finally {
      setUploading(false);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation for the fields the backend requires, with
    // readable per-field messages (so users never see raw DB errors
    // like "MagazineIssue.edition_number cannot be null").
    const next: FieldErrors = {};
    if (!form.title.trim()) next.title = t("published.form.errors.titleRequired");
    if (!form.magazine_id) next.magazine_id = t("published.form.errors.magazineRequired");
    const editionNum = parseInt(form.edition, 10);
    if (!form.edition.trim()) {
      next.edition = t("published.form.errors.editionRequired");
    } else if (Number.isNaN(editionNum)) {
      next.edition = t("published.form.errors.editionNumber");
    }
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    onSave({
      title: form.title.trim(),
      magazine_id: form.magazine_id,
      kind: form.kind || null,
      status: form.status || null,
      cover_image: form.cover_image.trim() || null,
      excerpt: form.excerpt.trim() || null,
      description: form.description.trim() || null,
      page_count: form.page_count ? parseInt(form.page_count, 10) : null,
      edition_number: editionNum,
      category: form.category.trim() || null,
      // The date input yields "YYYY-MM-DD"; the API stores a full ISO
      // datetime, so normalize before sending (NaN guard → null).
      published_at: form.published_at
        ? (() => {
            const d = new Date(form.published_at);
            return Number.isNaN(d.getTime()) ? null : d.toISOString();
          })()
        : null,
    });
  };

  const inputClass =
    "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground outline-none placeholder:text-[var(--tott-muted)] focus:border-[var(--tott-accent-gold)]";
  const labelClass =
    "mb-1 block text-xs font-medium text-[var(--tott-dash-gold-label)]";

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        aria-label={t("published.form.close")}
        onClick={() => !busy && onClose()}
        className="absolute inset-0 backdrop-blur-md"
        style={{ backgroundColor: "var(--tott-overlay)" }}
      />
      <div className="relative mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-base font-bold text-foreground">
            {isEdit ? t("published.form.editTitle") : t("published.form.createTitle")}
          </h2>
          <button
            type="button"
            onClick={() => !busy && onClose()}
            disabled={busy}
            className="shrink-0 rounded-lg p-1 text-[var(--tott-muted)] transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground disabled:opacity-40"
            aria-label={t("published.form.close")}
          >
            <XIcon />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className={labelClass}>{t("published.form.fields.title")} *</label>
            <input
              type="text"
              className={inputClass}
              value={form.title}
              onChange={set("title")}
              placeholder={t("published.form.fields.titlePlaceholder")}
            />
            <FieldError message={errors.title} />
          </div>

          <div>
            <label className={labelClass}>
              {t("published.form.fields.magazine")} *
            </label>
            <select
              className={inputClass}
              value={form.magazine_id}
              onChange={set("magazine_id")}
              disabled={magazinesQuery.isLoading}
            >
              <option value="">
                {magazinesQuery.isLoading
                  ? t("published.form.fields.magazineLoading")
                  : t("published.form.fields.magazinePlaceholder")}
              </option>
              {magazines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
            <FieldError message={errors.magazine_id} />
            {!magazinesQuery.isLoading && magazines.length === 0 ? (
              <p className="mt-1 text-xs" style={{ color: "var(--tott-muted)" }}>
                {t("published.form.fields.magazineEmpty")}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t("published.form.fields.kind")}</label>
              <select className={inputClass} value={form.kind} onChange={set("kind")}>
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {t(`kinds.${k}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t("published.form.fields.status")}</label>
              <select className={inputClass} value={form.status} onChange={set("status")}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t(`statuses.${s}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>
                {t("published.form.fields.edition")} *
              </label>
              <input
                type="number"
                min="0"
                className={inputClass}
                value={form.edition}
                onChange={set("edition")}
                placeholder={t("published.form.fields.editionPlaceholder")}
              />
              <FieldError message={errors.edition} />
            </div>
            <div>
              <label className={labelClass}>{t("published.form.fields.category")}</label>
              <input
                type="text"
                className={inputClass}
                value={form.category}
                onChange={set("category")}
                placeholder={t("published.form.fields.categoryPlaceholder")}
              />
            </div>
            <div>
              <label className={labelClass}>{t("published.form.fields.pageCount")}</label>
              <input
                type="number"
                min="0"
                className={inputClass}
                value={form.page_count}
                onChange={set("page_count")}
              />
            </div>
            <div>
              <label className={labelClass}>{t("published.form.fields.publishedAt")}</label>
              <input
                type="date"
                className={inputClass}
                value={form.published_at}
                onChange={set("published_at")}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t("published.form.fields.coverImage")}</label>
            <CoverUploadZone
              value={form.cover_image}
              uploading={uploading}
              onChange={handleCoverUpload}
            />
            <input
              type="text"
              className={`${inputClass} mt-2`}
              value={form.cover_image}
              onChange={set("cover_image")}
              placeholder={t("published.form.fields.coverImagePlaceholder")}
            />
          </div>

          <div>
            <label className={labelClass}>{t("published.form.fields.excerpt")}</label>
            <textarea
              rows={2}
              className={inputClass}
              value={form.excerpt}
              onChange={set("excerpt")}
              placeholder={t("published.form.fields.excerptPlaceholder")}
            />
          </div>

          <div>
            <label className={labelClass}>{t("published.form.fields.description")}</label>
            <textarea
              rows={4}
              className={inputClass}
              value={form.description}
              onChange={set("description")}
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-[var(--tott-card-border)] pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-lg px-4 py-2 text-sm text-[var(--tott-muted)] transition-colors hover:text-foreground disabled:opacity-40"
            >
              {t("published.form.cancel")}
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg border px-5 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{
                borderColor: "color-mix(in srgb, var(--tott-accent-gold) 60%, transparent)",
                backgroundColor: "color-mix(in srgb, var(--tott-accent-gold) 16%, transparent)",
                color: "var(--tott-accent-gold)",
              }}
            >
              {busy ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : null}
              {busy
                ? t("published.form.saving")
                : isEdit
                  ? t("published.form.save")
                  : t("published.form.create")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Inline validation message under a form field. */
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1 text-xs" style={{ color: "var(--tott-status-coral)" }}>
      {message}
    </p>
  );
}

/** Drag-and-drop + click-to-upload zone for the cover image. */
function CoverUploadZone({
  value,
  uploading,
  onChange,
}: {
  value: string;
  uploading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const t = useTranslations("Dashboard.magazineIssues");
  const id = useId();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const dragProps = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (!file || !inputRef.current) return;
      const dt = new DataTransfer();
      dt.items.add(file);
      inputRef.current.files = dt.files;
      inputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
    },
  };

  if (value && !uploading) {
    return (
      <div className="relative mt-1 inline-block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolveArticleMediaSrc(value)}
          alt=""
          className="h-36 w-24 rounded-lg border border-[var(--tott-card-border)] object-cover shadow-md"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <label
          htmlFor={id}
          className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-lg bg-black/50 text-xs font-medium text-white opacity-0 transition-opacity hover:opacity-100"
        >
          {t("published.form.changeCover")}
          <input
            id={id}
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onChange}
          />
        </label>
      </div>
    );
  }

  return (
    <label
      htmlFor={id}
      {...dragProps}
      className={[
        "mt-1 flex min-h-[100px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors",
        dragging
          ? "border-[var(--tott-accent-gold)] bg-[color-mix(in_srgb,var(--tott-accent-gold)_6%,transparent)]"
          : "border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] hover:border-[color-mix(in_srgb,var(--tott-accent-gold)_50%,transparent)]",
      ].join(" ")}
    >
      <input
        id={id}
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
        disabled={uploading}
      />
      {uploading ? (
        <div className="flex flex-col items-center gap-2 py-5">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--tott-card-border)] border-t-[var(--tott-accent-gold)]" />
          <span className="text-xs text-[var(--tott-muted)]">
            {t("published.form.uploading")}
          </span>
        </div>
      ) : (
        <div className="pointer-events-none flex flex-col items-center gap-1 px-4 py-5 text-center">
          <span className="text-xs font-medium text-[var(--tott-muted)]">
            {t("published.form.uploadHint")}
          </span>
        </div>
      )}
    </label>
  );
}

// ─── Delete confirmation ────────────────────────────────────────────

function DeleteConfirm({
  title,
  deleting,
  onCancel,
  onConfirm,
}: {
  title: string;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const t = useTranslations("Dashboard.magazineIssues");
  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        aria-label={t("published.form.close")}
        onClick={() => !deleting && onCancel()}
        className="absolute inset-0 backdrop-blur-md"
        style={{ backgroundColor: "var(--tott-overlay)" }}
      />
      <div className="relative mx-4 w-full max-w-sm rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 shadow-2xl">
        <h2 className="text-base font-bold text-foreground">
          {t("published.delete.title")}
        </h2>
        <p className="mt-2 text-sm text-[var(--tott-muted)]">
          {t("published.delete.body", { title })}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-lg px-4 py-2 text-sm text-[var(--tott-muted)] transition-colors hover:text-foreground disabled:opacity-40"
          >
            {t("published.delete.cancel")}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{
              borderColor: "color-mix(in srgb, var(--tott-status-coral) 60%, transparent)",
              backgroundColor: "color-mix(in srgb, var(--tott-status-coral) 18%, transparent)",
              color: "var(--tott-status-coral)",
            }}
          >
            {deleting ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : null}
            {deleting ? t("published.delete.deleting") : t("published.delete.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
