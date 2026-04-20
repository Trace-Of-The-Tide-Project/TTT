"use client";

import { ContentEditorLayout } from "@/components/dashboard/admin/articles/articles-editor/ContentEditorLayout";
import { videoConfig } from "@/components/dashboard/admin/articles/articles-editor/content-form-config";

export default function VideoEditorPage() {
  return <ContentEditorLayout config={videoConfig} />;
}
