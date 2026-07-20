"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { toast } from "sonner";
import { mutationToast } from "@/hooks/useMutationToast";
import { uploadFileToUrl } from "@/services/uploads.service";
import { resolveArticleMediaSrc } from "@/lib/content/article-media-url";
import { LanguageFormTabs, TranslationWizard } from "@/components/dashboard/admin/translations";
import type { LanguageTabStatus } from "@/components/dashboard/admin/translations/LanguageFormTabs";
import type { TranslationWizardReviewLine } from "@/components/dashboard/admin/translations/TranslationWizard";
import {
  useTranslations as useTranslationGroup,
  translationKeys,
} from "@/hooks/queries/translations";
import { routing } from "@/i18n/routing";
import { usePrimaryLanguage } from "@/i18n/use-primary-language";
import { formatApiError } from "@/lib/api/error-message";
import {
  createCollection,
  getCollectionByIdAdmin,
  updateCollection,
  type CollectionDetail,
} from "@/services/collections.service";

type FormState = {
  name: string;
  description: string;
  cover_image: string;
  language: string;
};

const EMPTY: FormState = { name: "", description: "", cover_image: "", language: "en" };

function seedFromCollection(c: CollectionDetail): FormState {
  return {
    name: c.name ?? "",
    description: c.description ?? "",
    cover_image: c.cover_image ?? "",
    language: (c.language ?? "en").trim() || "en",
  };
}

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--tott-muted)] outline-none focus:border-[var(--tott-accent-gold)]/60 transition-colors";
const labelClass = "text-xs font-medium text-[var(--tott-dash-gold-label)] mb-1 block";
const sectionClass =
  "rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] p-5 space-y-4";

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
  const t = useTranslations("Dashboard.collections.form");
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolveArticleMediaSrc(value)}
          alt={t("upload.coverAlt")}
          className="h-36 w-24 rounded-lg object-cover border border-[var(--tott-card-border)] shadow-md"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        <label
          htmlFor={id}
          className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer text-xs font-medium text-white text-center px-2"
        >
          {t("upload.change")}
          <input id={id} ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
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
          ? "border-[var(--tott-accent-gold)] bg-[var(--tott-accent-gold)]/5"
          : "border-[var(--tott-card-border)] hover:border-[var(--tott-accent-gold)]/50 bg-[var(--tott-dash-input-bg)]",
      ].join(" ")}
    >
      <input id={id} ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} disabled={uploading} />
      {uploading ? (
        <div className="flex flex-col items-center gap-2 py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--tott-card-border)] border-t-[var(--tott-accent-gold)]" />
          <span className="text-xs text-[var(--tott-muted)]">{t("upload.coverUploading")}</span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1 py-6 px-4 text-center pointer-events-none">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--tott-muted)]">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <span className="text-xs font-medium text-[var(--tott-muted)] mt-1">{t("upload.coverHint")}</span>
          <span className="text-[10px] text-[var(--tott-muted)]">{t("upload.coverFormats")}</span>
        </div>
      )}
    </label>
  );
}

type Props = {
  collectionId?: string;
  /** Create-mode only: ISO code for the version being created. */
  createLanguage?: string;
  /** Create-mode only: id of the collection this is a translation of. */
  translationOf?: string;
};

