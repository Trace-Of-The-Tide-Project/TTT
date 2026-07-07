"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { usePerson, peopleKeys } from "@/hooks/queries/people";
import { useCreatePerson, useUpdatePerson } from "@/hooks/mutations/people";
import { uploadArticleAssetPath } from "@/services/uploads.service";
import {
  getPerson,
  type PersonProfile,
  type PersonProfilePayload,
} from "@/services/people.service";
import {
  useTranslations as useTranslationGroup,
  translationKeys,
} from "@/hooks/queries/translations";
import { formatApiError } from "@/lib/api/error-message";
import { AvatarUploadZone } from "@/components/dashboard/admin/writers/form-controls";
import { LanguageFormTabs, TranslationWizard } from "@/components/dashboard/admin/translations";
import type { LanguageTabStatus } from "@/components/dashboard/admin/translations/LanguageFormTabs";
import type { TranslationWizardReviewLine } from "@/components/dashboard/admin/translations/TranslationWizard";
import { routing } from "@/i18n/routing";
import { toast } from "sonner";

type FormState = {
  full_name: string;
  biography: string;
  portrait: string;
  birth_date: string;
  death_date: string;
  language: string;
};

const EMPTY: FormState = {
  full_name: "",
  biography: "",
  portrait: "",
  birth_date: "",
  death_date: "",
  language: "en",
};

function seedFromPerson(p: PersonProfile): FormState {
  return {
    full_name: p.full_name ?? "",
    biography: p.biography ?? "",
    portrait: p.portrait ?? "",
    birth_date: p.birth_date ? p.birth_date.slice(0, 10) : "",
    death_date: p.death_date ? p.death_date.slice(0, 10) : "",
    language: (p.language ?? "en").trim() || "en",
  };
}

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--tott-muted)] outline-none focus:border-[var(--tott-accent-gold)]/60 transition-colors";
const labelClass = "text-xs font-medium text-[var(--tott-dash-gold-label)] mb-1 block";
const sectionClass =
  "rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] p-5 space-y-4";
const sectionHeadingClass =
  "text-[10px] font-semibold uppercase tracking-widest text-[var(--tott-dash-gold-label)]";

type Props = {
  personId?: string;
  /** Create-mode only: ISO code for the version being created. */
  createLanguage?: string;
  /** Create-mode only: id of the person this is a translation of. */
  translationOf?: string;
};

