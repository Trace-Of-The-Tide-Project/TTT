"use client";

import { CreateContentEditor } from "@/components/dashboard/admin/articles/articles-editor/CreateContentEditor";
import { artworkConfig } from "@/components/dashboard/admin/articles/articles-editor/content-form-config";

export default function ArtworkEditorPage() {
  return <CreateContentEditor config={artworkConfig} />;
}
