"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { toast } from "sonner";
import { TranslationsPanel } from "@/components/dashboard/admin/translations";
import { formatApiError } from "@/lib/api/error-message";
import {
  createCollection,
  getCollectionByIdAdmin,
  updateCollection,
  type CollectionInput,
} from "@/services/collections.service";

type FormState = {
  name: string;
  description: string;
  cover_image: string;
  language: string;
};

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--tott-muted)] outline-none focus:border-[var(--tott-accent-gold)]/60 transition-colors";
const labelClass = "text-xs font-medium text-[var(--tott-dash-gold-label)] mb-1 block";
const sectionClass =
  "rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] p-5 space-y-4";

type Props = {
  collectionId?: string;
  /** Create-mode only: ISO code for the version being created. */
  createLanguage?: string;
  /** Create-mode only: id of the collection this is a translation of. */
  translationOf?: string;
};

export function CollectionFormContent({ collectionId, createLanguage, translationOf }: Props) {
  const t = useTranslations("Dashboard.collections");
  const router = useRouter();
  const qc = useQueryClient();
  const isEdit = Boolean(collectionId);
  const isTranslation = !isEdit && Boolean(translationOf);

  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    cover_image: "",
    language: (createLanguage || "en").trim() || "en",
  });
  const [seeded, setSeeded] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // In edit mode load the row itself; for a translation, load the source to
  // pre-fill (admins only translate the text).
  const loadId = isEdit ? collectionId : isTranslation ? translationOf : undefined;
  const { data: loaded, isPending: loading } = useQuery({
    queryKey: ["admin-collection", loadId],
    queryFn: () => getCollectionByIdAdmin(loadId as string),
    enabled: Boolean(loadId),
  });

  useEffect(() => {
    if (seeded || !loaded) return;
    setForm((prev) => ({
      ...prev,
      name: loaded.name ?? "",
      description: loaded.description ?? "",
      cover_image: loaded.cover_image ?? "",
      // Edit keeps the row's own language; a translation keeps the target
      // language already set from `?language=`.
      language: isEdit ? (loaded.language ?? "en").trim() || "en" : prev.language,
    }));
    setSeeded(true);
  }, [loaded, seeded, isEdit]);

  const set = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const createMutation = useMutation({
    mutationFn: (payload: CollectionInput) => createCollection(payload),
    onSuccess: () => {
      toast.success(t("toasts.created"));
      qc.invalidateQueries({ queryKey: ["admin-collections"] });
      router.push("/admin/collections");
    },
    onError: (err) => setFormError(formatApiError(err, t("errors.createFailed"))),
  });
  const updateMutation = useMutation({
    mutationFn: (payload: Partial<CollectionInput>) =>
      updateCollection(collectionId as string, payload),
    onSuccess: () => {
      toast.success(t("toasts.updated"));
      qc.invalidateQueries({ queryKey: ["admin-collections"] });
      router.push("/admin/collections");
    },
    onError: (err) => setFormError(formatApiError(err, t("errors.updateFailed"))),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.name.trim()) {
      setFormError(t("errors.nameRequired"));
      return;
    }
    const base = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      cover_image: form.cover_image.trim() || null,
    };
    if (isEdit) {
      updateMutation.mutate(base);
    } else {
      createMutation.mutate({
        ...base,
        language: form.language.trim() || "en",
        translation_of: isTranslation ? translationOf : undefined,
      });
    }
  };

  const busy = createMutation.isPending || updateMutation.isPending;
  const loadingEdit = (isEdit || isTranslation) && loading;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8 px-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/collections"
            className="text-xs text-[var(--tott-muted)] hover:text-foreground"
          >
            ← {t("form.backToList")}
          </Link>
          <h1 className="text-lg font-semibold">
            {isEdit ? t("form.editTitle") : t("form.createTitle")}
          </h1>
        </div>
        {isEdit && collectionId ? (
          <TranslationsPanel
            contentType="collection"
            contentId={collectionId}
            currentLanguage={form.language}
          />
        ) : null}
      </div>

      {isTranslation ? (
        <div className="rounded-xl border border-[var(--tott-accent-gold)]/30 bg-[var(--tott-accent-gold)]/5 px-4 py-3 text-sm">
          <p className="font-medium text-[var(--tott-dash-gold-text)]">
            {t("form.translation.banner", { language: form.language.toUpperCase() })}
          </p>
          {loaded ? (
            <p className="mt-1 text-[var(--tott-muted)]">
              {t("form.translation.ofOriginal", { name: loaded.name?.trim() || "—" })}
            </p>
          ) : null}
        </div>
      ) : null}

      {loadingEdit ? (
        <div className="py-12 text-center text-sm text-[var(--tott-muted)]">{t("form.loading")}</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className={sectionClass}>
            <div>
              <label className={labelClass}>{t("form.fields.name")} *</label>
              <input
                className={inputClass}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder={t("form.fields.namePlaceholder")}
                disabled={busy}
              />
            </div>
            <div>
              <label className={labelClass}>{t("form.fields.description")}</label>
              <textarea
                rows={5}
                className={inputClass}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder={t("form.fields.descriptionPlaceholder")}
                disabled={busy}
              />
            </div>
            <div>
              <label className={labelClass}>{t("form.fields.coverImage")}</label>
              <input
                className={inputClass}
                value={form.cover_image}
                onChange={(e) => set("cover_image", e.target.value)}
                placeholder={t("form.fields.coverImagePlaceholder")}
                disabled={busy}
              />
            </div>
          </div>

          {formError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm text-red-400">
              {formError}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/admin/collections"
              className="rounded-lg px-4 py-2 text-sm text-[var(--tott-muted)] hover:text-foreground"
            >
              {t("form.cancel")}
            </Link>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-[var(--tott-accent-gold)] px-5 py-2 text-sm font-semibold text-[var(--tott-on-accent)] hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {busy ? t("form.saving") : isEdit ? t("form.save") : t("form.create")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
