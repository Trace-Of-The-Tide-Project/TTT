"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { useArticles } from "@/hooks/queries/articles";
import { useBookChapters } from "@/hooks/queries/book-chapters";
import { useSetBookChapters, useScheduleBookChapters } from "@/hooks/mutations/book-chapters";
import { mutationToast } from "@/hooks/useMutationToast";

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground outline-none placeholder:text-[var(--tott-muted)] focus:border-[var(--tott-accent-gold)]";

type ChapterDraft = { article_id: string; title: string };

/** Each chapter is a readable article, ordered here and released on schedule
 *  (see scheduleChapters on the backend, which delegates to the existing
 *  article scheduler/cron — there is no separate chapter publishing path).
 *  The book's own uploaded PDF, if any, is the optional collected edition. */
export function BookChaptersPanel({ bookId }: { bookId: string }) {
  const t = useTranslations("Dashboard.books.form.chapters");
  const format = useFormatter();
  const { data: chapters = [], isPending } = useBookChapters(bookId);
  const setChapters = useSetBookChapters(bookId);
  const scheduleChapters = useScheduleBookChapters(bookId);

  const [draft, setDraft] = useState<ChapterDraft[] | null>(null);
  const list = draft ?? chapters.map((c) => ({ article_id: c.article_id, title: c.article?.title ?? "" }));

  // Release state comes from the linked article, not the chapter row — a
  // chapter IS an article; scheduling writes article.scheduled_at.
  const releaseByArticleId = useMemo(
    () => new Map(chapters.map((c) => [c.article_id, c.article])),
    [chapters],
  );

  // The schedule lives on each article independently, so chapter_order and
  // scheduled_at/published_at can drift apart (e.g. an article edited
  // elsewhere). Warn rather than silently show a confusing release sequence.
  const orderWarning = useMemo(() => {
    let lastDate: number | null = null;
    for (const c of chapters) {
      const raw = c.article?.published_at ?? c.article?.scheduled_at;
      if (!raw) continue;
      const t = new Date(raw).getTime();
      if (isNaN(t)) continue;
      if (lastDate != null && t < lastDate) return true;
      lastDate = t;
    }
    return false;
  }, [chapters]);

  const [scheduleStart, setScheduleStart] = useState("");
  const [scheduleInterval, setScheduleInterval] = useState("7");

  function submitSchedule() {
    if (!scheduleStart) return;
    const startAt = new Date(scheduleStart).toISOString();
    const intervalDays = Number(scheduleInterval) || 0;
    void mutationToast(
      () => scheduleChapters.mutateAsync({ startAt, intervalDays }),
      {
        loading: t("scheduling"),
        success: t("scheduled"),
        error: t("scheduleFailed"),
      },
    );
  }

  // Reset local draft whenever the server list changes underneath us.
  useEffect(() => {
    queueMicrotask(() => setDraft(null));
  }, [chapters.length]);

  const [search, setSearch] = useState("");
  const searchQuery = useArticles(
    search.trim() ? { search: search.trim(), limit: 8 } : undefined,
    { silent: true },
  );
  const listedIds = useMemo(() => new Set(list.map((c) => c.article_id)), [list]);
  const searchResults = (searchQuery.data?.data ?? []).filter((a) => !listedIds.has(a.id));

  function persist(next: ChapterDraft[]) {
    setDraft(next);
    setChapters.mutate(next.map((c) => ({ article_id: c.article_id, chapter_title: null })));
  }

  function addArticle(articleId: string, title: string) {
    persist([...list, { article_id: articleId, title }]);
    setSearch("");
  }

  function removeArticle(articleId: string) {
    persist(list.filter((c) => c.article_id !== articleId));
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

      {orderWarning ? (
        <p className="rounded-md border border-[var(--tott-status-amber)] bg-[color-mix(in_srgb,var(--tott-status-amber)_12%,transparent)] px-3 py-2 text-xs text-[var(--tott-status-amber)]">
          {t("orderWarning")}
        </p>
      ) : null}

      {isPending ? (
        <p className="text-xs text-[var(--tott-muted)]">{t("loading")}</p>
      ) : list.length === 0 ? (
        <p className="text-xs text-[var(--tott-muted)]">{t("empty")}</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {list.map((c, index) => {
            const release = releaseByArticleId.get(c.article_id);
            const statusLabel =
              release?.status === "published"
                ? t("statusPublished")
                : release?.scheduled_at
                  ? t("statusScheduled", {
                      date: format.dateTime(new Date(release.scheduled_at), { dateStyle: "medium" }),
                    })
                  : t("statusUnscheduled");
            return (
            <li
              key={c.article_id}
              className="flex items-center justify-between gap-2 rounded-lg border border-[var(--tott-card-border)] px-3 py-2"
            >
              <div className="min-w-0">
                <span className="block truncate text-sm text-foreground">{c.title || c.article_id}</span>
                <span className="block text-[10px] text-[var(--tott-muted)]">{statusLabel}</span>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0 || setChapters.isPending}
                  aria-label={t("moveUp")}
                  className="rounded-md border border-[var(--tott-card-border)] px-1.5 py-1 text-xs text-[var(--tott-muted)] hover:text-foreground disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === list.length - 1 || setChapters.isPending}
                  aria-label={t("moveDown")}
                  className="rounded-md border border-[var(--tott-card-border)] px-1.5 py-1 text-xs text-[var(--tott-muted)] hover:text-foreground disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeArticle(c.article_id)}
                  disabled={setChapters.isPending}
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

      {list.length > 0 ? (
        <div className="space-y-2 border-t border-[var(--tott-card-border)] pt-3">
          <p className="text-xs font-medium text-[var(--tott-dash-gold-label)]">{t("scheduleLabel")}</p>
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1 text-[10px] text-[var(--tott-muted)]">
              {t("startDate")}
              <input
                type="date"
                value={scheduleStart}
                onChange={(e) => setScheduleStart(e.target.value)}
                className={`${inputClass} w-auto`}
              />
            </label>
            <label className="flex flex-col gap-1 text-[10px] text-[var(--tott-muted)]">
              {t("intervalDays")}
              <input
                type="number"
                min={0}
                value={scheduleInterval}
                onChange={(e) => setScheduleInterval(e.target.value)}
                className={`${inputClass} w-20`}
              />
            </label>
            <button
              type="button"
              onClick={submitSchedule}
              disabled={!scheduleStart || scheduleChapters.isPending}
              className="rounded-lg border border-[var(--tott-accent-gold)] px-3 py-2 text-xs font-medium text-[var(--tott-accent-gold)] hover:bg-[color-mix(in_srgb,var(--tott-accent-gold)_10%,transparent)] disabled:opacity-40"
            >
              {t("scheduleAction")}
            </button>
          </div>
        </div>
      ) : null}

      <div className="border-t border-[var(--tott-card-border)] pt-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className={inputClass}
        />
        {search.trim() ? (
          <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-[var(--tott-card-border)]">
            {searchQuery.isPending ? (
              <p className="px-3 py-2 text-xs text-[var(--tott-muted)]">{t("searching")}</p>
            ) : searchResults.length === 0 ? (
              <p className="px-3 py-2 text-xs text-[var(--tott-muted)]">{t("noResults")}</p>
            ) : (
              searchResults.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => addArticle(a.id, a.title)}
                  disabled={setChapters.isPending}
                  className="flex w-full items-center justify-between gap-2 border-b border-[var(--tott-card-border)] px-3 py-2 text-start text-sm text-foreground last:border-b-0 hover:bg-[var(--tott-elevated)] disabled:opacity-40"
                >
                  <span className="min-w-0 truncate">{a.title}</span>
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
