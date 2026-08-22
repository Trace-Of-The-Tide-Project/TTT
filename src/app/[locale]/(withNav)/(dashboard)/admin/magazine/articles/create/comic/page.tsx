"use client";

import { CreateContentEditor } from "@/components/dashboard/admin/articles/articles-editor/CreateContentEditor";
import { comicConfig } from "@/components/dashboard/admin/articles/articles-editor/content-form-config";

export default function MagazineCreateComicPage() {
  return (
    <CreateContentEditor
      config={comicConfig}
      forceProduct="magazine"
      defaultReturn="/admin/magazine/articles"
    />
  );
}
