"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useBook } from "@/hooks/queries/books";
import { useCreateBook, useUpdateBook } from "@/hooks/mutations/books";
import { uploadFileToUrl } from "@/services/uploads.service";
import type { BookPayload } from "@/services/books.service";

type Props = { bookId?: string };

type FormState = {
  title: string;
  author: string;
  co_authors: string;
  publisher: string;
  published_date: string;
  year: string;
  summary: string;
  cover_image: string;
  pdf_url: string;
  genre: string;
  language: "" | "en" | "ar" | "es" | "fr" | "de";
  page_count: string;
  price: string;
  currency: string;
  magazine_id: string;
};

const EMPTY: FormState = {
  title: "",
  author: "",
  co_authors: "",
  publisher: "",
  published_date: "",
  year: "",
  summary: "",
  cover_image: "",
  pdf_url: "",
  genre: "",
  language: "",
  page_count: "",
  price: "",
  currency: "USD",
  magazine_id: "",
};

export function BookFormContent({ bookId }: Props) {
  const t = useTranslations("Dashboard.books.form");
  const router = useRouter();
  const isEdit = Boolean(bookId);

  const bookQuery = useBook(bookId);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [seeded, setSeeded] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);

  const createMutation = useCreateBook();
  const updateMutation = useUpdateBook();
  const busy =
    createMutation.isPending ||
    updateMutation.isPending ||
    coverUploading ||
    pdfUploading;

  useEffect(() => {
    if (seeded || !bookQuery.data) return;
    const b = bookQuery.data;
    setForm({
      title: b.title ?? "",
      author: b.author ?? "",
      co_authors: b.co_authors ?? "",
      publisher: b.publisher ?? "",
      published_date: b.published_date ? b.published_date.slice(0, 10) : "",
      year: b.year != null ? String(b.year) : "",
      summary: b.summary ?? "",
      cover_image: b.cover_image ?? "",
      pdf_url: b.pdf_url ?? "",
      genre: b.genre ?? "",
      language: (b.language ?? "") as FormState["language"],
      page_count: b.page_count != null ? String(b.page_count) : "",
      price: b.price != null ? String(b.price) : "",
      currency: b.currency ?? "USD",
      magazine_id: b.magazine_id ?? "",
    });
    setSeeded(true);
  }, [bookQuery.data, seeded]);

  const set = useCallback(
    (field: keyof FormState) =>
      (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
      ) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value })),
    [],
  );

  const handleCoverUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setCoverUploading(true);
      try {
        const url = await uploadFileToUrl(file);
        setForm((prev) => ({ ...prev, cover_image: url }));
      } finally {
        setCoverUploading(false);
      }
    },
    [],
  );

  const handlePdfUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setPdfUploading(true);
      try {
        const url = await uploadFileToUrl(file);
        setForm((prev) => ({ ...prev, pdf_url: url }));
      } finally {
        setPdfUploading(false);
      }
    },
    [],
  );

  const buildPayload = (): BookPayload => ({
    title: form.title,
    author: form.author || null,
    co_authors: form.co_authors || null,
    publisher: form.publisher || null,
    published_date: form.published_date || null,
    year: form.year ? parseInt(form.year, 10) : null,
    summary: form.summary || null,
    cover_image: form.cover_image || null,
    pdf_url: form.pdf_url || null,
    genre: form.genre || null,
    language: (form.language || null) as BookPayload["language"],
    page_count: form.page_count ? parseInt(form.page_count, 10) : null,
    price: form.price ? parseFloat(form.price) : null,
    currency: form.currency || null,
    magazine_id: form.magazine_id || null,
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setFieldError(null);
      setSubmitError(null);
      if (!form.title.trim()) {
        setFieldError(t("errors.titleRequired"));
        return;
      }
      const payload = buildPayload();
      if (isEdit && bookId) {
        updateMutation.mutate(
          { bookId, payload },
          {
            onSuccess: () => router.push("/admin/books"),
            onError: () => setSubmitError(t("errors.saveFailed")),
          },
        );
      } else {
        createMutation.mutate(payload, {
          onSuccess: () => router.push("/admin/books"),
          onError: () => setSubmitError(t("errors.saveFailed")),
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [form, isEdit, bookId, createMutation, updateMutation, router, t],
  );

  const inputClass =
    "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder-gray-500 outline-none focus:border-gray-500";
  const labelClass = "text-xs font-medium text-[var(--tott-dash-gold-label)] mb-1 block";

  if (isEdit && bookQuery.isPending) {
    return (
      <div className="my-4 mx-10 text-sm text-gray-500">Loading book…</div>
    );
  }

  return (
    <div className="my-4 mx-10">
      <div className="mb-4 flex items-center gap-2">
        <Link
          href="/admin/books"
          className="text-xs text-gray-400 hover:text-foreground"
        >
          ← {t("backToList")}
        </Link>
      </div>
      <h1 className="mb-6 text-lg font-semibold">
        {isEdit ? t("editTitle") : t("createTitle")}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label className={labelClass}>{t("fields.title")} *</label>
          <input
            type="text"
            className={inputClass}
            placeholder={t("fields.titlePlaceholder")}
            value={form.title}
            onChange={set("title")}
          />
          {fieldError && (
            <p className="mt-1 text-xs text-red-400">{fieldError}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t("fields.author")}</label>
            <input
              type="text"
              className={inputClass}
              placeholder={t("fields.authorPlaceholder")}
              value={form.author}
              onChange={set("author")}
            />
          </div>
          <div>
            <label className={labelClass}>{t("fields.co_authors")}</label>
            <input
              type="text"
              className={inputClass}
              placeholder={t("fields.co_authorsPlaceholder")}
              value={form.co_authors}
              onChange={set("co_authors")}
            />
          </div>
          <div>
            <label className={labelClass}>{t("fields.publisher")}</label>
            <input
              type="text"
              className={inputClass}
              placeholder={t("fields.publisherPlaceholder")}
              value={form.publisher}
              onChange={set("publisher")}
            />
          </div>
          <div>
            <label className={labelClass}>{t("fields.genre")}</label>
            <input
              type="text"
              className={inputClass}
              placeholder={t("fields.genrePlaceholder")}
              value={form.genre}
              onChange={set("genre")}
            />
          </div>
          <div>
            <label className={labelClass}>{t("fields.published_date")}</label>
            <input
              type="date"
              className={inputClass}
              value={form.published_date}
              onChange={set("published_date")}
            />
          </div>
          <div>
            <label className={labelClass}>{t("fields.year")}</label>
            <input
              type="number"
              className={inputClass}
              placeholder={t("fields.yearPlaceholder")}
              value={form.year}
              onChange={set("year")}
            />
          </div>
          <div>
            <label className={labelClass}>{t("fields.language")}</label>
            <select
              className={inputClass}
              value={form.language}
              onChange={set("language")}
            >
              <option value="">—</option>
              {(["en", "ar", "es", "fr", "de"] as const).map((l) => (
                <option key={l} value={l}>
                  {t(`languages.${l}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>{t("fields.page_count")}</label>
            <input
              type="number"
              className={inputClass}
              placeholder={t("fields.page_countPlaceholder")}
              value={form.page_count}
              onChange={set("page_count")}
            />
          </div>
          <div>
            <label className={labelClass}>{t("fields.price")}</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className={inputClass}
              placeholder={t("fields.pricePlaceholder")}
              value={form.price}
              onChange={set("price")}
            />
          </div>
          <div>
            <label className={labelClass}>{t("fields.currency")}</label>
            <input
              type="text"
              className={inputClass}
              placeholder={t("fields.currencyPlaceholder")}
              value={form.currency}
              onChange={set("currency")}
            />
          </div>
          <div>
            <label className={labelClass}>{t("fields.magazine_id")}</label>
            <input
              type="text"
              className={inputClass}
              placeholder={t("fields.magazine_idPlaceholder")}
              value={form.magazine_id}
              onChange={set("magazine_id")}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>{t("fields.summary")}</label>
          <textarea
            rows={4}
            className={inputClass}
            placeholder={t("fields.summaryPlaceholder")}
            value={form.summary}
            onChange={set("summary")}
          />
        </div>

        <div>
          <label className={labelClass}>{t("fields.cover_image")}</label>
          <input
            type="text"
            className={inputClass}
            placeholder={t("fields.cover_imagePlaceholder")}
            value={form.cover_image}
            onChange={set("cover_image")}
          />
          <div className="mt-2">
            <label className="cursor-pointer text-xs text-[var(--tott-gold)] hover:underline">
              {coverUploading
                ? t("upload.coverUploading")
                : t("upload.coverUpload")}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverUpload}
                disabled={coverUploading}
              />
            </label>
          </div>
          {form.cover_image && (
            <img
              src={form.cover_image}
              alt="Cover preview"
              className="mt-2 h-24 w-auto rounded-lg object-cover"
            />
          )}
        </div>

        <div>
          <label className={labelClass}>{t("fields.pdf_url")}</label>
          <input
            type="text"
            className={inputClass}
            placeholder={t("fields.pdf_urlPlaceholder")}
            value={form.pdf_url}
            onChange={set("pdf_url")}
          />
          <div className="mt-2">
            <label className="cursor-pointer text-xs text-[var(--tott-gold)] hover:underline">
              {pdfUploading
                ? t("upload.pdfUploading")
                : t("upload.pdfUpload")}
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handlePdfUpload}
                disabled={pdfUploading}
              />
            </label>
          </div>
          {form.pdf_url && !pdfUploading && (
            <p className="mt-1 text-xs text-green-400">
              {t("upload.pdfUploaded")}
            </p>
          )}
        </div>

        {submitError && (
          <p className="text-xs text-red-400">{submitError}</p>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-[var(--tott-gold)] px-5 py-2 text-sm font-medium text-black hover:opacity-90 disabled:opacity-40"
          >
            {busy
              ? isEdit
                ? t("saving")
                : t("creating")
              : isEdit
                ? t("save")
                : t("create")}
          </button>
          <Link
            href="/admin/books"
            className="text-sm text-gray-400 hover:text-foreground"
          >
            {t("cancel")}
          </Link>
        </div>
      </form>
    </div>
  );
}
