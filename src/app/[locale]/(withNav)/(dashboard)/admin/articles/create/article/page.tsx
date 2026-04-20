"use client";

import { ContentEditorLayout } from "@/components/dashboard/admin/articles/articles-editor/ContentEditorLayout";
import { articleConfig } from "@/components/dashboard/admin/articles/articles-editor/content-form-config";

export default function ArticleEditorPage() {
  return <ContentEditorLayout config={articleConfig} />;
}
