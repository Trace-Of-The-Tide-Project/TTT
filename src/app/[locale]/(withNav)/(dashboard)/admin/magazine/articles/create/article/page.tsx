"use client";

import { CreateContentEditor } from "@/components/dashboard/admin/articles/articles-editor/CreateContentEditor";
import { articleConfig } from "@/components/dashboard/admin/articles/articles-editor/content-form-config";

export default function MagazineCreateArticlePage() {
  return (
    <CreateContentEditor
      config={articleConfig}
      forceProduct="magazine"
      defaultReturn="/admin/magazine/articles"
    />
  );
}
