"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, Link } from "@/i18n/navigation";
import { toast } from "sonner";
import { useSession, sessionsKeys } from "@/hooks/queries/sessions";
import { useCreateSession, useUpdateSession } from "@/hooks/mutations/sessions";
import type { EventSession, SessionPayload } from "@/services/sessions.service";
import { formatApiError } from "@/lib/api/error-message";

type FormState = {
  space: string;
  type: string;
  title: string;
  description: string;
  facilitator_id: string;
  starts_at: string; // datetime-local value
  duration_minutes: string;
  capacity: string;
  awna_seats: string;
  format: string;
  access_rule: string;
  price: string;
  currency: string;
  required_tier_rank: string;
  status: string;
};

const EMPTY: FormState = {
  space: "writing_room",
  type: "",
  title: "",
  description: "",
  facilitator_id: "",
  starts_at: "",
  duration_minutes: "",
  capacity: "",
  awna_seats: "1",
  format: "online",
  access_rule: "mixed",
  price: "",
  currency: "USD",
  required_tier_rank: "",
  status: "draft",
};

function seedFromSession(s: EventSession): FormState {
  return {
    space: s.space,
    type: s.type ?? "",
    title: s.title,
    description: s.description ?? "",
    facilitator_id: s.facilitator_id ?? "",
    starts_at: s.starts_at ? s.starts_at.slice(0, 16) : "",
    duration_minutes: s.duration_minutes != null ? String(s.duration_minutes) : "",
    capacity: s.capacity != null ? String(s.capacity) : "",
    awna_seats: String(s.awna_seats ?? 1),
    format: s.format,
    access_rule: s.access_rule ?? "mixed",
    price: s.price != null ? String(s.price) : "",
    currency: s.currency ?? "USD",
    required_tier_rank: s.required_tier_rank != null ? String(s.required_tier_rank) : "",
    status: s.status,
  };
}

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--tott-muted)] outline-none focus:border-[var(--tott-accent-gold)]/60 transition-colors";
const labelClass = "text-xs font-medium text-[var(--tott-dash-gold-label)] mb-1 block";
const sectionClass =
  "rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] p-5 space-y-4";
const sectionHeadingClass =
  "text-[10px] font-semibold uppercase tracking-widest text-[var(--tott-dash-gold-label)]";

type Props = { sessionId?: string };

