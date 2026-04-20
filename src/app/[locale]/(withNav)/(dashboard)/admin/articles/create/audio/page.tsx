"use client";

import { ContentEditorLayout } from "@/components/dashboard/admin/articles/articles-editor/ContentEditorLayout";
import { audioConfig } from "@/components/dashboard/admin/articles/articles-editor/content-form-config";

export default function AudioEditorPage() {
  return <ContentEditorLayout config={audioConfig} />;
}
