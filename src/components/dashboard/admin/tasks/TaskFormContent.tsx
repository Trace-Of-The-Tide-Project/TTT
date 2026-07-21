"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Link, useRouter } from "@/i18n/navigation";
import { useTask } from "@/hooks/queries/tasks";
import { useCreateTask, useUpdateTask } from "@/hooks/mutations/tasks";
import type { CreateTaskPayload, Task, TaskPriority, TaskStatus } from "@/services/tasks.service";
import type { AdminUserListItem } from "@/services/users.service";
import { formatApiError } from "@/lib/api/error-message";
import { AssigneePicker } from "./AssigneePicker";

const PRIORITIES: TaskPriority[] = ["low", "medium", "high"];
const STATUSES: TaskStatus[] = ["pending", "in_progress", "completed", "cancelled"];

type FormState = {
  title: string;
  description: string;
  priority: TaskPriority;
  due_date: string;
  status: TaskStatus;
};

const EMPTY: FormState = {
  title: "",
  description: "",
  priority: "medium",
  due_date: "",
  status: "pending",
};

function seedFromTask(task: Task): FormState {
  return {
    title: task.title,
    description: task.description ?? "",
    priority: task.priority,
    due_date: task.due_date ? task.due_date.slice(0, 10) : "",
    status: task.status,
  };
}

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-input-bg)] px-3 py-2 text-sm text-foreground placeholder-[var(--tott-muted)] outline-none focus:border-[var(--tott-accent-gold)]/60 transition-colors";
const labelClass = "text-xs font-medium text-[var(--tott-dash-gold-label)] mb-1 block";
const sectionClass =
  "rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] p-5 space-y-4";
const sectionHeadingClass =
  "text-[10px] font-semibold uppercase tracking-widest text-[var(--tott-dash-gold-label)]";

type Props = { taskId?: string };

export function TaskFormContent({ taskId }: Props) {
  const t = useTranslations("Dashboard.tasks.form");
  const tTask = useTranslations("Dashboard.tasks");
  const router = useRouter();
  const isEdit = Boolean(taskId);

  const taskQuery = useTask(taskId);
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [assignee, setAssignee] = useState<AdminUserListItem | null>(null);
  const [seeded, setSeeded] = useState(false);
  const [assigneeError, setAssigneeError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || seeded || !taskQuery.data) return;
    setForm(seedFromTask(taskQuery.data));
    const a = taskQuery.data.assignee;
    if (a) {
      setAssignee({
        id: a.id,
        full_name: a.full_name ?? "",
        username: a.username ?? "",
        email: "",
        status: "active",
        role: "user",
      } as AdminUserListItem);
    }
    setSeeded(true);
  }, [isEdit, seeded, taskQuery.data]);

  const set = useCallback(
    (field: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value })),
    [],
  );

  const busy = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setSubmitError(null);
    setAssigneeError(null);

    if (!isEdit && !assignee) {
      setAssigneeError(t("errors.assigneeRequired"));
      return;
    }

    try {
      if (isEdit && taskId) {
        await updateMutation.mutateAsync({
          taskId,
          payload: {
            title: form.title.trim(),
            description: form.description.trim() || undefined,
            priority: form.priority,
            due_date: form.due_date || undefined,
            status: form.status,
            ...(assignee ? { assignee_id: assignee.id } : {}),
          },
        });
        toast.success(t("toasts.updated"));
      } else {
        const payload: CreateTaskPayload = {
          title: form.title.trim(),
          assignee_id: assignee!.id,
          description: form.description.trim() || undefined,
          priority: form.priority,
          due_date: form.due_date || undefined,
        };
        await createMutation.mutateAsync(payload);
        toast.success(t("toasts.created"));
      }
      router.push("/admin/tasks");
    } catch (err) {
      setSubmitError(formatApiError(err, t("errors.saveFailed")));
    }
  };

  if (isEdit && taskQuery.isPending) {
    return <div className="my-4 mx-10 text-sm text-[var(--tott-muted)]">{t("loading")}</div>;
  }

  if (isEdit && !taskQuery.data) {
    return (
      <div className="my-4 mx-10">
        <Link
          href="/admin/tasks"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--tott-muted)] hover:text-foreground transition-colors mb-5"
        >
          {t("backToList")}
        </Link>
        <p className="text-sm text-[var(--tott-muted)]">{t("notFound")}</p>
      </div>
    );
  }

  return (
    <div className="my-4 mx-auto px-10 pb-12 max-w-2xl">
      <Link
        href="/admin/tasks"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--tott-muted)] hover:text-foreground transition-colors mb-5"
      >
        {t("backToList")}
      </Link>

      <h1 className="mb-6 text-xl font-semibold text-foreground">
        {isEdit ? t("editTitle") : t("createTitle")}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className={sectionClass}>
          <p className={sectionHeadingClass}>{t("sections.details")}</p>
          <div>
            <label className={labelClass}>{t("fields.title")}</label>
            <input
              type="text"
              required
              className={inputClass}
              value={form.title}
              onChange={set("title")}
            />
          </div>
          <div>
            <label className={labelClass}>{t("fields.description")}</label>
            <textarea
              className={`${inputClass} min-h-[100px]`}
              value={form.description}
              onChange={set("description")}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>{t("fields.priority")}</label>
              <select className={inputClass} value={form.priority} onChange={set("priority")}>
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {tTask(`priority.${p}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>{t("fields.dueDate")}</label>
              <input type="date" className={inputClass} value={form.due_date} onChange={set("due_date")} />
            </div>
          </div>
          {isEdit && (
            <div>
              <label className={labelClass}>{t("fields.status")}</label>
              <select className={inputClass} value={form.status} onChange={set("status")}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {tTask(`status.${s}`)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className={sectionClass}>
          <p className={sectionHeadingClass}>{t("sections.assignee")}</p>
          <AssigneePicker
            value={assignee}
            onChange={(u) => {
              setAssignee(u);
              setAssigneeError(null);
            }}
            disabled={busy}
          />
          {assigneeError && <p className="text-xs text-red-400">{assigneeError}</p>}
        </div>

        {submitError && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-400">
            {submitError}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--tott-accent-gold)]/60 bg-[var(--tott-accent-gold)]/10 px-5 py-2 text-sm font-medium text-[var(--tott-dash-gold-text)] hover:bg-[var(--tott-accent-gold)]/20 disabled:opacity-40 transition-colors"
          >
            {busy && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            )}
            {busy ? (isEdit ? t("saving") : t("creating")) : isEdit ? t("save") : t("create")}
          </button>
          <Link
            href="/admin/tasks"
            className="rounded-lg px-4 py-2 text-sm text-[var(--tott-muted)] hover:text-foreground hover:bg-white/5 transition-colors"
          >
            {t("cancel")}
          </Link>
        </div>
      </form>
    </div>
  );
}