export function PersonFormContent({ personId, createLanguage, translationOf }: Props) {
  const t = useTranslations("Dashboard.people");
  const tTr = useTranslations("Dashboard.translations");
  const router = useRouter();
  const qc = useQueryClient();
  const isEdit = Boolean(personId);
  const isTranslation = !isEdit && Boolean(translationOf);

  const personQuery = usePerson(personId);
  const sourceQuery = usePerson(isTranslation ? translationOf : undefined);
  const groupQuery = useTranslationGroup("person", personId);
  const createMutation = useCreatePerson();
  const updateMutation = useUpdatePerson();

  const initialLang = (createLanguage || "en").trim() || "en";
  const [activeLang, setActiveLang] = useState(initialLang);
  const [primaryLang, setPrimaryLang] = useState(initialLang);
  const [forms, setForms] = useState<Record<string, FormState>>(() => ({
    [initialLang]: { ...EMPTY, language: initialLang },
  }));
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [langLoading, setLangLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);
  const [translationSeeded, setTranslationSeeded] = useState(false);
  const [uploadingPortrait, setUploadingPortrait] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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

  // Seed form from existing record in edit mode.
  useEffect(() => {
    if (!isEdit || seeded || !personQuery.data) return;
    const p = personQuery.data;
    const lang = (p.language ?? "en").trim() || "en";
    setForms({ [lang]: seedFromPerson(p) });
    setActiveLang(lang);
    setPrimaryLang(lang);
    setSeeded(true);
  }, [isEdit, seeded, personQuery.data]);

  // Clone the source person when adding a translation; keep the target
  // language already set from `?language=`.
  useEffect(() => {
    if (!isTranslation || translationSeeded || !sourceQuery.data) return;
    setForms({
      [initialLang]: { ...seedFromPerson(sourceQuery.data), language: initialLang },
    });
    setTranslationSeeded(true);
  }, [isTranslation, translationSeeded, sourceQuery.data, initialLang]);

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

  const set = useCallback(
    (key: keyof FormState, value: string) => updateForm((prev) => ({ ...prev, [key]: value })),
    [updateForm],
  );

  const handleSelectLang = useCallback(
    async (loc: string) => {
      if (loc === activeLang) return;
      if (!forms[loc]) {
        const existingId = versionIds[loc];
        if (existingId) {
          setLangLoading(true);
          try {
            const p = await getPerson(existingId);
            setForms((prev) =>
              prev[loc]
                ? prev
                : {
                    ...prev,
                    [loc]: p
                      ? seedFromPerson(p)
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

  const handlePortraitUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploadingPortrait(true);
      try {
        const key = await uploadArticleAssetPath(file);
        set("portrait", key);
      } catch {
        toast.error(t("form.errors.portraitUploadFailed"));
      } finally {
        setUploadingPortrait(false);
      }
    },
    [set, t],
  );

  const buildPayload = (
    f: FormState,
    opts: { create: boolean; translationOf?: string | null },
  ): PersonProfilePayload => ({
    full_name: f.full_name.trim(),
    biography: f.biography.trim() || null,
    portrait: f.portrait.trim() || null,
    birth_date: f.birth_date || null,
    death_date: f.death_date || null,
    language: opts.create ? f.language.trim() || undefined : undefined,
    translation_of: opts.create ? (opts.translationOf ?? undefined) : undefined,
  });

  const busy =
    createMutation.isPending || updateMutation.isPending || uploadingPortrait || langLoading;
  const loadingEdit = isEdit && personQuery.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (busy) return;

    const dirtyLocales: string[] = routing.locales.filter((loc) => dirty[loc] && forms[loc]);
    const submitLocales =
      isEdit || dirtyLocales.includes(primaryLang) ? dirtyLocales : [primaryLang, ...dirtyLocales];

    const primaryForm = forms[primaryLang];
    if (!isEdit && primaryForm && !primaryForm.full_name.trim()) {
      setFormError(t("form.errors.fullNameRequired"));
      setActiveLang(primaryLang);
      if (isWizard) setWizardStep(0);
      return;
    }

    const failed: string[] = [];

    if (isEdit && personId) {
      for (const loc of submitLocales) {
        const f = forms[loc];
        if (!f) continue;
        const existingId = loc === primaryLang ? personId : versionIds[loc];
        try {
          if (existingId) {
            await updateMutation.mutateAsync({
              personId: existingId,
              payload: buildPayload(f, { create: false }),
            });
          } else {
            await createMutation.mutateAsync(
              buildPayload(f, { create: true, translationOf: personId }),
            );
          }
          setDirty((prev) => ({ ...prev, [loc]: false }));
        } catch (err) {
          failed.push(loc);
          if (loc === primaryLang) {
            setFormError(formatApiError(err, t("form.errors.updateFailed")));
          }
        }
      }
      qc.invalidateQueries({ queryKey: translationKeys.group("person", personId) });
      qc.invalidateQueries({ queryKey: peopleKeys.all });
      if (failed.length === 0) {
        toast.success(t("form.toasts.updated"));
        router.push("/admin/people");
      } else {
        toast.error(tTr("toasts.partialFailure", { languages: failed.join(", ").toUpperCase() }));
      }
      return;
    }

    // ── Create mode ──
    let primaryId: string;
    try {
      const created = await createMutation.mutateAsync(
        buildPayload(forms[primaryLang] ?? form, {
          create: true,
          translationOf: isTranslation ? translationOf : null,
        }),
      );
      primaryId = created.id;
      setDirty((prev) => ({ ...prev, [primaryLang]: false }));
    } catch (err) {
      setFormError(formatApiError(err, t("form.errors.createFailed")));
      return;
    }

    for (const loc of submitLocales) {
      if (loc === primaryLang) continue;
      const f = forms[loc];
      if (!f) continue;
      try {
        await createMutation.mutateAsync(buildPayload(f, { create: true, translationOf: primaryId }));
        setDirty((prev) => ({ ...prev, [loc]: false }));
      } catch {
        failed.push(loc);
      }
    }

    qc.invalidateQueries({ queryKey: peopleKeys.all });
    if (failed.length === 0) {
      toast.success(t("form.toasts.created"));
      router.push("/admin/people");
    } else {
      toast.error(tTr("toasts.partialFailure", { languages: failed.join(", ").toUpperCase() }));
      router.push(`/admin/people/${encodeURIComponent(primaryId)}/edit`);
    }
  };

  const personFieldSections = (
    <>
      {/* Identity */}
      <div className={sectionClass}>
        <p className={sectionHeadingClass}>{t("form.sections.identity")}</p>

        <div>
          <label className={labelClass}>{t("form.fields.fullName")} *</label>
          <input
            className={inputClass}
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
            placeholder={t("form.fields.fullNamePlaceholder")}
            disabled={busy}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>{t("form.fields.birthDate")}</label>
            <input
              type="date"
              className={inputClass}
              value={form.birth_date}
              onChange={(e) => set("birth_date", e.target.value)}
              disabled={busy}
            />
          </div>
          <div>
            <label className={labelClass}>{t("form.fields.deathDate")}</label>
            <input
              type="date"
              className={inputClass}
              value={form.death_date}
              onChange={(e) => set("death_date", e.target.value)}
              disabled={busy}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>{t("form.fields.portrait")}</label>
          <AvatarUploadZone
            value={form.portrait}
            uploading={uploadingPortrait}
            onChange={handlePortraitUpload}
            labels={{
              uploading: t("form.upload.uploading"),
              click: t("form.upload.click"),
              hint: t("form.upload.hint"),
              change: t("form.upload.change"),
            }}
          />
        </div>
      </div>

      {/* Biography */}
      <div className={sectionClass}>
        <p className={sectionHeadingClass}>{t("form.sections.biography")}</p>
        <div>
          <textarea
            rows={6}
            className={inputClass}
            value={form.biography}
            onChange={(e) => set("biography", e.target.value)}
            placeholder={t("form.fields.biographyPlaceholder")}
            aria-label={t("form.sections.biography")}
            disabled={busy}
          />
        </div>
      </div>
    </>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8 px-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/people"
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
          {sourceQuery.data ? (
            <p className="mt-1 text-[var(--tott-muted)]">
              {t("form.translation.ofOriginal", {
                name: sourceQuery.data.full_name?.trim() || "—",
              })}
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
              {personFieldSections}
            </TranslationWizard>
          ) : (
            personFieldSections
          )}

          {formError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm text-red-400">
              {formError}
            </div>
          )}

          {!isWizard ? (
            <div className="flex items-center justify-end gap-3">
              <Link
                href="/admin/people"
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
