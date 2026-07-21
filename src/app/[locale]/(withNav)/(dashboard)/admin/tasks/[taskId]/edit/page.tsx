import { TaskFormContent } from "@/components/dashboard/admin/tasks";

type PageProps = {
  params: Promise<{ taskId: string }>;
};

export default async function AdminEditTaskPage({ params }: PageProps) {
  const { taskId } = await params;
  return <TaskFormContent key={taskId} taskId={taskId} />;
}
