"use client";

import { CreateContentEditor } from "@/components/dashboard/admin/articles/articles-editor/CreateContentEditor";
import { literaryConfig } from "@/components/dashboard/admin/articles/articles-editor/content-form-config";

export default function LiteraryEditorPage() {
  return <CreateContentEditor config={literaryConfig} />;
}