export function SessionFormContent({ sessionId }: Props) {
  const t = useTranslations("Dashboard.sessions");
  const router = useRouter();
  const qc = useQueryClient();
  const isEdit = Boolean(sessionId);

  const sessionQuery = useSession(sessionId);
  const createMutation = useCreateSession();
  const updateMutation = useUpdateSession();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [seeded, setSeeded] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || seeded || !sessionQuery.data) return;
    setForm(seedFromSession(sessionQuery.data));
    setSeeded(true);
  }, [isEdit, seeded, sessionQuery.data]);

  const set = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const busy = createMutation.isPending || updateMutation.isPending;
  const loadingEdit = isEdit && sessionQuery.isPending;

  const buildPayload = (): SessionPayload => ({
    space: form.space as SessionPayload["space"],
    type: form.type.trim() || null,
    title: form.title.trim(),
    description: form.description.trim() || null,
    facilitator_id: form.facilitator_id.trim() || null,
    starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
    duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
    capacity: form.capacity ? Number(form.capacity) : null,
    awna_seats: Number(form.awna_seats) || 1,
    format: form.format as SessionPayload["format"],
    access_rule: form.access_rule,
    price: form.price ? Number(form.price) : null,
    currency: form.currency.trim() || null,
    required_tier_rank: form.required_tier_rank ? Number(form.required_tier_rank) : null,
    status: form.status,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (busy) return;

    if (!form.title.trim()) {
      setFormError(t("form.errors.titleRequired"));
      return;
    }
    if (!form.awna_seats || Number(form.awna_seats) < 1) {
      setFormError(t("form.errors.awnaSeatsRequired"));
      return;
    }

    try {
      if (isEdit && sessionId) {
        await updateMutation.mutateAsync({ sessionId, payload: buildPayload() });
        qc.invalidateQueries({ queryKey: sessionsKeys.byId(sessionId) });
        toast.success(t("form.toasts.updated"));
      } else {
        await createMutation.mutateAsync(buildPayload());
        toast.success(t("form.toasts.created"));
      }
      qc.invalidateQueries({ queryKey: sessionsKeys.all });
      router.push("/admin/sessions");
    } catch (err) {
      setFormError(
        formatApiError(err, isEdit ? t("form.errors.updateFailed") : t("form.errors.createFailed")),
      );
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8 px-4">
      <div className="flex items-center gap-3">
        <Link href="/admin/sessions" className="text-xs text-[var(--tott-muted)] hover:text-foreground">
          ← {t("form.backToList")}
        </Link>
        <h1 className="text-lg font-semibold">{isEdit ? t("form.editTitle") : t("form.createTitle")}</h1>
      </div>

      {loadingEdit ? (
        <div className="py-12 text-center text-sm text-[var(--tott-muted)]">{t("form.loading")}</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className={sectionClass}>
            <p className={sectionHeadingClass}>{t("form.sections.basics")}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("form.fields.space")} *</label>
                <select
                  className={inputClass}
                  value={form.space}
                  onChange={(e) => set("space", e.target.value)}
                  disabled={busy}
                >
                  <option value="writing_room">{t("list.space.writingRoom")}</option>
                  <option value="waqamh">{t("list.space.waqamh")}</option>
                </select>
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
              <label className={labelClass}>{t("form.fields.description")}</label>
              <textarea
                rows={4}
                className={inputClass}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                disabled={busy}
              />
            </div>

            <div>
              <label className={labelClass}>{t("form.fields.facilitatorId")}</label>
              <input
                className={inputClass}
                value={form.facilitator_id}
                onChange={(e) => set("facilitator_id", e.target.value)}
                placeholder={t("form.fields.facilitatorIdPlaceholder")}
                disabled={busy}
              />
            </div>
          </div>

          <div className={sectionClass}>
            <p className={sectionHeadingClass}>{t("form.sections.scheduling")}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("form.fields.startsAt")}</label>
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={form.starts_at}
                  onChange={(e) => set("starts_at", e.target.value)}
                  disabled={busy}
                />
              </div>
              <div>
                <label className={labelClass}>{t("form.fields.durationMinutes")}</label>
                <input
                  type="number"
                  min={1}
                  className={inputClass}
                  value={form.duration_minutes}
                  onChange={(e) => set("duration_minutes", e.target.value)}
                  disabled={busy}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("form.fields.format")} *</label>
                <select
                  className={inputClass}
                  value={form.format}
                  onChange={(e) => set("format", e.target.value)}
                  disabled={busy}
                >
                  <option value="online">{t("form.formatOptions.online")}</option>
                  <option value="in_person">{t("form.formatOptions.inPerson")}</option>
                  <option value="hybrid">{t("form.formatOptions.hybrid")}</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t("form.fields.status")}</label>
                <select
                  className={inputClass}
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                  disabled={busy}
                >
                  <option value="draft">{t("list.status.draft")}</option>
                  <option value="published">{t("list.status.published")}</option>
                  <option value="cancelled">{t("list.status.cancelled")}</option>
                  <option value="completed">{t("list.status.completed")}</option>
                </select>
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <p className={sectionHeadingClass}>{t("form.sections.seatsAccess")}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("form.fields.capacity")}</label>
                <input
                  type="number"
                  min={1}
                  className={inputClass}
                  value={form.capacity}
                  onChange={(e) => set("capacity", e.target.value)}
                  placeholder={t("form.fields.capacityPlaceholder")}
                  disabled={busy}
                />
              </div>
              <div>
                <label className={labelClass}>{t("form.fields.awnaSeats")} *</label>
                <input
                  type="number"
                  min={1}
                  className={inputClass}
                  value={form.awna_seats}
                  onChange={(e) => set("awna_seats", e.target.value)}
                  disabled={busy}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("form.fields.accessRule")}</label>
                <select
                  className={inputClass}
                  value={form.access_rule}
                  onChange={(e) => set("access_rule", e.target.value)}
                  disabled={busy}
                >
                  <option value="free">{t("form.accessRuleOptions.free")}</option>
                  <option value="paid">{t("form.accessRuleOptions.paid")}</option>
                  <option value="member_included">{t("form.accessRuleOptions.memberIncluded")}</option>
                  <option value="mixed">{t("form.accessRuleOptions.mixed")}</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>{t("form.fields.requiredTierRank")}</label>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={form.required_tier_rank}
                  onChange={(e) => set("required_tier_rank", e.target.value)}
                  placeholder={t("form.fields.requiredTierRankPlaceholder")}
                  disabled={busy}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("form.fields.price")}</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  className={inputClass}
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder={t("form.fields.pricePlaceholder")}
                  disabled={busy}
                />
              </div>
              <div>
                <label className={labelClass}>{t("form.fields.currency")}</label>
                <input
                  className={inputClass}
                  value={form.currency}
                  onChange={(e) => set("currency", e.target.value)}
                  disabled={busy}
                />
              </div>
            </div>
          </div>

          {formError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-3 text-sm text-red-400">
              {formError}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/admin/sessions"
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
