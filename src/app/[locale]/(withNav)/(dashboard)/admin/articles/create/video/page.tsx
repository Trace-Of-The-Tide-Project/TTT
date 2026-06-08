"use client";

import { CreateContentEditor } from "@/components/dashboard/admin/articles/articles-editor/CreateContentEditor";
import { videoConfig } from "@/components/dashboard/admin/articles/articles-editor/content-form-config";

export default function VideoEditorPage() {
  return <CreateContentEditor config={videoConfig} />;
}
