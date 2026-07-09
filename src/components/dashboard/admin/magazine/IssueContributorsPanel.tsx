"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { nameInitials } from "@/components/dashboard/admin/writers/initials";
import {
  WriterPicker,
  writerDisplayName,
} from "@/components/dashboard/admin/writers/WriterPicker";
import type { WriterProfile } from "@/services/writers.service";
import type { ContributorRole } from "@/services/article-contributors.service";
import {
  useAddIssueContributor,
  useIssueContributors,
  useRemoveIssueContributor,
  useReorderIssueContributors,
} from "@/hooks/queries/issue-contributors";

const ROLES: ContributorRole[] = [
  "editor",
  "co-author",
  "reviewer",
  "contributor",
  "main_contributor",
];

const FIELD_BASE =
  "w-full rounded-[7.5px] border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-[var(--tott-card-border)]";

/**
 * Admin sub-panel: credit writers as editors/contributors on an issue, with a
 * role and manual up/down ordering. Clone of the article ContributorsPanel plus
 * the IssueArticlesPanel reorder controls.
 */
export function IssueContributorsPanel({ issueId }: { issueId: string }) {
  const t = useTranslations("Dashboard.magazineIssues.contributors");
  const { data: contributors = [], isPending } = useIssueContributors(issueId);
  const addMutation = useAddIssueContributor(issueId);
  const removeMutation = useRemoveIssueContributor(issueId);
  const reorder = useReorderIssueContributors(issueId);

  const [pickedWriter, setPickedWriter] = useState<WriterProfile | null>(null);
  const [role, setRole] = useState<ContributorRole>("editor");
  const [error, setError] = useState<string | null>(null);

  const [localOrder, setLocalOrder] = useState<string[] | null>(null);
  const orderedIds = localOrder ?? contributors.map((c) => c.id);
  const byId = useMemo(
    () => new Map(contributors.map((c) => [c.id, c])),
    [contributors],
  );

  function move(index: number, delta: number) {
    const next = [...orderedIds];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setLocalOrder(next);
    reorder.mutate(next, { onSettled: () => setLocalOrder(null) });
  }

  async function handleAdd() {
    if (!pickedWriter) return;
    setError(null);
    try {
      await addMutation.mutateAsync({ writer_id: pickedWriter.id, role });
      setPickedWriter(null);
      setRole("editor");
    } catch {
      setError(t("addFailed"));
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-[var(--tott-card-border)] p-3">
      <p className="text-xs font-medium text-[var(--tott-dash-gold-label)]">
        {t("label")}
      </p>

      {isPending ? (
        <p className="text-xs text-[var(--tott-muted)]">{t("loading")}</p>
      ) : orderedIds.length === 0 ? (
        <p className="text-xs text-[var(--tott-muted)]">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {orderedIds.map((id, index) => {
            const c = byId.get(id);
            if (!c) return null;
            const name = c.writer ? writerDisplayName(c.writer) : t("unknownWriter");
            return (
              <li
                key={id}
                className="flex items-center justify-between gap-3 rounded-lg border border-[var(--tott-card-border)] px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--tott-elevated)] text-xs font-semibold text-[var(--tott-gold)]">
                    {nameInitials(name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {name}
                    </p>
                    <p className="truncate text-xs text-[var(--tott-muted)]">
                      {t.has(`roles.${c.role}`) ? t(`roles.${c.role}`) : c.role}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0 || reorder.isPending}
                    aria-label={t("moveUp")}
                    className="rounded-md border border-[var(--tott-card-border)] px-1.5 py-1 text-xs text-[var(--tott-muted)] hover:text-foreground disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === orderedIds.length - 1 || reorder.isPending}
                    aria-label={t("moveDown")}
                    className="rounded-md border border-[var(--tott-card-border)] px-1.5 py-1 text-xs text-[var(--tott-muted)] hover:text-foreground disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => removeMutation.mutate(c.id)}
                    disabled={removeMutation.isPending}
                    className="ms-1 text-xs text-[var(--tott-gold)] hover:underline disabled:opacity-40"
                  >
                    {t("remove")}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-col gap-2 border-t border-[var(--tott-card-border)] pt-3">
        <WriterPicker
          value={pickedWriter}
          onChange={setPickedWriter}
          disabled={addMutation.isPending}
        />
        {pickedWriter ? (
          <div className="flex items-center gap-2">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as ContributorRole)}
              className={FIELD_BASE}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {t.has(`roles.${r}`) ? t(`roles.${r}`) : r}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAdd}
              disabled={addMutation.isPending}
              className="shrink-0 rounded-[7.5px] border border-[var(--tott-card-border)] px-3 py-2.5 text-sm text-foreground transition-colors hover:border-[var(--tott-accent-gold)]/50 disabled:opacity-40"
            >
              {addMutation.isPending ? t("adding") : t("add")}
            </button>
          </div>
        ) : null}
        {error ? <p className="text-xs text-red-300">{error}</p> : null}
      </div>
    </div>
  );
}
