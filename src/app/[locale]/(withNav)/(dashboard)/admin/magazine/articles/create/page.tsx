"use client";

import { CreateContentEditor } from "@/components/dashboard/admin/articles/articles-editor/CreateContentEditor";
import { articleConfig } from "@/components/dashboard/admin/articles/articles-editor/content-form-config";

/** Magazine article authoring lives under the magazine route (not /admin/articles)
 * so the URL, back link, and context all read as magazine. product is pinned to
 * 'magazine'; issue_id/magazine_id still flow via query params when authoring
 * from inside an issue. */
export default function AdminMagazineArticleCreatePage() {
  return (
    <CreateContentEditor
      config={articleConfig}
      forceProduct="magazine"
      defaultReturn="/admin/magazine/articles"
    />
  );
}
