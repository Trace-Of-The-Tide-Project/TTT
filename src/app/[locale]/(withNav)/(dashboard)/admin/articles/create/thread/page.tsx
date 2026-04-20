"use client";

import { ContentEditorLayout } from "@/components/dashboard/admin/articles/articles-editor/ContentEditorLayout";
import { threadConfig } from "@/components/dashboard/admin/articles/articles-editor/content-form-config";

export default function ThreadEditorPage() {
  return <ContentEditorLayout config={threadConfig} />;
}
