"use client";

import { useCallback, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PlusIcon, TrashIcon, PenLineIcon } from "@/components/ui/icons";
import { useBooks } from "@/hooks/queries/books";
import { useDeleteBook } from "@/hooks/mutations/books";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";
import { ChamferedCap } from "@/components/ui/ChamferedCap";
import type { Book } from "@/services/books.service";

const ROWS_PER_PAGE = 10;

export function AdminBooksPageContent() {
  const t = useTranslations("Dashboard.books.list");

  const booksQuery = useBooks();
  const books: Book[] = useMemo(() => booksQuery.data ?? [], [booksQuery.data]);
  const loading = booksQuery.isPending;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const deleteMutation = useDeleteBook();
  const deleteBusy = deleteMutation.isPending;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.author ?? "").toLowerCase().includes(q),
    );
  }, [books, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice(
    (safePage - 1) * ROWS_PER_PAGE,
    safePage * ROWS_PER_PAGE,
  );

  const [prevSearch, setPrevSearch] = useState(search);
  if (prevSearch !== search) {
    setPrevSearch(search);
    setPage(1);
  }

  const openDelete = useCallback((book: Book) => {
    setDeleteError(null);
    setDeleteTarget(book);
  }, []);

  const closeDelete = useCallback(() => {
    if (deleteBusy) return;
    setDeleteTarget(null);
    setDeleteError(null);
  }, [deleteBusy]);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
      onError: () => setDeleteError(t("errors.deleteFailed")),
    });
  }, [deleteTarget, deleteMutation, t]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">{t("pageTitle")}</h1>
          <p className="text-xs text-gray-500">{t("pageSubtitle")}</p>
        </div>
        <Link
          href="/admin/books/create"
          className="flex items-center gap-1.5 rounded-lg border border-[var(--tott-gold)]/60 bg-[var(--tott-gold)]/10 px-3 py-1.5 text-xs font-medium text-[var(--tott-gold)] hover:bg-[var(--tott-gold)]/20 transition-colors"
        >
          <PlusIcon />
          {t("addNew")}
        </Link>
      </div>

      <div className="mb-3">
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder-gray-500 outline-none focus:border-gray-500"
        />
      </div>

      <ChamferedPanel>
        <ChamferedCap direction="top" />
        <div className="grid grid-cols-[32%_22%_14%_14%_18%] px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--tott-dash-gold-label)]">
          <span>{t("headers.title")}</span>
          <span>{t("headers.author")}</span>
          <span>{t("headers.language")}</span>
          <span>{t("headers.price")}</span>
          <span className="text-right">{t("headers.actions")}</span>
        </div>

        {loading && (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            {t("loading")}
          </div>
        )}
        {!loading && pageRows.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-gray-500">
            {search ? t("empty.noMatch") : t("empty.none")}
          </div>
        )}
        {!loading &&
          pageRows.map((book) => (
            <div
              key={book.id}
              className="grid grid-cols-[32%_22%_14%_14%_18%] items-center border-t border-[var(--tott-card-border)] px-4 py-3 text-sm hover:bg-[var(--tott-elevated)]"
            >
              <span className="truncate font-medium">{book.title}</span>
              <span className="truncate text-gray-400">{book.author ?? "—"}</span>
              <span className="text-gray-400">{book.language ?? "—"}</span>
              <span className="text-gray-400">
                {book.price == null
                  ? t("price.free")
                  : `${book.currency ?? "USD"} ${book.price}`}
              </span>
              <div className="flex justify-end gap-2">
                <Link
                  href={`/admin/books/${book.id}/edit`}
                  className="rounded p-1 text-gray-400 hover:text-foreground"
                  title="Edit"
                >
                  <PenLineIcon />
                </Link>
                <button
                  onClick={() => openDelete(book)}
                  className="rounded p-1 text-gray-400 hover:text-red-400"
                  title="Delete"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        <ChamferedCap direction="bottom" />
      </ChamferedPanel>

      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-end gap-2 text-xs text-gray-400">
          <button
            disabled={safePage <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="disabled:opacity-40"
          >
            ← Prev
          </button>
          <span>
            {safePage} / {totalPages}
          </span>
          <button
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-sm rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-bg)] p-6 shadow-xl">
            <h2 className="mb-2 text-base font-semibold">{t("delete.title")}</h2>
            <p className="mb-4 text-sm text-gray-400">
              {t("delete.description", { title: deleteTarget.title })}
            </p>
            {deleteError && (
              <p className="mb-3 text-xs text-red-400">{deleteError}</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDelete}
                disabled={deleteBusy}
                className="rounded-lg px-4 py-1.5 text-sm text-gray-400 hover:text-foreground disabled:opacity-40"
              >
                {t("delete.cancel")}
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteBusy}
                className="rounded-lg bg-red-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40"
              >
                {deleteBusy ? t("delete.confirmBusy") : t("delete.confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
