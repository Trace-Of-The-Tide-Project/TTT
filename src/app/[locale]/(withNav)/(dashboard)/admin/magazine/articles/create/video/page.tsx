"use client";

import { CreateContentEditor } from "@/components/dashboard/admin/articles/articles-editor/CreateContentEditor";
import { videoConfig } from "@/components/dashboard/admin/articles/articles-editor/content-form-config";

export default function MagazineCreateVideoPage() {
  return (
    <CreateContentEditor
      config={videoConfig}
      forceProduct="magazine"
      defaultReturn="/admin/magazine/articles"
    />
  );
}
