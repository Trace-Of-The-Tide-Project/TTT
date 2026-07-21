"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useIssueSections } from "@/hooks/queries/issue-sections";
import {
  useCreateIssueSection,
  useRemoveIssueSection,
  useReorderIssueSections,
  useUpdateIssueSection,
} from "@/hooks/mutations/issue-sections";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { IssueSectionLayout } from "@/services/magazine-issues.service";

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground outline-none placeholder:text-[var(--tott-muted)] focus:border-[var(--tott-accent-gold)]";

const LAYOUTS: IssueSectionLayout[] = ["list", "grid", "feature"];

/** Manage an issue's departments/sections: create, reorder, hide, and pick a layout. */
export function IssueSectionsPanel({ issueId }: { issueId: string }) {
  const t = useTranslations("Dashboard.magazineIssues.sections");
  const { data: sections = [], isPending } = useIssueSections(issueId);
  const create = useCreateIssueSection(issueId);
  const update = useUpdateIssueSection(issueId);
  const remove = useRemoveIssueSection(issueId);
  const reorder = useReorderIssueSections(issueId);

  const [title, setTitle] = useState("");

  const [localOrder, setLocalOrder] = useState<string[] | null>(null);
  const orderedIds = localOrder ?? sections.map((s) => s.id);
  const byId = useMemo(() => new Map(sections.map((s) => [s.id, s])), [sections]);

  function move(index: number, delta: number) {
    const next = [...orderedIds];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setLocalOrder(next);
    reorder.mutate(next, { onSettled: () => setLocalOrder(null) });
  }

  function handleCreate() {
    const trimmed = title.trim();
    if (!trimmed) return;
    create.mutate({ title: trimmed }, { onSuccess: () => setTitle("") });
  }

  const layoutOptions = LAYOUTS.map((id) => ({ id, label: t(`layout.${id}`) }));

  return (
    <div className="space-y-3 rounded-lg border border-[var(--tott-card-border)] p-3">
      <p className="text-xs font-medium text-[var(--tott-dash-gold-label)]">{t("label")}</p>

      {isPending ? (
        <p className="text-xs text-[var(--tott-muted)]">{t("loading")}</p>
      ) : orderedIds.length === 0 ? (
        <p className="text-xs text-[var(--tott-muted)]">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {orderedIds.map((id, index) => {
            const section = byId.get(id);
            if (!section) return null;
            const isVisible = section.is_visible !== false;
            const layout = (section.layout ?? "list") as IssueSectionLayout;
            return (
              <li
                key={id}
                className="flex flex-col gap-2 rounded-lg border border-[var(--tott-card-border)] px-3 py-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-sm text-foreground">
                    {section.title}
                  </span>
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
                      onClick={() => update.mutate({ sectionId: id, is_visible: !isVisible })}
                      disabled={update.isPending}
                      className="ms-1 rounded-md border border-[var(--tott-card-border)] px-2 py-1 text-xs text-[var(--tott-muted)] hover:text-foreground disabled:opacity-40"
                    >
                      {isVisible ? t("visible") : t("hidden")}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove.mutate(id)}
                      disabled={remove.isPending}
                      className="text-xs text-[var(--tott-gold)] hover:underline disabled:opacity-40"
                    >
                      {t("remove")}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-xs text-[var(--tott-muted)]">
                    {t("layout.label")}
                  </span>
                  <SegmentedControl
                    options={layoutOptions}
                    value={layout}
                    onChange={(next) => update.mutate({ sectionId: id, layout: next })}
                    ariaLabel={t("layout.label")}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex gap-2 border-t border-[var(--tott-card-border)] pt-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleCreate();
            }
          }}
          placeholder={t("namePlaceholder")}
          className={inputClass}
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={create.isPending || !title.trim()}
          className="shrink-0 rounded-md border border-[var(--tott-card-border)] px-3 py-2 text-xs text-[var(--tott-gold)] hover:bg-[var(--tott-elevated)] disabled:opacity-40"
        >
          {create.isPending ? t("adding") : t("add")}
        </button>
      </div>
    </div>
  );
}
