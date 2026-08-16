"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useArticles } from "@/hooks/queries/articles";
import { useBooks } from "@/hooks/queries/books";
import { useMagazineIssues } from "@/hooks/queries/magazine-issues";
import { useTrackItems } from "@/hooks/queries/tracks";
import { useSetTrackItems } from "@/hooks/mutations/tracks";
import type { TrackEntityType } from "@/services/tracks.service";

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground outline-none placeholder:text-[var(--tott-muted)] focus:border-[var(--tott-accent-gold)]";

type ItemDraft = { entity_type: TrackEntityType; entity_id: string; title: string };

const ENTITY_TYPES: TrackEntityType[] = ["article", "book", "magazine_issue"];

/** Search results feeding the add-picker, keyed by which type toggle is active. */
function useSearchResults(entityType: TrackEntityType, search: string) {
  const trimmed = search.trim();
  const articleQuery = useArticles(
    entityType === "article" && trimmed ? { search: trimmed, limit: 8 } : undefined,
    { silent: true },
  );
  const bookQuery = useBooks(entityType === "book" && trimmed ? { search: trimmed, limit: 8 } : undefined);
  const issueQuery = useMagazineIssues(
    entityType === "magazine_issue" && trimmed ? { search: trimmed, limit: 8 } : undefined,
    { enabled: entityType === "magazine_issue" && Boolean(trimmed) },
  );

  if (entityType === "article") {
    return { isPending: articleQuery.isPending, results: articleQuery.data?.data ?? [] };
  }
  if (entityType === "book") {
    return { isPending: bookQuery.isPending, results: bookQuery.data ?? [] };
  }
  return { isPending: issueQuery.isPending, results: issueQuery.data ?? [] };
}

export function TrackItemsPanel({ trackId }: { trackId: string }) {
  const t = useTranslations("Dashboard.tracks.form.items");
  const { data: items = [], isPending } = useTrackItems(trackId);
  const setItems = useSetTrackItems(trackId);

  const [draft, setDraft] = useState<ItemDraft[] | null>(null);
  const list =
    draft ??
    items.map((i) => ({ entity_type: i.entity_type, entity_id: i.id, title: i.title ?? i.id }));

  useEffect(() => {
    queueMicrotask(() => setDraft(null));
  }, [items.length]);

  const [entityType, setEntityType] = useState<TrackEntityType>("article");
  const [search, setSearch] = useState("");
  const { isPending: searching, results } = useSearchResults(entityType, search);
  const listedIds = useMemo(
    () => new Set(list.filter((i) => i.entity_type === entityType).map((i) => i.entity_id)),
    [list, entityType],
  );
  const searchResults = results.filter((r: { id: string }) => !listedIds.has(r.id));

  function persist(next: ItemDraft[]) {
    setDraft(next);
    setItems.mutate(
      next.map((i, index) => ({
        entity_type: i.entity_type,
        entity_id: i.entity_id,
        position: index,
      })),
    );
  }

  function addItem(entity_id: string, title: string) {
    persist([...list, { entity_type: entityType, entity_id, title }]);
    setSearch("");
  }

  function removeItem(entity_type: TrackEntityType, entity_id: string) {
    persist(list.filter((i) => !(i.entity_type === entity_type && i.entity_id === entity_id)));
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= list.length) return;
    const next = [...list];
    [next[index], next[target]] = [next[target], next[index]];
    persist(next);
  }

  return (
    <div className="space-y-3 rounded-lg border border-[var(--tott-card-border)] p-3">
      <p className="text-xs font-medium text-[var(--tott-dash-gold-label)]">{t("label")}</p>
      <p className="text-[10px] text-[var(--tott-muted)]">{t("hint")}</p>

      {isPending ? (
        <p className="text-xs text-[var(--tott-muted)]">{t("loading")}</p>
      ) : list.length === 0 ? (
        <p className="text-xs text-[var(--tott-muted)]">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {list.map((item, index) => (
            <li
              key={`${item.entity_type}:${item.entity_id}`}
              className="flex items-center justify-between gap-2 rounded-lg border border-[var(--tott-card-border)] px-3 py-2"
            >
              <div className="min-w-0">
                <span className="me-2 inline-flex rounded-full border border-[var(--tott-card-border)] px-2 py-0.5 text-[10px] text-[var(--tott-muted)]">
                  {t(`type.${item.entity_type}`)}
                </span>
                <span className="truncate text-sm text-foreground">{item.title || item.entity_id}</span>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0 || setItems.isPending}
                  aria-label={t("moveUp")}
                  className="rounded-md border border-[var(--tott-card-border)] px-1.5 py-1 text-xs text-[var(--tott-muted)] hover:text-foreground disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === list.length - 1 || setItems.isPending}
                  aria-label={t("moveDown")}
                  className="rounded-md border border-[var(--tott-card-border)] px-1.5 py-1 text-xs text-[var(--tott-muted)] hover:text-foreground disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.entity_type, item.entity_id)}
                  disabled={setItems.isPending}
                  className="ms-1 text-xs text-[var(--tott-gold)] hover:underline disabled:opacity-40"
                >
                  {t("remove")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-[var(--tott-card-border)] pt-3">
        <div className="mb-2 flex gap-1.5">
          {ENTITY_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setEntityType(type);
                setSearch("");
              }}
              className={`rounded-full border px-2.5 py-1 text-[11px] ${
                entityType === type
                  ? "border-[var(--tott-accent-gold)] text-[var(--tott-accent-gold)]"
                  : "border-[var(--tott-card-border)] text-[var(--tott-muted)]"
              }`}
            >
              {t(`type.${type}`)}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className={inputClass}
        />
        {search.trim() ? (
          <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-[var(--tott-card-border)]">
            {searching ? (
              <p className="px-3 py-2 text-xs text-[var(--tott-muted)]">{t("searching")}</p>
            ) : searchResults.length === 0 ? (
              <p className="px-3 py-2 text-xs text-[var(--tott-muted)]">{t("noResults")}</p>
            ) : (
              searchResults.map((r: { id: string; title: string }) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => addItem(r.id, r.title)}
                  disabled={setItems.isPending}
                  className="flex w-full items-center justify-between gap-2 border-b border-[var(--tott-card-border)] px-3 py-2 text-start text-sm text-foreground last:border-b-0 hover:bg-[var(--tott-elevated)] disabled:opacity-40"
                >
                  <span className="min-w-0 truncate">{r.title}</span>
                  <span className="shrink-0 text-xs text-[var(--tott-gold)]">{t("add")}</span>
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
