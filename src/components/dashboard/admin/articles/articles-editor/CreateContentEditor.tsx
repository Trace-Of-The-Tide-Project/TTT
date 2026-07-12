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
function Inner({
  config,
  forceProduct,
  defaultReturn,
}: {
  config: ContentFormConfig;
  forceProduct?: "magazine";
  defaultReturn?: string;
}) {
  const params = useSearchParams();
  const props: ContentEditorLayoutProps = {
    config,
    initialTranslationOf: params.get("translation_of") ?? undefined,
    initialLanguage: params.get("language") ?? undefined,
    initialIssueId: params.get("issue_id") ?? undefined,
    initialMagazineId: params.get("magazine_id") ?? undefined,
    initialProduct: forceProduct ?? (params.get("product") === "magazine" ? "magazine" : undefined),
    returnTo: params.get("return") ?? defaultReturn ?? undefined,
  };
  return <ContentEditorLayout {...props} />;
}

/** `forceProduct`/`defaultReturn` let a dedicated magazine route pin the
 * product and landing page without relying on query params. */
export function CreateContentEditor({
  config,
  forceProduct,
  defaultReturn,
}: {
  config: ContentFormConfig;
  forceProduct?: "magazine";
  defaultReturn?: string;
}) {
  return (
    <Suspense fallback={null}>
      <Inner config={config} forceProduct={forceProduct} defaultReturn={defaultReturn} />
    </Suspense>
  );
}
