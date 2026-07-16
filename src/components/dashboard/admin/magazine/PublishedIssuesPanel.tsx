"use client";

import { useCallback, useId, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
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
import { useCreateMagazine } from "@/hooks/mutations/magazines";
import {
  useCreateMagazineIssue,
  useUpdateMagazineIssue,
  useDeleteMagazineIssue,
} from "@/hooks/mutations/magazine-issues";
import { IssueArticlesPanel } from "./IssueArticlesPanel";
import { IssueContributorsPanel } from "./IssueContributorsPanel";
import { LanguageFormTabs, TranslationWizard } from "@/components/dashboard/admin/translations";
import type { LanguageTabStatus } from "@/components/dashboard/admin/translations/LanguageFormTabs";
import type { TranslationWizardReviewLine } from "@/components/dashboard/admin/translations/TranslationWizard";
import type {
  MagazineIssue,
  MagazineIssueInput,
} from "@/services/magazine-issues.service";

const KINDS = ["editorial", "crowdfunded"] as const;
const STATUSES = ["published", "draft", "archived"] as const;
const TABS = ["all", "published", "draft", "archived"] as const;
const STATUS_KEYS = ["pending", "published", "archived", "rejected", "draft"];
const LANGS = ["en", "ar", "es", "fr"] as const;
const ROWS_PER_PAGE = 8;

/** Default magazine auto-created when none exists, so the admin never
 *  has to think about the magazine→issues hierarchy. */
const DEFAULT_MAGAZINE_TITLE = "Trace of the Tide";

/** URL-safe slug from any title. Unicode-aware so Arabic titles don't
 *  collapse to empty; falls back to "issue" when nothing survives. */
function slugify(input: string): string {
  const base = input
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return base || "issue";
}

type Tab = (typeof TABS)[number];

/** What the form modal is doing: editing an issue, creating a fresh one, or
 * creating a new-language version of an existing one. */
type Editing =
  | MagazineIssue
  | "new"
  | { source: MagazineIssue; language: string };

function isTranslateReq(
  e: Editing,
): e is { source: MagazineIssue; language: string } {
  return typeof e === "object" && "source" in e;
}

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
  const tTr = useTranslations("Dashboard.translations");
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

  // Magazines are the parent of issues. We hide this from the admin:
  // reuse the existing magazine, or auto-create a default one on the
  // first issue. Single shared query (cache-backed) drives both.
  const magazinesQuery = useMagazines({ limit: 100 });
  const magazines = useMemo(
    () => magazinesQuery.data ?? [],
    [magazinesQuery.data],
  );
  const createMagazine = useCreateMagazine();
  const magazineName = magazines[0]?.name ?? magazines[0]?.title ?? null;

  // Next edition number = highest existing + 1 (→ 1 on the first issue).
  const nextEdition = useMemo(
    () =>
      issues.reduce((m, it) => Math.max(m, it.edition_number ?? 0), 0) + 1,
    [issues],
  );

  const [tab, setTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Editing | null>(null);
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

  // Every issue sharing the open modal's translation group, keyed by
  // language — lets the modal's tabs seed from already-loaded data.
  const editingAllVersions = useMemo(() => {
    const anchorId =
      editing && editing !== "new" && !isTranslateReq(editing) ? editing.id : null;
    if (!anchorId) return {};
    const map: Record<string, MagazineIssue> = {};
    for (const it of issues) {
      if (it.id === anchorId || it.translation_of === anchorId) {
        map[(it.language ?? "en").toLowerCase()] = it;
      }
    }
    return map;
  }, [issues, editing]);

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
          key={
            editing === "new"
              ? "new"
              : isTranslateReq(editing)
                ? `translate-${editing.source.id}-${editing.language}`
                : editing.id
          }
          item={editing === "new" || isTranslateReq(editing) ? null : editing}
          translateFrom={isTranslateReq(editing) ? editing : null}
          defaultEdition={nextEdition}
          magazineName={magazineName}
          saving={create.isPending || update.isPending || createMagazine.isPending}
          allVersions={editingAllVersions}
          onClose={() => setEditing(null)}
          onSave={async (plan) => {
            let magazineId: string | null = magazines[0]?.id ?? null;
            // Full created primary issue, so we can reopen the modal in edit
            // mode (→ article panel) right after create — no edit-button hop.
            let createdPrimary: MagazineIssue | null = null;

            const savePrimary = async (): Promise<{ id: string } | null> => {
              const p = plan[0];
              if (p.existingId) {
                await update.mutateAsync({ id: p.existingId, payload: p.values });
                return { id: p.existingId };
              }
              if (!magazineId) {
                const created = await createMagazine.mutateAsync({
                  name: DEFAULT_MAGAZINE_TITLE,
                  title: DEFAULT_MAGAZINE_TITLE,
                  slug: slugify(DEFAULT_MAGAZINE_TITLE),
                  status: "published",
                });
                magazineId = created?.id ?? null;
              }
              const created = await create.mutateAsync({
                ...p.values,
                magazine_id: magazineId,
                // slug is required on create (and must be unique); never
                // regenerated on edit so public deep-links stay stable.
                slug: `${slugify(p.values.title)}-${Date.now().toString(36).slice(-5)}`,
              });
              createdPrimary = created;
              return created ? { id: created.id } : null;
            };

            const isNew = !plan[0].existingId;
            const failed: string[] = [];
            try {
              await mutationToast(
                async () => {
                  const primary = await savePrimary();
                  for (const p of plan.slice(1)) {
                    try {
                      if (p.existingId) {
                        await update.mutateAsync({ id: p.existingId, payload: p.values });
                      } else if (primary?.id) {
                        await create.mutateAsync({
                          ...p.values,
                          translation_of: primary.id,
                          magazine_id: magazineId,
                          slug: `${slugify(p.values.title)}-${p.values.language}-${Date.now()
                            .toString(36)
                            .slice(-5)}`,
                        });
                      }
                    } catch {
                      failed.push(p.values.language ?? "?");
                    }
                  }
                  return primary;
                },
                {
                  loading: t("published.toast.saving"),
                  success: !isNew
                    ? t("published.toast.updated")
                    : plan.length > 1
                      ? t("published.toast.createdAll")
                      : t("published.toast.created"),
                  error: t("published.toast.saveError"),
                },
              );
            } catch {
              return;
            }
            if (failed.length > 0) {
              toast.error(
                tTr("toasts.partialFailure", { languages: failed.join(", ").toUpperCase() }),
              );
            }
            // Fresh issue → jump straight into edit mode so its article panel
            // is visible immediately (no close + re-open + edit-button hop).
            setEditing(isNew && createdPrimary ? createdPrimary : null);
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
  subtitle: string;
  kind: string;
  status: string;
  language: string;
  is_premium: boolean;
  price: string;
  currency: string;
  pdf_path: string;
  funding_goal: string;
  funding_deadline: string;
  cover_image: string;
  excerpt: string;
  description: string;
  page_count: string;
  edition: string;
  category: string;
  published_at: string;
};

type FieldErrors = Partial<Record<"title" | "edition", string>>;

function toForm(item: MagazineIssue | null, defaultEdition: number): FormState {
  return {
    title: item?.title ?? "",
    subtitle: item?.subtitle ?? "",
    kind: item?.kind ?? "editorial",
    status: normStatus(item?.status ?? "published"),
    language: item?.language ?? "",
    is_premium: item?.is_premium ?? false,
    price: item?.price != null ? String(item.price) : "",
    currency: item?.currency ?? "USD",
    pdf_path: (item as { pdf_path?: string | null })?.pdf_path ?? "",
    funding_goal: item?.funding_goal != null ? String(item.funding_goal) : "",
    funding_deadline: item?.funding_deadline
      ? item.funding_deadline.slice(0, 10)
      : "",
    cover_image: item?.cover_image ?? "",
    excerpt: item?.excerpt ?? "",
    description: item?.description ?? "",
    page_count: item?.page_count != null ? String(item.page_count) : "",
    edition:
      item?.edition_number != null
        ? String(item.edition_number)
        : item?.edition ?? (item ? "" : String(defaultEdition)),
    category: item?.category ?? "",
    published_at: item?.published_at ? item.published_at.slice(0, 10) : "",
  };
}

/** One locale's save intent, assembled by `submit()` for the parent to run. */
export type IssueSavePlanEntry = {
  existingId?: string;
  values: MagazineIssueInput;
};

function IssueFormModal({
  item,
  translateFrom,
  defaultEdition,
  magazineName,
  saving,
  allVersions,
  onClose,
  onSave,
}: {
  item: MagazineIssue | null;
  /** Set when creating a new-language version: prefill from `source`, save
   * with `language` + `translation_of`. */
  translateFrom: { source: MagazineIssue; language: string } | null;
  defaultEdition: number;
  magazineName: string | null;
  saving: boolean;
  /** Every issue in the same translation group as `item` (edit mode), keyed
   * by language — lets tab-switching seed from already-loaded data. */
  allVersions: Record<string, MagazineIssue>;
  onClose: () => void;
  onSave: (plan: IssueSavePlanEntry[]) => void;
}) {
  const t = useTranslations("Dashboard.magazineIssues");
  const tTr = useTranslations("Dashboard.translations");
  const locale = useLocale();
  const isEdit = Boolean(item);
  const isTranslation = !isEdit && Boolean(translateFrom);

  const initialLang =
    translateFrom?.language ??
    item?.language ??
    ((LANGS as readonly string[]).includes(locale) ? locale : "en");
  const primaryLang = item?.language ?? initialLang;
  const wizardLocales = useMemo(
    () => [primaryLang, ...LANGS.filter((l) => l !== primaryLang)],
    [primaryLang],
  );
  const [wizardStep, setWizardStep] = useState(0);
  const isWizard = !isEdit && !isTranslation;
  const formRef = useRef<HTMLFormElement>(null);

  const [activeLang, setActiveLang] = useState(initialLang);
  const [forms, setForms] = useState<Record<string, FormState>>(() => {
    const base = toForm(item ?? translateFrom?.source ?? null, defaultEdition);
    base.language = initialLang;
    // A new-language version starts as a draft of the source's content, so a
    // half-translated issue never goes live on save by accident.
    return { [initialLang]: translateFrom ? { ...base, status: "draft" } : base };
  });
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [uploading, setUploading] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const busy = saving || uploading;

  const form = forms[activeLang] ?? toForm(null, defaultEdition);

  const tabStatus = useMemo(() => {
    const map: Record<string, LanguageTabStatus> = {};
    for (const loc of LANGS) {
      map[loc] = dirty[loc]
        ? "dirty"
        : loc === primaryLang
          ? "primary"
          : allVersions[loc] || forms[loc]
            ? "existing"
            : "empty";
    }
    return map;
  }, [dirty, primaryLang, allVersions, forms]);

  const goToWizardStep = useCallback(
    (step: number) => {
      const loc = wizardLocales[step];
      if (loc && !forms[loc]) {
        const existing = allVersions[loc];
        setForms((prev) => ({
          ...prev,
          [loc]: existing
            ? { ...toForm(existing, defaultEdition), language: loc }
            : { ...(prev[wizardLocales[0]] ?? toForm(null, defaultEdition)), language: loc },
        }));
      }
      if (loc) setActiveLang(loc);
      setWizardStep(step);
    },
    [wizardLocales, forms, allVersions, defaultEdition],
  );
  const wizardReviewLines: TranslationWizardReviewLine[] = useMemo(
    () =>
      wizardLocales.map((loc) => ({
        locale: loc,
        label: tTr.has(`languages.${loc}`) ? tTr(`languages.${loc}`) : loc.toUpperCase(),
        action: loc === wizardLocales[0] || dirty[loc] ? "create" : "skip",
      })),
    [wizardLocales, dirty, tTr],
  );

  const updateForm = (mutate: (prev: FormState) => FormState) => {
    setForms((prev) => {
      const current = prev[activeLang] ?? toForm(null, defaultEdition);
      return { ...prev, [activeLang]: mutate(current) };
    });
    setDirty((prev) => (prev[activeLang] ? prev : { ...prev, [activeLang]: true }));
  };

  const switchFormLanguage = (next: string) => {
    if (next === activeLang) return;
    if (!forms[next]) {
      const existing = allVersions[next];
      setForms((prev) => ({
        ...prev,
        [next]: existing
          ? { ...toForm(existing, defaultEdition), language: next }
          : { ...(prev[activeLang] ?? toForm(null, defaultEdition)), language: next },
      }));
    }
    setActiveLang(next);
  };

  // Snapshot of the pristine forms — anything different means unsaved work,
  // so closing asks for confirmation instead of silently dropping it.
  const [initialFormSnapshot] = useState(() => JSON.stringify(forms));
  const isDirty = JSON.stringify(forms) !== initialFormSnapshot;

  const requestClose = () => {
    if (busy) return;
    if (isDirty) setConfirmDiscard(true);
    else onClose();
  };

  const set =
    (field: keyof FormState) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      updateForm((prev) => ({ ...prev, [field]: e.target.value }));
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
      updateForm((prev) => ({ ...prev, cover_image: url }));
    } catch {
      /* surfaced via toast */
    } finally {
      setUploading(false);
    }
  };

  const toPayload = (f: FormState, lang: string): MagazineIssueInput => {
    const toIso = (ymd: string): string | null => {
      if (!ymd) return null;
      const d = new Date(ymd);
      return Number.isNaN(d.getTime()) ? null : d.toISOString();
    };
    const isCrowdfunded = f.kind === "crowdfunded";
    return {
      title: f.title.trim(),
      subtitle: f.subtitle.trim() || null,
      kind: f.kind || null,
      status: f.status || null,
      language: lang,
      is_premium: f.is_premium,
      price: f.price ? parseFloat(f.price) : null,
      currency: f.currency.trim() || "USD",
      pdf_path: f.pdf_path.trim() || null,
      cover_image: f.cover_image.trim() || null,
      excerpt: f.excerpt.trim() || null,
      description: f.description.trim() || null,
      page_count: f.page_count ? parseInt(f.page_count, 10) : null,
      edition_number: parseInt(f.edition, 10),
      category: f.category.trim() || null,
      published_at: toIso(f.published_at),
      funding_goal: isCrowdfunded && f.funding_goal ? parseFloat(f.funding_goal) : null,
      funding_deadline: isCrowdfunded ? toIso(f.funding_deadline) : null,
    };
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    // Only the genuinely user-facing fields are validated here; slug,
    // magazine, and language are filled in automatically so the admin
    // only has to type a title. Edition is prefilled with the next
    // number but stays editable.
    const next: FieldErrors = {};
    if (!form.title.trim()) next.title = t("published.form.errors.titleRequired");
    if (!form.edition.trim()) {
      next.edition = t("published.form.errors.editionRequired");
    } else if (Number.isNaN(parseInt(form.edition, 10))) {
      next.edition = t("published.form.errors.editionNumber");
    }
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    const dirtyLocales: string[] = LANGS.filter((loc) => dirty[loc] && forms[loc]);
    const submitLocales: string[] =
      isEdit || dirtyLocales.includes(primaryLang)
        ? dirtyLocales
        : [primaryLang, ...dirtyLocales];
    const orderedLocales = [
      primaryLang,
      ...submitLocales.filter((l) => l !== primaryLang),
    ].filter((l) => submitLocales.includes(l) || l === primaryLang);

    const plan: IssueSavePlanEntry[] = orderedLocales.map((loc) => {
      const f = forms[loc] ?? form;
      const existingId =
        loc === primaryLang ? item?.id : allVersions[loc]?.id;
      const values = toPayload(f, loc);
      if (!existingId && loc !== primaryLang) {
        values.translation_of = item?.id ?? translateFrom?.source.id;
        values.status = "draft";
      } else if (!existingId && isTranslation) {
        values.translation_of = translateFrom?.source.id;
      }
      return { existingId, values };
    });

    onSave(plan);
  };

  const inputClass =
    "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground outline-none placeholder:text-[var(--tott-muted)] focus:border-[var(--tott-accent-gold)]";
  const labelClass =
    "mb-1 block text-xs font-medium text-[var(--tott-dash-gold-label)]";

  const issueFieldSections = (
    <>
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
          {t("published.form.fields.subtitle")}
        </label>
        <input
          type="text"
          className={inputClass}
          value={form.subtitle}
          onChange={set("subtitle")}
          placeholder={t("published.form.fields.subtitlePlaceholder")}
        />
      </div>

      {!isEdit ? (
        <p className="text-xs" style={{ color: "var(--tott-muted)" }}>
          {magazineName
            ? t("published.form.publishingTo", { name: magazineName })
            : t("published.form.publishingToNew")}
        </p>
      ) : null}

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

      {form.kind === "crowdfunded" ? (
        <div className="grid grid-cols-2 gap-4 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] p-3">
          <div>
            <label className={labelClass}>
              {t("published.form.fields.fundingGoal")}
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className={inputClass}
              value={form.funding_goal}
              onChange={set("funding_goal")}
              placeholder="5000"
            />
          </div>
          <div>
            <label className={labelClass}>
              {t("published.form.fields.fundingDeadline")}
            </label>
            <input
              type="date"
              className={inputClass}
              value={form.funding_deadline}
              onChange={set("funding_deadline")}
            />
          </div>
        </div>
      ) : null}

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={form.is_premium}
          onChange={(e) =>
            updateForm((prev) => ({ ...prev, is_premium: e.target.checked }))
          }
          className="h-4 w-4 accent-[var(--tott-accent-gold)]"
        />
        {t("published.form.fields.isPremium")}
      </label>

      {/* Commerce — sell the issue as a digital product */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>{t("published.form.fields.price")}</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className={inputClass}
            value={form.price}
            onChange={set("price")}
            placeholder="0.00"
          />
        </div>
        <div>
          <label className={labelClass}>{t("published.form.fields.currency")}</label>
          <input
            type="text"
            className={inputClass}
            value={form.currency}
            onChange={set("currency")}
            placeholder="USD"
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>{t("published.form.fields.pdfPath")}</label>
        <input
          type="text"
          className={inputClass}
          value={form.pdf_path}
          onChange={set("pdf_path")}
          placeholder={t("published.form.fields.pdfPathPlaceholder")}
        />
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

      {isEdit && item ? (
        <>
          <IssueArticlesPanel issueId={item.id} magazineId={item.magazine_id ?? null} />
          <IssueContributorsPanel issueId={item.id} />
        </>
      ) : null}
    </>
  );

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        aria-label={t("published.form.close")}
        onClick={requestClose}
        className="absolute inset-0 backdrop-blur-md"
        style={{ backgroundColor: "var(--tott-overlay)" }}
      />
      <div className="relative mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-base font-bold text-foreground">
              {isEdit ? t("published.form.editTitle") : t("published.form.createTitle")}
              {translateFrom ? (
                <span className="ms-2 rounded-md bg-[var(--tott-elevated)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--tott-muted)] align-middle">
                  {translateFrom.language}
                </span>
              ) : null}
            </h2>
            {isEdit && !translateFrom ? (
              <LanguageFormTabs
                active={activeLang}
                onSelect={switchFormLanguage}
                status={tabStatus}
                disabled={busy}
              />
            ) : null}
          </div>
          <button
            type="button"
            onClick={requestClose}
            disabled={busy}
            className="shrink-0 rounded-lg p-1 text-[var(--tott-muted)] transition-colors hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground disabled:opacity-40"
            aria-label={t("published.form.close")}
          >
            <XIcon />
          </button>
        </div>

        {/* Clarify what this form produces — admins confused an issue with a
            single article vs a book. */}
        <p className="mb-4 text-xs leading-relaxed text-[var(--tott-muted)]">
          {t("published.form.description")}
        </p>

        <form ref={formRef} onSubmit={submit} className="space-y-4">
          {isWizard ? (
            <TranslationWizard
              locales={wizardLocales}
              step={wizardStep}
              localeLabel={(loc) => (tTr.has(`languages.${loc}`) ? tTr(`languages.${loc}`) : loc.toUpperCase())}
              onBack={() => goToWizardStep(Math.max(0, wizardStep - 1))}
              onSkip={() => goToWizardStep(Math.min(wizardLocales.length, wizardStep + 1))}
              onNext={() => goToWizardStep(Math.min(wizardLocales.length, wizardStep + 1))}
              onConfirm={() => formRef.current?.requestSubmit()}
              onStepClick={goToWizardStep}
              busy={busy}
              reviewLines={wizardReviewLines}
            >
              {issueFieldSections}
            </TranslationWizard>
          ) : (
            issueFieldSections
          )}

          {!isWizard ? (
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[var(--tott-card-border)] pt-4">
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={requestClose}
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
            </div>
          ) : null}
        </form>

        {confirmDiscard ? (
          <div
            data-testid="issue-discard-dialog"
            className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/40 p-4 backdrop-blur-sm"
          >
            <div className="w-full max-w-xs rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-5 shadow-2xl">
              <h3 className="text-sm font-bold text-foreground">
                {t("published.form.discardTitle")}
              </h3>
              <p className="mt-1.5 text-xs text-[var(--tott-muted)]">
                {t("published.form.discardBody")}
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  data-testid="issue-discard-keep"
                  onClick={() => setConfirmDiscard(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-[var(--tott-dash-ghost-hover)]"
                >
                  {t("published.form.discardCancel")}
                </button>
                <button
                  type="button"
                  data-testid="issue-discard-confirm"
                  onClick={onClose}
                  className="rounded-lg border px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-90"
                  style={{
                    borderColor: "color-mix(in srgb, var(--tott-status-coral) 60%, transparent)",
                    backgroundColor: "color-mix(in srgb, var(--tott-status-coral) 18%, transparent)",
                    color: "var(--tott-status-coral)",
                  }}
                >
                  {t("published.form.discardConfirm")}
                </button>
              </div>
            </div>
          </div>
        ) : null}
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
