"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { toast } from "sonner";
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
  createTrack,
  getTrackByIdAdmin,
  updateTrack,
  type Track,
} from "@/services/tracks.service";
import { TrackItemsPanel } from "./TrackItemsPanel";

type FormState = {
  title: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  is_published: boolean;
  language: string;
};

const EMPTY: FormState = {
  title: "",
  slug: "",
  description: "",
  color: "",
  icon: "",
  is_published: true,
  language: "en",
};

function seedFromTrack(track: Track): FormState {
  return {
    title: track.title ?? "",
    slug: track.slug ?? "",
    description: track.description ?? "",
    color: track.color ?? "",
    icon: track.icon ?? "",
    is_published: track.is_published ?? true,
    language: (track.language ?? "en").trim() || "en",
  };
}

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--tott-muted)] outline-none focus:border-[var(--tott-accent-gold)]/60 transition-colors";
const labelClass = "text-xs font-medium text-[var(--tott-dash-gold-label)] mb-1 block";
const sectionClass =
  "rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] p-5 space-y-4";

type Props = {
  trackId?: string;
  /** Create-mode only: ISO code for the version being created. */
  createLanguage?: string;
  /** Create-mode only: id of the track this is a translation of. */
  translationOf?: string;
};

export function TrackFormContent({ trackId, createLanguage, translationOf }: Props) {
  const t = useTranslations("Dashboard.tracks");
  const tTr = useTranslations("Dashboard.translations");
  const router = useRouter();
  const qc = useQueryClient();
  const isEdit = Boolean(trackId);
  const isTranslation = !isEdit && Boolean(translationOf);

  const groupQuery = useTranslationGroup("track", trackId);

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

  const loadId = isEdit ? trackId : isTranslation ? translationOf : undefined;
  const [loadedSource, setLoadedSource] = useState<Track | null>(null);
  const [loading, setLoading] = useState(Boolean(loadId));

  useEffect(() => {
    if (!loadId) {
      queueMicrotask(() => setLoading(false));
      return;
    }
    let cancelled = false;
    queueMicrotask(() => setLoading(true));
    getTrackByIdAdmin(loadId).then((track) => {
      if (cancelled) return;
      setLoadedSource(track);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [loadId]);

  useEffect(() => {
    if (seeded || !loadedSource) return;
    queueMicrotask(() => {
    if (isEdit) {
      const lang = (loadedSource.language ?? "en").trim() || "en";
      setForms({ [lang]: seedFromTrack(loadedSource) });
      setActiveLang(lang);
      setPrimaryLang(lang);
    } else if (isTranslation) {
      setForms({
        [initialLang]: { ...seedFromTrack(loadedSource), language: initialLang },
      });
    }
    setSeeded(true);
    });
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

  const handleSelectLang = useCallback(
    async (loc: string) => {
      if (loc === activeLang) return;
      if (!forms[loc]) {
        const existingId = versionIds[loc];
        if (existingId) {
          setLangLoading(true);
          try {
            const track = await getTrackByIdAdmin(existingId);
            setForms((prev) =>
              prev[loc]
                ? prev
                : {
                    ...prev,
                    [loc]: track
                      ? seedFromTrack(track)
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

  function toPayload(f: FormState) {
    return {
      title: f.title.trim(),
      slug: f.slug.trim(),
      description: f.description.trim() || null,
      color: f.color.trim() || null,
      icon: f.icon.trim() || null,
      is_published: f.is_published,
    };
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const dirtyLocales: string[] = routing.locales.filter((loc) => dirty[loc] && forms[loc]);
    const submitLocales =
      isEdit || dirtyLocales.includes(primaryLang) ? dirtyLocales : [primaryLang, ...dirtyLocales];

    const primaryForm = forms[primaryLang];
    if (!isEdit && primaryForm && (!primaryForm.title.trim() || !primaryForm.slug.trim())) {
      setFormError(t("errors.titleSlugRequired"));
      setActiveLang(primaryLang);
      if (isWizard) setWizardStep(0);
      return;
    }

    const failed: string[] = [];

    if (isEdit && trackId) {
      for (const loc of submitLocales) {
        const f = forms[loc];
        if (!f) continue;
        const existingId = loc === primaryLang ? trackId : versionIds[loc];
        const base = toPayload(f);
        try {
          if (existingId) {
            await updateTrack(existingId, base);
          } else {
            await createTrack({ ...base, language: loc, translation_of: trackId });
          }
          setDirty((prev) => ({ ...prev, [loc]: false }));
        } catch (err) {
          failed.push(loc);
          if (loc === primaryLang) {
            setFormError(formatApiError(err, t("errors.updateFailed")));
          }
        }
      }
      qc.invalidateQueries({ queryKey: translationKeys.group("track", trackId) });
      qc.invalidateQueries({ queryKey: ["tracks"] });
      if (failed.length === 0) {
        toast.success(t("toasts.updated"));
        router.push("/admin/tracks");
      } else {
        toast.error(tTr("toasts.partialFailure", { languages: failed.join(", ").toUpperCase() }));
      }
      return;
    }

    // ── Create mode ──
    let primaryId: string;
    try {
      const pf = forms[primaryLang] ?? form;
      const created = await createTrack({
        ...toPayload(pf),
        language: pf.language.trim() || "en",
        translation_of: isTranslation ? translationOf : undefined,
      });
      if (!created) throw new Error("Invalid response from create track");
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
        await createTrack({ ...toPayload(f), language: loc, translation_of: primaryId });
        setDirty((prev) => ({ ...prev, [loc]: false }));
      } catch {
        failed.push(loc);
      }
    }

    qc.invalidateQueries({ queryKey: ["tracks"] });
    if (failed.length === 0) {
      toast.success(t("toasts.created"));
      router.push(`/admin/tracks/${encodeURIComponent(primaryId)}/edit`);
    } else {
      toast.error(tTr("toasts.partialFailure", { languages: failed.join(", ").toUpperCase() }));
      router.push(`/admin/tracks/${encodeURIComponent(primaryId)}/edit`);
    }
  };

  const trackFieldSection = (
    <div className={sectionClass}>
      <div>
        <label className={labelClass}>{t("form.fields.title")} *</label>
        <input
          className={inputClass}
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder={t("form.fields.titlePlaceholder")}
          disabled={busy}
        />
      </div>
      <div>
        <label className={labelClass}>{t("form.fields.slug")} *</label>
        <input
          className={inputClass}
          value={form.slug}
          onChange={(e) => set("slug", e.target.value)}
          placeholder={t("form.fields.slugPlaceholder")}
          disabled={busy}
        />
      </div>
      <div>
        <label className={labelClass}>{t("form.fields.description")}</label>
        <textarea
          rows={4}
          className={inputClass}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder={t("form.fields.descriptionPlaceholder")}
          disabled={busy}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>{t("form.fields.color")}</label>
          <input
            type="color"
            className="h-10 w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)]"
            value={form.color || "#cba158"}
            onChange={(e) => set("color", e.target.value)}
            disabled={busy}
          />
        </div>
        <div>
          <label className={labelClass}>{t("form.fields.icon")}</label>
          <input
            className={inputClass}
            value={form.icon}
            onChange={(e) => set("icon", e.target.value)}
            placeholder={t("form.fields.iconPlaceholder")}
            disabled={busy}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={form.is_published}
          onChange={(e) => updateForm((prev) => ({ ...prev, is_published: e.target.checked }))}
          disabled={busy}
        />
        {t("form.fields.isPublished")}
      </label>
    </div>
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8 px-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/tracks" className="text-xs text-[var(--tott-muted)] hover:text-foreground">
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
              {t("form.translation.ofOriginal", { name: loadedSource.title?.trim() || "—" })}
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
              {trackFieldSection}
            </TranslationWizard>
          ) : (
            trackFieldSection
          )}

          {formError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm text-red-400">
              {formError}
            </div>
          )}

          {!isWizard ? (
            <div className="flex items-center justify-end gap-3">
              <Link
                href="/admin/tracks"
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

      {isEdit && trackId ? <TrackItemsPanel trackId={trackId} /> : null}
    </div>
  );
}
