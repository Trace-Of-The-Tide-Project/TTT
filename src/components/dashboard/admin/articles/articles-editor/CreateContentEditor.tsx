"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  ContentEditorLayout,
  type ContentEditorLayoutProps,
} from "./ContentEditorLayout";
import type { ContentFormConfig } from "./content-form-config";

/**
 * Create-mode wrapper for the per-content-type create routes. Reads the
 * "Add translation" query params (`?translation_of=&language=`) so a new piece
 * links to an existing translation group on save, and the issue-scoped create
 * params (`?issue_id=&magazine_id=`) so a magazine issue can author its own
 * articles directly. useSearchParams requires a Suspense boundary in the App
 * Router, provided here.
 */
function Inner({ config }: { config: ContentFormConfig }) {
  const params = useSearchParams();
  const props: ContentEditorLayoutProps = {
    config,
    initialTranslationOf: params.get("translation_of") ?? undefined,
    initialLanguage: params.get("language") ?? undefined,
    initialIssueId: params.get("issue_id") ?? undefined,
    initialMagazineId: params.get("magazine_id") ?? undefined,
    returnTo: params.get("return") ?? undefined,
  };
  return <ContentEditorLayout {...props} />;
}

export function CreateContentEditor({ config }: { config: ContentFormConfig }) {
  return (
    <Suspense fallback={null}>
      <Inner config={config} />
    </Suspense>
  );
}
