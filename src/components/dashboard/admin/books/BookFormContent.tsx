"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { useAuthUser } from "@/components/providers/AuthProvider";
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

/** Drag-and-drop + click-to-upload zone for cover images */
function CoverUploadZone({
  value,
  uploading,
  onChange,
}: {
  value: string;
  uploading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const id = useId();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const dragProps = {
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setDragging(true); },
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
        <img
          src={value}
          alt="Cover preview"
          className="h-36 w-24 rounded-lg object-cover border border-[var(--tott-card-border)] shadow-md"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <label
          htmlFor={id}
          className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-xs font-medium text-white text-center px-2"
        >
          Change
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
        "mt-1 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-colors min-h-[120px]",
        dragging
          ? "border-[var(--tott-gold)] bg-[var(--tott-gold)]/5"
          : "border-[var(--tott-card-border)] hover:border-[var(--tott-gold)]/50 bg-[var(--tott-dash-input-bg)]",
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
        <div className="flex flex-col items-center gap-2 py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--tott-card-border)] border-t-[var(--tott-gold)]" />
          <span className="text-xs text-gray-400">Uploading…</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 py-6 px-4 text-center pointer-events-none">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className="text-xs font-medium text-gray-300 mt-1">Click to upload cover image</span>
          <span className="text-[10px] text-gray-500">JPG, PNG, WebP — drag & drop supported</span>
        </div>
      )}
    </label>
  );
}

/** Drag-and-drop + click-to-upload zone for PDFs */
function PdfUploadZone({
  value,
  uploading,
  onChange,
}: {
  value: string;
  uploading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const id = useId();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const dragProps = {
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); setDragging(true); },
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
      <div className="mt-1 flex items-center gap-3 rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-4 py-3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-red-400">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <span className="flex-1 truncate text-xs text-gray-300">{value.split("/").pop() ?? "PDF uploaded"}</span>
        <span className="shrink-0 rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-medium text-green-400">✓ Ready</span>
        <label htmlFor={id} className="shrink-0 cursor-pointer text-[10px] text-gray-500 hover:text-gray-300 underline">
          Replace
          <input id={id} ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={onChange} />
        </label>
      </div>
    );
  }

  return (
    <label
      htmlFor={id}
      {...dragProps}
      className={[
        "mt-1 flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-colors min-h-[100px]",
        dragging
          ? "border-[var(--tott-gold)] bg-[var(--tott-gold)]/5"
          : "border-[var(--tott-card-border)] hover:border-[var(--tott-gold)]/50 bg-[var(--tott-dash-input-bg)]",
      ].join(" ")}
    >
      <input
        id={id}
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={onChange}
        disabled={uploading}
      />
      {uploading ? (
        <div className="flex flex-col items-center gap-2 py-5">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--tott-card-border)] border-t-[var(--tott-gold)]" />
          <span className="text-xs text-gray-400">Uploading PDF…</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 py-5 px-4 text-center pointer-events-none">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
          </svg>
          <span className="text-xs font-medium text-gray-300 mt-1">Click to upload PDF</span>
          <span className="text-[10px] text-gray-500">PDF format — drag & drop supported</span>
        </div>
      )}
    </label>
  );
}

