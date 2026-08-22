"use client";

import { CreateContentEditor } from "@/components/dashboard/admin/articles/articles-editor/CreateContentEditor";
import { artworkConfig } from "@/components/dashboard/admin/articles/articles-editor/content-form-config";

export default function MagazineCreateArtworkPage() {
  return (
    <CreateContentEditor
      config={artworkConfig}
      forceProduct="magazine"
      defaultReturn="/admin/magazine/articles"
    />
  );
}
