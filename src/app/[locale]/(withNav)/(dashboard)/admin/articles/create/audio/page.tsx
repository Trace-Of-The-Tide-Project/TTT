"use client";

import { CreateContentEditor } from "@/components/dashboard/admin/articles/articles-editor/CreateContentEditor";
import { audioConfig } from "@/components/dashboard/admin/articles/articles-editor/content-form-config";

export default function AudioEditorPage() {
  return <CreateContentEditor config={audioConfig} />;
}
