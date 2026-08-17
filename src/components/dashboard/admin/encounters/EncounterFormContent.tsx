"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { toast } from "sonner";
import { formatApiError } from "@/lib/api/error-message";
import { useEncounterAdmin } from "@/hooks/queries/encounters-admin";
import { useCreateEncounter, useUpdateEncounter } from "@/hooks/mutations/encounters-admin";
import type { EncounterScheduleItem, EncounterInput } from "@/services/encounters.service";

type StopDraft = {
  title: string;
  start_date: string;
  start_time: string;
  body: string;
  lat: string;
  lng: string;
};

const EMPTY_STOP: StopDraft = { title: "", start_date: "", start_time: "", body: "", lat: "", lng: "" };

function seedStop(s?: EncounterScheduleItem | null): StopDraft {
  return {
    title: s?.title ?? "",
    start_date: s?.start_date ? String(s.start_date) : "",
    start_time: s?.start_time ?? "",
    body: s?.body ?? "",
    lat: s?.lat != null ? String(s.lat) : "",
    lng: s?.lng != null ? String(s.lng) : "",
  };
}

type FormState = {
  title: string;
  location: string;
  date: string;
  duration: string;
  group_size: string;
  languages: string;
  type: string;
  tip_price: string;
  about: string;
  hero_image: string;
  status: "draft" | "published";
  chips: string;
  highlights: string;
  schedule: StopDraft[];
};

const EMPTY_FORM: FormState = {
  title: "",
  location: "",
  date: "",
  duration: "",
  group_size: "",
  languages: "",
  type: "",
  tip_price: "",
  about: "",
  hero_image: "",
  status: "draft",
  chips: "",
  highlights: "",
  schedule: [],
};

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--tott-muted)] outline-none focus:border-[var(--tott-accent-gold)]/60 transition-colors";
const labelClass = "text-xs font-medium text-[var(--tott-dash-gold-label)] mb-1 block";
const sectionClass =
  "rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] p-5 space-y-4";

