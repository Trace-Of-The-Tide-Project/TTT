"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { OpenCallEditorLayout } from "@/components/dashboard/admin/articles/articles-editor/OpenCallEditorLayout";

function OpenCallEditorWithParams() {
  const params = useSearchParams();
  const translationOf = params.get("translation_of") ?? undefined;
  const language = params.get("language") ?? undefined;
  return <OpenCallEditorLayout initialTranslationOf={translationOf} initialLanguage={language} />;
}

export default function CreateOpenCallPage() {
  return (
    <Suspense fallback={null}>
      <OpenCallEditorWithParams />
    </Suspense>
  );
}
