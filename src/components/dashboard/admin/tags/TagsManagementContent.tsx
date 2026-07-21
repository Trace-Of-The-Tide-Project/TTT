"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { adminTagsKeys, useTagsList } from "@/hooks/queries/admin-tags";
import { createTag, deleteTag, updateTag, type Tag, type TagInput } from "@/services/admin-tags.service";
import { mutationToast } from "@/hooks/useMutationToast";
import { formatApiError } from "@/lib/api/error-message";
import { dirFor } from "@/i18n/dir";

const I18N_LOCALES = ["en", "ar", "es", "fr"] as const;

function emptyForm(): TagInput {
  return { name: "", description: "", name_i18n: {} };
}

export function TagsManagementContent() {
  const t = useTranslations("Dashboard.tags");
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Tag | "new" | null>(null);
  const [form, setForm] = useState<TagInput>(emptyForm());
  const [pendingDelete, setPendingDelete] = useState<Tag | null>(null);

  const { data: tags = [], isPending } = useTagsList({ search: search || undefined, limit: 100 });

  const invalidate = () => qc.invalidateQueries({ queryKey: adminTagsKeys.all });

  const createMutation = useMutation({
    mutationFn: (payload: TagInput) =>
      mutationToast(() => createTag(payload), {
        loading: t("toasts.creating"),
        success: t("toasts.created"),
        error: t("errors.createFailed"),
      }),
    onSuccess: () => {
      invalidate();
      setEditing(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TagInput> }) =>
      mutationToast(() => updateTag(id, payload), {
        loading: t("toasts.updating"),
        success: t("toasts.updated"),
        error: t("errors.updateFailed"),
      }),
    onSuccess: () => {
      invalidate();
      setEditing(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTag(id),
    onSuccess: () => {
      toast.success(t("toasts.deleted"));
      invalidate();
      setPendingDelete(null);
    },
    onError: (err) => toast.error(formatApiError(err, t("errors.deleteFailed"))),
  });

  function openCreate() {
    setForm(emptyForm());
    setEditing("new");
  }

  function openEdit(tag: Tag) {
    setForm({ name: tag.name, description: tag.description ?? "", name_i18n: tag.name_i18n ?? {} });
    setEditing(tag);
  }

  function submit() {
    if (!form.name.trim()) {
      toast.error(t("errors.nameRequired"));
      return;
    }
    if (editing === "new") {
      createMutation.mutate(form);
    } else if (editing) {
      updateMutation.mutate({ id: editing.id, payload: form });
    }
  }

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-foreground">{t("list.pageTitle")}</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded-lg bg-[var(--tott-accent-gold)] px-4 py-2 text-sm font-semibold text-[var(--tott-on-accent)] hover:opacity-90 transition-opacity"
        >
          + {t("list.addNew")}
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("list.searchPlaceholder")}
        className="w-full max-w-sm rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder:text-[var(--tott-muted)] outline-none focus:border-[var(--tott-accent-gold)]/60"
      />

      {isPending ? (
        <p className="py-12 text-center text-sm text-[var(--tott-muted)]">{t("list.loading")}</p>
      ) : tags.length === 0 ? (
        <p className="rounded-xl border border-[var(--tott-card-border)] py-12 text-center text-sm text-[var(--tott-muted)]">
          {search ? t("list.empty.noMatch") : t("list.empty.none")}
        </p>
      ) : (
        <ul className="space-y-2">
          {tags.map((tag) => (
            <li
              key={tag.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{tag.name}</p>
                {tag.description ? (
                  <p className="truncate text-xs text-[var(--tott-muted)]">{tag.description}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(tag)}
                  className="rounded-md px-3 py-1.5 text-sm text-[var(--tott-dash-gold-label)] hover:text-foreground"
                >
                  {t("list.edit")}
                </button>
                <button
                  type="button"
                  onClick={() => setPendingDelete(tag)}
                  className="rounded-md px-3 py-1.5 text-sm text-red-400 hover:text-red-300"
                >
                  {t("list.delete")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6">
            <h2 className="text-sm font-semibold text-foreground">
              {editing === "new" ? t("form.createTitle") : t("form.editTitle")}
            </h2>

            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-[var(--tott-muted)]">
                  {t("form.fields.name")}
                </span>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder={t("form.fields.namePlaceholder")}
                  className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--tott-accent-gold)]/60"
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-medium text-[var(--tott-muted)]">
                  {t("form.fields.description")}
                </span>
                <textarea
                  value={form.description ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder={t("form.fields.descriptionPlaceholder")}
                  rows={2}
                  className="w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--tott-accent-gold)]/60"
                />
              </label>

              <div>
                <span className="mb-1 block text-xs font-medium text-[var(--tott-muted)]">
                  {t("form.fields.translations")}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {I18N_LOCALES.map((loc) => (
                    <input
                      key={loc}
                      value={form.name_i18n?.[loc] ?? ""}
                      dir={dirFor(loc)}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          name_i18n: { ...f.name_i18n, [loc]: e.target.value },
                        }))
                      }
                      placeholder={loc.toUpperCase()}
                      className="rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground outline-none focus:border-[var(--tott-accent-gold)]/60"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-lg px-4 py-2 text-sm text-[var(--tott-muted)] hover:text-foreground"
              >
                {t("form.cancel")}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={submit}
                className="rounded-lg bg-[var(--tott-accent-gold)] px-4 py-2 text-sm font-semibold text-[var(--tott-on-accent)] hover:opacity-90 disabled:opacity-40"
              >
                {saving ? t("form.saving") : editing === "new" ? t("form.create") : t("form.save")}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {pendingDelete ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] p-6">
            <h2 className="text-sm font-semibold text-foreground">{t("deleteModal.title")}</h2>
            <p className="mt-2 text-sm text-[var(--tott-muted)]">
              {t("deleteModal.description", { name: pendingDelete.name })}
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="rounded-lg px-4 py-2 text-sm text-[var(--tott-muted)] hover:text-foreground"
              >
                {t("deleteModal.cancel")}
              </button>
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(pendingDelete.id)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-[var(--tott-on-media)] hover:bg-red-700 disabled:opacity-40"
              >
                {deleteMutation.isPending ? t("deleteModal.confirmBusy") : t("deleteModal.confirm")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