export function CollectionFormContent({ collectionId, createLanguage, translationOf }: Props) {
  const t = useTranslations("Dashboard.collections");
  const tTr = useTranslations("Dashboard.translations");
  const router = useRouter();
  const qc = useQueryClient();
  const isEdit = Boolean(collectionId);
  const isTranslation = !isEdit && Boolean(translationOf);

  const groupQuery = useTranslationGroup("collection", collectionId);

  const initialLang = usePrimaryLanguage(createLanguage);
  const [activeLang, setActiveLang] = useState(initialLang);
  const [primaryLang, setPrimaryLang] = useState(initialLang);
  const [forms, setForms] = useState<Record<string, FormState>>(() => ({
    [initialLang]: { ...EMPTY, language: initialLang },
  }));
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [langLoading, setLangLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);

  const wizardLocales = useMemo(
    () => [initialLang, ...routing.locales.filter((l) => l !== initialLang)],
    [initialLang],
  );
  const [wizardStep, setWizardStep] = useState(0);
  const isWizard = !isEdit && !isTranslation;
  const formRef = useRef<HTMLFormElement>(null);

  const form = forms[activeLang] ?? { ...EMPTY, language: activeLang };

  const versionIds = useMemo(() => {
    const map: Record<string, string> = {};
    for (const v of groupQuery.data?.versions ?? []) map[v.language] = v.id;
    return map;
  }, [groupQuery.data]);

  // In edit mode load the row itself; for a translation, load the source to
  // pre-fill (admins only translate the text).
  const loadId = isEdit ? collectionId : isTranslation ? translationOf : undefined;
  const [loadedSource, setLoadedSource] = useState<CollectionDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(loadId));

  useEffect(() => {
    if (!loadId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getCollectionByIdAdmin(loadId).then((c) => {
      if (cancelled) return;
      setLoadedSource(c);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [loadId]);

  useEffect(() => {
    if (seeded || !loadedSource) return;
    if (isEdit) {
      const lang = (loadedSource.language ?? "en").trim() || "en";
      setForms({ [lang]: seedFromCollection(loadedSource) });
      setActiveLang(lang);
      setPrimaryLang(lang);
    } else if (isTranslation) {
      setForms({
        [initialLang]: { ...seedFromCollection(loadedSource), language: initialLang },
      });
    }
    setSeeded(true);
  }, [loadedSource, seeded, isEdit, isTranslation, initialLang]);

  const updateForm = useCallback(
    (mutate: (prev: FormState) => FormState) => {
      setForms((prev) => {
        const current = prev[activeLang] ?? { ...EMPTY, language: activeLang };
        return { ...prev, [activeLang]: mutate(current) };
      });
      setDirty((prev) => (prev[activeLang] ? prev : { ...prev, [activeLang]: true }));
    },
    [activeLang],
  );

  const set = (key: keyof FormState, value: string) =>
    updateForm((prev) => ({ ...prev, [key]: value }));

  const handleCoverUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = "";
      setCoverUploading(true);
      try {
        const url = await mutationToast(() => uploadFileToUrl(file), {
          loading: t("form.toast.coverUploading"),
          success: t("form.toast.coverUploaded"),
          error: t("form.toast.coverUploadFailed"),
        });
        updateForm((prev) => ({ ...prev, cover_image: url }));
      } catch {
        // error surfaced via toast
      } finally {
        setCoverUploading(false);
      }
    },
    [t, updateForm],
  );

  const handleSelectLang = useCallback(
    async (loc: string) => {
      if (loc === activeLang) return;
      if (!forms[loc]) {
        const existingId = versionIds[loc];
        if (existingId) {
          setLangLoading(true);
          try {
            const c = await getCollectionByIdAdmin(existingId);
            setForms((prev) =>
              prev[loc]
                ? prev
                : {
                    ...prev,
                    [loc]: c
                      ? seedFromCollection(c)
                      : { ...(prev[primaryLang] ?? EMPTY), language: loc },
                  },
            );
          } finally {
            setLangLoading(false);
          }
        } else {
          setForms((prev) =>
            prev[loc]
              ? prev
              : { ...prev, [loc]: { ...(prev[primaryLang] ?? EMPTY), language: loc } },
          );
        }
      }
      setActiveLang(loc);
    },
    [activeLang, forms, versionIds, primaryLang],
  );

  const tabStatus = useMemo(() => {
    const map: Record<string, LanguageTabStatus> = {};
    for (const loc of routing.locales) {
      map[loc] = dirty[loc]
        ? "dirty"
        : loc === primaryLang
          ? "primary"
          : versionIds[loc] || forms[loc]
            ? "existing"
            : "empty";
    }
    return map;
  }, [dirty, primaryLang, versionIds, forms]);

  const goToWizardStep = useCallback(
    (step: number) => {
      const loc = wizardLocales[step];
      if (loc && !forms[loc]) {
        setForms((prev) => ({ ...prev, [loc]: { ...(prev[wizardLocales[0]] ?? EMPTY), language: loc } }));
      }
      if (loc) setActiveLang(loc);
      setWizardStep(step);
    },
    [wizardLocales, forms],
  );
  const wizardReviewLines: TranslationWizardReviewLine[] = useMemo(
    () =>
      wizardLocales.map((loc) => ({
        locale: loc,
        label: tTr.has(`languages.${loc}`) ? tTr(`languages.${loc}`) : loc.toUpperCase(),
        action: loc === wizardLocales[0] || dirty[loc] ? "create" : "skip",
      })),
    [wizardLocales, dirty, tTr],
  );

  const busy = langLoading;
  const loadingEdit = (isEdit || isTranslation) && loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const dirtyLocales: string[] = routing.locales.filter((loc) => dirty[loc] && forms[loc]);
    const submitLocales =
      isEdit || dirtyLocales.includes(primaryLang) ? dirtyLocales : [primaryLang, ...dirtyLocales];

    const primaryForm = forms[primaryLang];
    if (!isEdit && primaryForm && !primaryForm.name.trim()) {
      setFormError(t("errors.nameRequired"));
      setActiveLang(primaryLang);
      if (isWizard) setWizardStep(0);
      return;
    }

    const failed: string[] = [];

    if (isEdit && collectionId) {
      for (const loc of submitLocales) {
        const f = forms[loc];
        if (!f) continue;
        const existingId = loc === primaryLang ? collectionId : versionIds[loc];
        const base = {
          name: f.name.trim(),
          description: f.description.trim() || null,
          cover_image: f.cover_image.trim() || null,
        };
        try {
          if (existingId) {
            await updateCollection(existingId, base);
          } else {
            await createCollection({ ...base, language: loc, translation_of: collectionId });
          }
          setDirty((prev) => ({ ...prev, [loc]: false }));
        } catch (err) {
          failed.push(loc);
          if (loc === primaryLang) {
            setFormError(formatApiError(err, t("errors.updateFailed")));
          }
        }
      }
      qc.invalidateQueries({ queryKey: translationKeys.group("collection", collectionId) });
      qc.invalidateQueries({ queryKey: ["admin-collections"] });
      if (failed.length === 0) {
        toast.success(t("toasts.updated"));
        router.push("/admin/collections");
      } else {
        toast.error(tTr("toasts.partialFailure", { languages: failed.join(", ").toUpperCase() }));
      }
      return;
    }

    // ── Create mode ──
    let primaryId: string;
    try {
      const pf = forms[primaryLang] ?? form;
      const created = await createCollection({
        name: pf.name.trim(),
        description: pf.description.trim() || null,
        cover_image: pf.cover_image.trim() || null,
        language: pf.language.trim() || "en",
        translation_of: isTranslation ? translationOf : undefined,
      });
      if (!created) throw new Error("Invalid response from create collection");
      primaryId = created.id;
      setDirty((prev) => ({ ...prev, [primaryLang]: false }));
    } catch (err) {
      setFormError(formatApiError(err, t("errors.createFailed")));
      return;
    }

    for (const loc of submitLocales) {
      if (loc === primaryLang) continue;
      const f = forms[loc];
      if (!f) continue;
      try {
        await createCollection({
          name: f.name.trim(),
          description: f.description.trim() || null,
          cover_image: f.cover_image.trim() || null,
          language: loc,
          translation_of: primaryId,
        });
        setDirty((prev) => ({ ...prev, [loc]: false }));
      } catch {
        failed.push(loc);
      }
    }

    qc.invalidateQueries({ queryKey: ["admin-collections"] });
    if (failed.length === 0) {
      toast.success(t("toasts.created"));
      router.push("/admin/collections");
    } else {
      toast.error(tTr("toasts.partialFailure", { languages: failed.join(", ").toUpperCase() }));
      router.push(`/admin/collections/${encodeURIComponent(primaryId)}/edit`);
    }
  };

  const collectionFieldSection = (
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
        <CoverUploadZone value={form.cover_image} uploading={coverUploading} onChange={handleCoverUpload} />
        <div className="mt-2">
          <input
            className={inputClass}
            value={form.cover_image}
            onChange={(e) => set("cover_image", e.target.value)}
            placeholder={t("form.fields.coverImagePlaceholder")}
            disabled={busy}
          />
        </div>
      </div>
    </div>
  );

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
        {isEdit && !isTranslation ? (
          <LanguageFormTabs
            active={activeLang}
            onSelect={(loc) => void handleSelectLang(loc)}
            status={tabStatus}
            disabled={busy}
          />
        ) : null}
      </div>

      {isTranslation ? (
        <div className="rounded-xl border border-[var(--tott-accent-gold)]/30 bg-[var(--tott-accent-gold)]/5 px-4 py-3 text-sm">
          <p className="font-medium text-[var(--tott-dash-gold-text)]">
            {t("form.translation.banner", { language: form.language.toUpperCase() })}
          </p>
          {loadedSource ? (
            <p className="mt-1 text-[var(--tott-muted)]">
              {t("form.translation.ofOriginal", { name: loadedSource.name?.trim() || "—" })}
            </p>
          ) : null}
        </div>
      ) : null}

      {loadingEdit ? (
        <div className="py-12 text-center text-sm text-[var(--tott-muted)]">{t("form.loading")}</div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
          {isWizard ? (
            <TranslationWizard
              locales={wizardLocales}
              step={wizardStep}
              localeLabel={(loc) => (tTr.has(`languages.${loc}`) ? tTr(`languages.${loc}`) : loc.toUpperCase())}
              onBack={() => goToWizardStep(Math.max(0, wizardStep - 1))}
              onSkip={() => goToWizardStep(Math.min(wizardLocales.length, wizardStep + 1))}
              onNext={() => goToWizardStep(Math.min(wizardLocales.length, wizardStep + 1))}
              onConfirm={() => formRef.current?.requestSubmit()}
              onStepClick={goToWizardStep}
              busy={busy}
              reviewLines={wizardReviewLines}
            >
              {collectionFieldSection}
            </TranslationWizard>
          ) : (
            collectionFieldSection
          )}

          {formError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm text-red-400">
              {formError}
            </div>
          )}

          {!isWizard ? (
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
          ) : null}
        </form>
      )}
    </div>
  );
}
