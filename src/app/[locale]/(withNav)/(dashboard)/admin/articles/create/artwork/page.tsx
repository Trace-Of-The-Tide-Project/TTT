"use client";

import { ContentEditorLayout } from "@/components/dashboard/admin/articles/articles-editor/ContentEditorLayout";
import { artworkConfig } from "@/components/dashboard/admin/articles/articles-editor/content-form-config";

export default function ArtworkEditorPage() {
  return <ContentEditorLayout config={artworkConfig} />;
}
