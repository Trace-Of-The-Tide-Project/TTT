"use client";

import { CreateContentEditor } from "@/components/dashboard/admin/articles/articles-editor/CreateContentEditor";
import { literaryConfig } from "@/components/dashboard/admin/articles/articles-editor/content-form-config";

export default function MagazineCreateLiteraryPage() {
  return (
    <CreateContentEditor
      config={literaryConfig}
      forceProduct="magazine"
      defaultReturn="/admin/magazine/articles"
    />
  );
}
