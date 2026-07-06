"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { getBooks } from "@/services/books.service";
import { useLinkBookTranslation } from "@/hooks/mutations/books";
import { formatApiError } from "@/lib/api/error-message";

type Result = { id: string; title: string; language?: string | null };

/**
 * Links a book's translation group to an existing book — for legacy books
 * created before translation groups existed (each backfilled as a group of
 * one, so their language tabs have no sibling to switch to). Search, pick,
 * and the merge posts immediately.
 */
export function LinkBookTranslationPicker({
  bookId,
  excludeId,
  onLinked,
}: {
  bookId: string;
  /** The current tab's language, so results can't include it (only prior tabs matter). */
  excludeId?: string;
  onLinked: () => void;
}) {
  const t = useTranslations("Dashboard.books.form");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const linkMutation = useLinkBookTranslation();

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const list = await getBooks({ search: q, limit: 8 });
        setResults(list.filter((b) => b.id !== bookId && b.id !== excludeId));
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query, open, bookId, excludeId]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const inputClass =
    "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder-[var(--tott-muted)] outline-none focus:border-[var(--tott-accent-gold)]/60 transition-colors";

  const pick = async (target: Result) => {
    setError(null);
    try {
      await linkMutation.mutateAsync({ bookId, targetId: target.id });
      setQuery("");
      setOpen(false);
      onLinked();
    } catch (e) {
      setError(formatApiError(e, t("linkTranslation.linkFailed")));
    }
  };

  return (
    <div ref={boxRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={t("linkTranslation.searchPlaceholder")}
        disabled={linkMutation.isPending}
        className={inputClass}
      />
      {open && query.trim().length >= 2 ? (
        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] py-1 shadow-xl">
          {loading ? (
            <div className="px-3 py-2 text-xs text-[var(--tott-muted)]">{t("linkTranslation.searching")}</div>
          ) : results.length === 0 ? (
            <div className="px-3 py-2 text-xs text-[var(--tott-muted)]">{t("linkTranslation.none")}</div>
          ) : (
            results.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => void pick(r)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-[var(--tott-elevated-hover)]"
              >
                <span className="flex-1 truncate">{r.title}</span>
                {r.language ? (
                  <span className="shrink-0 text-[10px] uppercase tracking-wide text-[var(--tott-muted)]">
                    {r.language}
                  </span>
                ) : null}
              </button>
            ))
          )}
        </div>
      ) : null}
      <p className="mt-1 text-[10px] text-[var(--tott-muted)]">{t("linkTranslation.hint")}</p>
      {error ? <p className="mt-1 text-[10px] text-red-400">{error}</p> : null}
    </div>
  );
}
