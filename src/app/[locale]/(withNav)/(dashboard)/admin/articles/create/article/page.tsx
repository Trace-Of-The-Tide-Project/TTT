"use client";

import { CreateContentEditor } from "@/components/dashboard/admin/articles/articles-editor/CreateContentEditor";
import { articleConfig } from "@/components/dashboard/admin/articles/articles-editor/content-form-config";

export default function ArticleEditorPage() {
  return <CreateContentEditor config={articleConfig} />;
}
