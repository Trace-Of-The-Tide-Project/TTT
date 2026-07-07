"use client";

import { useEffect, useRef, useState } from "react";
import { getArticles, getArticleById } from "@/services/articles.service";

type Result = { id: string; title: string; language?: string };

export type TranslationOfPickerLabels = {
  label: string;
  placeholder: string;
  hint: string;
  clear: string;
  none: string;
  searching: string;
};

/**
 * Links the current article as a translation of an existing one. Searching the
 * articles list and picking a result sets `translation_of` on save, which makes
 * the public reader's "Also available in …" language toggle surface this
 * version. The selected article's title is resolved on mount so edit-mode (which
 * seeds only the id) still shows a readable label.
 */
export function TranslationOfPicker({
  value,
  excludeId,
  onChange,
  labels,
}: {
  value?: string;
  /** The current article's own id, so it can't translate itself. */
  excludeId?: string;
  onChange: (id: string | undefined, title?: string | null) => void;
  labels: TranslationOfPickerLabels;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  // Resolve the linked article's title for display (edit mode seeds only the id).
  useEffect(() => {
    let alive = true;
    if (!value) {
      setSelectedTitle(null);
      return;
    }
    getArticleById(value)
      .then((a) => {
        if (alive) setSelectedTitle(a?.title ?? null);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [value]);

  // Debounced search. Falls back to the recent list when the backend ignores
  // `search`, so the picker is still usable either way.
  useEffect(() => {
    if (!open || value) return;
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const res = await getArticles({ search: q, limit: 8 });
        const list = (res.data as Result[]).filter((a) => a.id !== excludeId);
        setResults(list);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query, open, excludeId, value]);

  // Close the dropdown on outside click.
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
    "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder-[var(--tott-muted)] outline-none focus:border-[var(--tott-gold)]/60 transition-colors";

  if (value) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2">
        <span className="flex-1 truncate text-sm text-foreground">
          {selectedTitle ?? "…"}
        </span>
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="shrink-0 text-xs text-[var(--tott-muted)] transition-colors hover:text-foreground"
        >
          {labels.clear}
        </button>
      </div>
    );
  }

  return (
    <div ref={boxRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={labels.placeholder}
        className={inputClass}
      />
      {open && query.trim().length >= 2 ? (
        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] py-1 shadow-xl">
          {loading ? (
            <div className="px-3 py-2 text-xs text-[var(--tott-muted)]">
              {labels.searching}
            </div>
          ) : results.length === 0 ? (
            <div className="px-3 py-2 text-xs text-[var(--tott-muted)]">
              {labels.none}
            </div>
          ) : (
            results.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  onChange(r.id, r.title);
                  setQuery("");
                  setOpen(false);
                }}
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
      <p className="mt-1 text-[10px] text-[var(--tott-muted)]">{labels.hint}</p>
    </div>
  );
}