export function BookFormContent({ bookId }: Props) {
  const t = useTranslations("Dashboard.books.form");
  const router = useRouter();
  const isEdit = Boolean(bookId);
  const currentUser = useAuthUser();

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
      co_authors: Array.isArray(b.co_authors) ? b.co_authors.join(", ") : (b.co_authors ?? ""),
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
    co_authors: form.co_authors
      ? form.co_authors.split(",").map((s) => s.trim()).filter(Boolean)
      : null,
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
    created_by: currentUser?.id ?? null,
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
    "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder-gray-500 outline-none focus:border-[var(--tott-gold)]/60 transition-colors";
  const labelClass =
    "text-xs font-medium text-[var(--tott-dash-gold-label)] mb-1 block";
  const sectionClass =
    "rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-elevated,#111)] p-5 space-y-4";

  if (isEdit && bookQuery.isPending) {
    return (
      <div className="my-4 mx-10 text-sm text-gray-500">Loading book…</div>
    );
  }

  return (
    <div className="my-4 mx-10 pb-12">
      {/* Back nav */}
      <Link
        href="/admin/books"
        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-foreground transition-colors mb-5"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {t("backToList")}
      </Link>

      <h1 className="mb-6 text-xl font-semibold text-foreground">
        {isEdit ? t("editTitle") : t("createTitle")}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">

        {/* ── Section 1: Core info ── */}
        <div className={sectionClass}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--tott-dash-gold-label)]">
            Book details
          </p>

          {/* Title */}
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
              <input type="text" className={inputClass} placeholder={t("fields.authorPlaceholder")} value={form.author} onChange={set("author")} />
            </div>
            <div>
              <label className={labelClass}>{t("fields.co_authors")}</label>
              <input type="text" className={inputClass} placeholder={t("fields.co_authorsPlaceholder")} value={form.co_authors} onChange={set("co_authors")} />
            </div>
            <div>
              <label className={labelClass}>{t("fields.publisher")}</label>
              <input type="text" className={inputClass} placeholder={t("fields.publisherPlaceholder")} value={form.publisher} onChange={set("publisher")} />
            </div>
            <div>
              <label className={labelClass}>{t("fields.genre")}</label>
              <input type="text" className={inputClass} placeholder={t("fields.genrePlaceholder")} value={form.genre} onChange={set("genre")} />
            </div>
            <div>
              <label className={labelClass}>{t("fields.published_date")}</label>
              <input type="date" className={inputClass} value={form.published_date} onChange={set("published_date")} />
            </div>
            <div>
              <label className={labelClass}>{t("fields.year")}</label>
              <input type="number" className={inputClass} placeholder={t("fields.yearPlaceholder")} value={form.year} onChange={set("year")} />
            </div>
            <div>
              <label className={labelClass}>{t("fields.language")}</label>
              <select className={inputClass} value={form.language} onChange={set("language")}>
                <option value="">—</option>
                {(["en", "ar", "es", "fr", "de"] as const).map((l) => (
                  <option key={l} value={l}>{t(`languages.${l}`)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t("fields.page_count")}</label>
              <input type="number" className={inputClass} placeholder={t("fields.page_countPlaceholder")} value={form.page_count} onChange={set("page_count")} />
            </div>
          </div>

          <div>
            <label className={labelClass}>{t("fields.summary")}</label>
            <textarea rows={4} className={inputClass} placeholder={t("fields.summaryPlaceholder")} value={form.summary} onChange={set("summary")} />
          </div>
        </div>

        {/* ── Section 2: Pricing ── */}
        <div className={sectionClass}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--tott-dash-gold-label)]">
            Pricing
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>{t("fields.price")}</label>
              <input type="number" step="0.01" min="0" className={inputClass} placeholder={t("fields.pricePlaceholder")} value={form.price} onChange={set("price")} />
              <p className="mt-1 text-[10px] text-gray-500">Leave blank to mark as free</p>
            </div>
            <div>
              <label className={labelClass}>{t("fields.currency")}</label>
              <input type="text" className={inputClass} placeholder={t("fields.currencyPlaceholder")} value={form.currency} onChange={set("currency")} />
            </div>
          </div>
          <div>
            <label className={labelClass}>{t("fields.magazine_id")}</label>
            <input type="text" className={inputClass} placeholder={t("fields.magazine_idPlaceholder")} value={form.magazine_id} onChange={set("magazine_id")} />
          </div>
        </div>

        {/* ── Section 3: Media uploads ── */}
        <div className={sectionClass}>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--tott-dash-gold-label)]">
            Media
          </p>

          {/* Cover image */}
          <div>
            <label className={labelClass}>{t("fields.cover_image")}</label>
            <CoverUploadZone
              value={form.cover_image}
              uploading={coverUploading}
              onChange={handleCoverUpload}
            />
            {/* Manual URL fallback */}
            <div className="mt-2">
              <input
                type="text"
                className={inputClass}
                placeholder={t("fields.cover_imagePlaceholder")}
                value={form.cover_image}
                onChange={set("cover_image")}
              />
              <p className="mt-1 text-[10px] text-gray-500">Or paste an image URL directly</p>
            </div>
          </div>

          {/* PDF */}
          <div>
            <label className={labelClass}>{t("fields.pdf_url")}</label>
            <PdfUploadZone
              value={form.pdf_url}
              uploading={pdfUploading}
              onChange={handlePdfUpload}
            />
            {/* Manual URL fallback */}
            <div className="mt-2">
              <input
                type="text"
                className={inputClass}
                placeholder={t("fields.pdf_urlPlaceholder")}
                value={form.pdf_url}
                onChange={set("pdf_url")}
              />
              <p className="mt-1 text-[10px] text-gray-500">Or paste a PDF URL directly</p>
            </div>
          </div>
        </div>

        {/* Submit error */}
        {submitError && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-400">
            {submitError}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--tott-gold)]/60 bg-[var(--tott-gold)]/10 px-5 py-2 text-sm font-medium text-[var(--tott-gold)] hover:bg-[var(--tott-gold)]/20 disabled:opacity-40 transition-colors"
          >
            {busy && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {busy
              ? isEdit ? t("saving") : t("creating")
              : isEdit ? t("save") : t("create")}
          </button>
          <Link
            href="/admin/books"
            className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:text-foreground hover:bg-white/5 transition-colors"
          >
            {t("cancel")}
          </Link>
        </div>
      </form>
    </div>
  );
}
