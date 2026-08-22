"use client";

import { CreateContentEditor } from "@/components/dashboard/admin/articles/articles-editor/CreateContentEditor";
import { threadConfig } from "@/components/dashboard/admin/articles/articles-editor/content-form-config";

export default function MagazineCreateThreadPage() {
  return (
    <CreateContentEditor
      config={threadConfig}
      forceProduct="magazine"
      defaultReturn="/admin/magazine/articles"
    />
  );
}
