import type { TaskPriority, TaskStatus } from "@/services/tasks.service";

const STATUS_COLOR: Record<TaskStatus, string> = {
  pending: "var(--tott-status-amber)",
  in_progress: "var(--tott-status-amber)",
  completed: "var(--tott-status-emerald)",
  cancelled: "var(--tott-status-coral)",
};

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  low: "var(--tott-muted)",
  medium: "var(--tott-status-amber)",
  high: "var(--tott-status-coral)",
};

export function StatusBadge({
  status,
  label,
}: {
  status: TaskStatus;
  label: string;
}) {
  const color = STATUS_COLOR[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        color,
        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
      }}
    >
      {label}
    </span>
  );
}

export function PriorityBadge({
  priority,
  label,
}: {
  priority: TaskPriority;
  label: string;
}) {
  const color = PRIORITY_COLOR[priority];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        color,
        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
      }}
    >
      {label}
    </span>
  );
}
