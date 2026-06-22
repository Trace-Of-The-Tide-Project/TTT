"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { usePerson } from "@/hooks/queries/people";
import { useCreatePerson, useUpdatePerson } from "@/hooks/mutations/people";
import { uploadArticleAssetPath } from "@/services/uploads.service";
import type { PersonProfilePayload } from "@/services/people.service";
import { formatApiError } from "@/lib/api/error-message";
import { AvatarUploadZone } from "@/components/dashboard/admin/writers/form-controls";
import { toast } from "sonner";

type FormState = {
  full_name: string;
  biography: string;
  portrait: string;
  birth_date: string;
  death_date: string;
};

const EMPTY: FormState = {
  full_name: "",
  biography: "",
  portrait: "",
  birth_date: "",
  death_date: "",
};

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder-gray-500 outline-none focus:border-[var(--tott-gold)]/60 transition-colors";
const labelClass = "text-xs font-medium text-[var(--tott-dash-gold-label)] mb-1 block";
const sectionClass =
  "rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-elevated,#111)] p-5 space-y-4";
const sectionHeadingClass =
  "text-[10px] font-semibold uppercase tracking-widest text-[var(--tott-dash-gold-label)]";

type Props = { personId?: string };

export function PersonFormContent({ personId }: Props) {
  const router = useRouter();
  const isEdit = Boolean(personId);

  const personQuery = usePerson(personId);
  const createMutation = useCreatePerson();
  const updateMutation = useUpdatePerson();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [seeded, setSeeded] = useState(false);
  const [uploadingPortrait, setUploadingPortrait] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Seed form from existing record in edit mode.
  useEffect(() => {
    if (!isEdit || seeded || !personQuery.data) return;
    const p = personQuery.data;
    setForm({
      full_name: p.full_name ?? "",
      biography: p.biography ?? "",
      portrait: p.portrait ?? "",
      birth_date: p.birth_date ? p.birth_date.slice(0, 10) : "",
      death_date: p.death_date ? p.death_date.slice(0, 10) : "",
    });
    setSeeded(true);
  }, [isEdit, seeded, personQuery.data]);

  const set = useCallback(
    (key: keyof FormState, value: string) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    [],
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
        toast.error("Portrait upload failed");
      } finally {
        setUploadingPortrait(false);
      }
    },
    [set],
  );

  const buildPayload = (): PersonProfilePayload => ({
    full_name: form.full_name.trim(),
    biography: form.biography.trim() || null,
    portrait: form.portrait.trim() || null,
    birth_date: form.birth_date || null,
    death_date: form.death_date || null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.full_name.trim()) {
      setFormError("Full name is required.");
      return;
    }

    const payload = buildPayload();

    if (isEdit && personId) {
      updateMutation.mutate(
        { personId, payload },
        {
          onSuccess: () => {
            toast.success("Person updated");
            router.push("/admin/people");
          },
          onError: (err) => setFormError(formatApiError(err, "Update failed")),
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Person created");
          router.push("/admin/people");
        },
        onError: (err) => setFormError(formatApiError(err, "Create failed")),
      });
    }
  };

  const busy = createMutation.isPending || updateMutation.isPending || uploadingPortrait;
  const loadingEdit = isEdit && personQuery.isPending;

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8 px-4">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/people"
          className="text-xs text-[var(--tott-muted)] hover:text-foreground"
        >
          ← People
        </Link>
        <h1 className="text-lg font-semibold">
          {isEdit ? "Edit person" : "Add person"}
        </h1>
      </div>

      {loadingEdit ? (
        <div className="py-12 text-center text-sm text-gray-400">Loading…</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identity */}
          <div className={sectionClass}>
            <p className={sectionHeadingClass}>Identity</p>

            <div>
              <label className={labelClass}>Full name *</label>
              <input
                className={inputClass}
                value={form.full_name}
                onChange={(e) => set("full_name", e.target.value)}
                placeholder="e.g. Mahmoud Darwish"
                disabled={busy}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Birth date</label>
                <input
                  type="date"
                  className={inputClass}
                  value={form.birth_date}
                  onChange={(e) => set("birth_date", e.target.value)}
                  disabled={busy}
                />
              </div>
              <div>
                <label className={labelClass}>Death date</label>
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
              <label className={labelClass}>Portrait</label>
              <AvatarUploadZone
                value={form.portrait}
                uploading={uploadingPortrait}
                onChange={handlePortraitUpload}
                labels={{
                  uploading: "Uploading…",
                  click: "Click or drag portrait image",
                  hint: "JPG, PNG, WebP — recommended square",
                  change: "Change",
                }}
              />
            </div>
          </div>

          {/* Biography */}
          <div className={sectionClass}>
            <p className={sectionHeadingClass}>Biography</p>
            <div>
              <label className={labelClass}>Biography</label>
              <textarea
                rows={6}
                className={inputClass}
                value={form.biography}
                onChange={(e) => set("biography", e.target.value)}
                placeholder="Short biographical summary…"
                disabled={busy}
              />
            </div>
          </div>

          {formError && (
            <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-3 text-sm text-red-200">
              {formError}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/admin/people"
              className="rounded-lg px-4 py-2 text-sm text-gray-400 hover:text-foreground"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-[var(--tott-gold)] px-5 py-2 text-sm font-semibold text-black hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {busy ? "Saving…" : isEdit ? "Save changes" : "Create person"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