export function EncounterFormContent({ encounterId }: { encounterId?: string }) {
  const t = useTranslations("Dashboard.encounters");
  const router = useRouter();
  const isEdit = Boolean(encounterId);

  const { data: encounter, isLoading } = useEncounterAdmin(encounterId);
  const create = useCreateEncounter();
  const update = useUpdateEncounter(encounterId ?? "");

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [seeded, setSeeded] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || seeded || !encounter) return;
    setForm({
      title: encounter.title ?? "",
      location: encounter.location ?? "",
      date: encounter.date ? String(encounter.date).slice(0, 10) : "",
      duration: encounter.duration ?? "",
      group_size: encounter.group_size ?? "",
      languages: encounter.languages ?? "",
      type: encounter.type ?? "",
      tip_price: encounter.tip_price ?? "",
      about: encounter.about ?? "",
      hero_image: encounter.hero_image ?? "",
      status: encounter.status === "published" ? "published" : "draft",
      chips: (encounter.chips ?? []).join(", "),
      highlights: (encounter.highlights ?? []).join(", "),
      schedule: (encounter.schedule ?? []).map(seedStop),
    });
    setSeeded(true);
  }, [isEdit, seeded, encounter]);

  const set = (key: keyof Omit<FormState, "schedule">, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const setStop = (index: number, key: keyof StopDraft, value: string) =>
    setForm((prev) => {
      const schedule = prev.schedule.map((s, i) => (i === index ? { ...s, [key]: value } : s));
      return { ...prev, schedule };
    });

  const addStop = () =>
    setForm((prev) => ({ ...prev, schedule: [...prev.schedule, { ...EMPTY_STOP }] }));

  const removeStop = (index: number) =>
    setForm((prev) => ({ ...prev, schedule: prev.schedule.filter((_, i) => i !== index) }));

  const moveStop = (index: number, dir: -1 | 1) =>
    setForm((prev) => {
      const target = index + dir;
      if (target < 0 || target >= prev.schedule.length) return prev;
      const schedule = [...prev.schedule];
      [schedule[index], schedule[target]] = [schedule[target], schedule[index]];
      return { ...prev, schedule };
    });

  function splitList(v: string): string[] {
    return v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function buildPayload(): EncounterInput {
    return {
      title: form.title.trim(),
      location: form.location.trim() || null,
      date: form.date ? new Date(form.date).toISOString() : null,
      duration: form.duration.trim() || null,
      group_size: form.group_size.trim() || null,
      languages: form.languages.trim() || null,
      type: form.type.trim() || null,
      tip_price: form.tip_price.trim() || null,
      about: form.about.trim() || null,
      hero_image: form.hero_image.trim() || null,
      status: form.status,
      chips: splitList(form.chips),
      highlights: splitList(form.highlights),
      schedule: form.schedule.map((s, i) => ({
        order: i + 1,
        title: s.title.trim() || null,
        start_date: s.start_date || null,
        start_time: s.start_time || null,
        body: s.body.trim() || null,
        lat: s.lat ? Number(s.lat) : null,
        lng: s.lng ? Number(s.lng) : null,
      })),
    };
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.title.trim()) {
      setFormError(t("form.errors.titleRequired"));
      return;
    }
    const payload = buildPayload();
    try {
      if (isEdit && encounterId) {
        await update.mutateAsync(payload);
        toast.success(t("toasts.updated"));
      } else {
        await create.mutateAsync(payload);
        toast.success(t("toasts.created"));
      }
      router.push("/admin/encounters");
    } catch (err) {
      setFormError(
        formatApiError(
          err,
          isEdit ? t("form.errors.updateFailed") : t("form.errors.createFailed"),
        ),
      );
    }
  };

  const busy = create.isPending || update.isPending || isLoading;

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-[var(--tott-muted)]">{t("form.loading")}</div>;
  }

  if (isEdit && !encounter) {
    return <div className="py-12 text-center text-sm text-[var(--tott-muted)]">{t("form.notFound")}</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/encounters"
          className="text-xs text-[var(--tott-muted)] hover:text-foreground"
        >
          ← {t("form.backToList")}
        </Link>
        <h1 className="text-lg font-semibold">
          {isEdit ? t("form.editTitle") : t("form.createTitle")}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t("form.fields.location")}</label>
              <input
                className={inputClass}
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder={t("form.fields.locationPlaceholder")}
                disabled={busy}
              />
            </div>
            <div>
              <label className={labelClass}>{t("form.fields.date")}</label>
              <input
                type="date"
                className={inputClass}
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                disabled={busy}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t("form.fields.duration")}</label>
              <input
                className={inputClass}
                value={form.duration}
                onChange={(e) => set("duration", e.target.value)}
                placeholder={t("form.fields.durationPlaceholder")}
                disabled={busy}
              />
            </div>
            <div>
              <label className={labelClass}>{t("form.fields.groupSize")}</label>
              <input
                className={inputClass}
                value={form.group_size}
                onChange={(e) => set("group_size", e.target.value)}
                placeholder={t("form.fields.groupSizePlaceholder")}
                disabled={busy}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t("form.fields.languages")}</label>
              <input
                className={inputClass}
                value={form.languages}
                onChange={(e) => set("languages", e.target.value)}
                placeholder={t("form.fields.languagesPlaceholder")}
                disabled={busy}
              />
            </div>
            <div>
              <label className={labelClass}>{t("form.fields.type")}</label>
              <input
                className={inputClass}
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                placeholder={t("form.fields.typePlaceholder")}
                disabled={busy}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>{t("form.fields.tipPrice")}</label>
              <input
                className={inputClass}
                value={form.tip_price}
                onChange={(e) => set("tip_price", e.target.value)}
                placeholder={t("form.fields.tipPricePlaceholder")}
                disabled={busy}
              />
            </div>
            <div>
              <label className={labelClass}>{t("form.fields.heroImage")}</label>
              <input
                className={inputClass}
                value={form.hero_image}
                onChange={(e) => set("hero_image", e.target.value)}
                placeholder={t("form.fields.heroImagePlaceholder")}
                disabled={busy}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>{t("form.fields.chips")}</label>
            <input
              className={inputClass}
              value={form.chips}
              onChange={(e) => set("chips", e.target.value)}
              placeholder={t("form.fields.chipsPlaceholder")}
              disabled={busy}
            />
          </div>
          <div>
            <label className={labelClass}>{t("form.fields.highlights")}</label>
            <input
              className={inputClass}
              value={form.highlights}
              onChange={(e) => set("highlights", e.target.value)}
              placeholder={t("form.fields.highlightsPlaceholder")}
              disabled={busy}
            />
          </div>
          <div>
            <label className={labelClass}>{t("form.fields.about")}</label>
            <textarea
              rows={4}
              className={inputClass}
              value={form.about}
              onChange={(e) => set("about", e.target.value)}
              placeholder={t("form.fields.aboutPlaceholder")}
              disabled={busy}
            />
          </div>
          <div>
            <label className={labelClass}>{t("form.fields.status")}</label>
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
              disabled={busy}
            >
              <option value="draft">{t("form.fields.statusDraft")}</option>
              <option value="published">{t("form.fields.statusPublished")}</option>
            </select>
          </div>
        </div>

        <div className={sectionClass}>
          <div>
            <h2 className="text-sm font-semibold text-foreground">{t("schedule.heading")}</h2>
            <p className="text-xs text-[var(--tott-muted)]">{t("schedule.description")}</p>
          </div>

          {form.schedule.length === 0 ? (
            <p className="rounded-lg border border-dashed border-[var(--tott-card-border)] px-4 py-6 text-center text-sm text-[var(--tott-muted)]">
              {t("schedule.empty")}
            </p>
          ) : (
            <ul className="space-y-3">
              {form.schedule.map((stop, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)]/50 p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[var(--tott-dash-gold-label)]">
                      #{i + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label={t("schedule.moveUp")}
                        disabled={i === 0}
                        onClick={() => moveStop(i, -1)}
                        className="rounded-md px-2 py-1 text-sm text-[var(--tott-muted)] hover:text-foreground disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        aria-label={t("schedule.moveDown")}
                        disabled={i === form.schedule.length - 1}
                        onClick={() => moveStop(i, 1)}
                        className="rounded-md px-2 py-1 text-sm text-[var(--tott-muted)] hover:text-foreground disabled:opacity-30"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeStop(i)}
                        className="rounded-md px-2 py-1 text-sm text-red-400 hover:text-red-300"
                      >
                        {t("schedule.remove")}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>{t("schedule.fields.title")}</label>
                      <input
                        className={inputClass}
                        value={stop.title}
                        onChange={(e) => setStop(i, "title", e.target.value)}
                        placeholder={t("schedule.fields.titlePlaceholder")}
                        disabled={busy}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>{t("schedule.fields.startDate")}</label>
                        <input
                          type="date"
                          className={inputClass}
                          value={stop.start_date}
                          onChange={(e) => setStop(i, "start_date", e.target.value)}
                          disabled={busy}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t("schedule.fields.startTime")}</label>
                        <input
                          type="time"
                          className={inputClass}
                          value={stop.start_time}
                          onChange={(e) => setStop(i, "start_time", e.target.value)}
                          disabled={busy}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>{t("schedule.fields.body")}</label>
                      <textarea
                        rows={2}
                        className={inputClass}
                        value={stop.body}
                        onChange={(e) => setStop(i, "body", e.target.value)}
                        placeholder={t("schedule.fields.bodyPlaceholder")}
                        disabled={busy}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>{t("schedule.fields.lat")}</label>
                        <input
                          type="number"
                          step="any"
                          className={inputClass}
                          value={stop.lat}
                          onChange={(e) => setStop(i, "lat", e.target.value)}
                          disabled={busy}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>{t("schedule.fields.lng")}</label>
                        <input
                          type="number"
                          step="any"
                          className={inputClass}
                          value={stop.lng}
                          onChange={(e) => setStop(i, "lng", e.target.value)}
                          disabled={busy}
                        />
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <button
            type="button"
            onClick={addStop}
            disabled={busy}
            className="rounded-lg border border-dashed border-[var(--tott-card-border)] px-4 py-2 text-sm text-[var(--tott-dash-gold-label)] hover:text-foreground disabled:opacity-40"
          >
            + {t("schedule.addStop")}
          </button>
        </div>

        {formError ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm text-red-400">
            {formError}
          </div>
        ) : null}

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/admin/encounters"
            className="rounded-lg px-4 py-2 text-sm text-[var(--tott-muted)] hover:text-foreground"
          >
            {t("form.cancel")}
          </Link>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-[var(--tott-accent-gold)] px-5 py-2 text-sm font-semibold text-[var(--tott-on-accent)] transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {busy ? t("form.saving") : isEdit ? t("form.save") : t("form.create")}
          </button>
        </div>
      </form>
    </div>
  );
}