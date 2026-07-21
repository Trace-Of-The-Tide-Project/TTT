import { api } from "./api";

export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high";

type TaskPerson = {
  id: string;
  username?: string | null;
  full_name?: string | null;
};

export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
  completed_at?: string | null;
  assignee_id: string;
  assigner_id: string;
  article_id?: string | null;
  contribution_id?: string | null;
  open_call_id?: string | null;
  assignee?: TaskPerson | null;
  assigner?: TaskPerson | null;
  article?: { id: string; title: string; slug?: string } | null;
  contribution?: { id: string; title: string; status?: string } | null;
  openCall?: { id: string; title: string; status?: string } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateTaskPayload = {
  title: string;
  assignee_id: string;
  description?: string;
  priority?: TaskPriority;
  due_date?: string;
  article_id?: string;
  contribution_id?: string;
  open_call_id?: string;
};

export type UpdateTaskPayload = Partial<CreateTaskPayload> & {
  status?: TaskStatus;
};

export type GetTasksParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
};

export type TasksListMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type TasksResult = { tasks: Task[]; meta: TasksListMeta };

function unwrapList(raw: unknown): Task[] {
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  if (Array.isArray(o.data)) return o.data as Task[];
  if (Array.isArray(o)) return o as unknown as Task[];
  return [];
}

function unwrapOne(raw: unknown): Task | null {
  if (!raw || typeof raw !== "object") return null;
  if ("data" in (raw as object)) {
    const inner = (raw as { data?: unknown }).data;
    if (inner && typeof inner === "object" && "id" in (inner as object)) {
      return inner as Task;
    }
    return null;
  }
  if ("id" in (raw as object)) return raw as Task;
  return null;
}

function parseMeta(
  raw: unknown,
  count: number,
  params?: GetTasksParams,
): TasksListMeta {
  const fallback: TasksListMeta = {
    total: count,
    page: params?.page ?? 1,
    limit: params?.limit ?? Math.max(count, 1),
    totalPages: 1,
  };
  if (!raw || typeof raw !== "object") return fallback;
  const m = (raw as { meta?: unknown }).meta;
  if (!m || typeof m !== "object") return fallback;
  const o = m as Record<string, unknown>;
  const num = (v: unknown, d: number) =>
    typeof v === "number" && Number.isFinite(v) ? v : d;
  return {
    total: num(o.total, fallback.total),
    page: num(o.page, fallback.page),
    limit: num(o.limit, fallback.limit),
    totalPages: Math.max(1, num(o.totalPages, fallback.totalPages)),
  };
}

/** GET /tasks — admin/editor. Errors propagate for the admin list's retry banner. */
export async function getTasksAdmin(params?: GetTasksParams): Promise<TasksResult> {
  const { data } = await api.get<unknown>("/tasks", { params });
  const tasks = unwrapList(data);
  return { tasks, meta: parseMeta(data, tasks.length, params) };
}

/** GET /tasks/my-tasks — any authenticated user, tasks assigned to them. */
export async function getMyTasks(
  params?: Pick<GetTasksParams, "page" | "limit" | "status">,
): Promise<TasksResult> {
  const { data } = await api.get<unknown>("/tasks/my-tasks", { params });
  const tasks = unwrapList(data);
  return { tasks, meta: parseMeta(data, tasks.length, params) };
}

export async function getTask(id: string): Promise<Task | null> {
  try {
    const { data } = await api.get<unknown>(`/tasks/${encodeURIComponent(id)}`);
    return unwrapOne(data);
  } catch {
    return null;
  }
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  const { data } = await api.post<unknown>("/tasks", payload);
  const item = unwrapOne(data);
  if (!item) throw new Error("Invalid response from create task");
  return item;
}

export async function updateTask(
  id: string,
  payload: UpdateTaskPayload,
): Promise<Task> {
  const { data } = await api.patch<unknown>(
    `/tasks/${encodeURIComponent(id)}`,
    payload,
  );
  const item = unwrapOne(data);
  if (!item) throw new Error("Invalid response from update task");
  return item;
}

/** PATCH /tasks/:id/status — the assignee moves their own task along. */
export async function updateTaskStatus(
  id: string,
  status: TaskStatus,
): Promise<Task> {
  const { data } = await api.patch<unknown>(
    `/tasks/${encodeURIComponent(id)}/status`,
    { status },
  );
  const item = unwrapOne(data);
  if (!item) throw new Error("Invalid response from update task status");
  return item;
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${encodeURIComponent(id)}`);
}

/** Best display name for a task's person reference. */
export function taskPersonName(p?: TaskPerson | null): string {
  return p?.full_name?.trim() || p?.username?.trim() || "—";
}
