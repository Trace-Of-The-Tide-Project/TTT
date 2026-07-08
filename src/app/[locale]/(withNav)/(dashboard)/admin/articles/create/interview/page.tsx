"use client";

import { CreateContentEditor } from "@/components/dashboard/admin/articles/articles-editor/CreateContentEditor";
import { interviewConfig } from "@/components/dashboard/admin/articles/articles-editor/content-form-config";

export default function InterviewEditorPage() {
  return <CreateContentEditor config={interviewConfig} />;
}
