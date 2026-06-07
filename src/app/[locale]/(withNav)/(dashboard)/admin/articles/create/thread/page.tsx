"use client";

import { CreateContentEditor } from "@/components/dashboard/admin/articles/articles-editor/CreateContentEditor";
import { threadConfig } from "@/components/dashboard/admin/articles/articles-editor/content-form-config";

export default function ThreadEditorPage() {
  return <CreateContentEditor config={threadConfig} />;
}
