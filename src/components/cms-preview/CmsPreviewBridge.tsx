"use client";

import { useEffect, useState } from "react";
import type { CmsPage } from "@/services/cms.service";

const MESSAGE_TYPE = "tott:cms-preview" as const;

function isCmsPage(v: unknown): v is CmsPage {
  if (!v || typeof v !== "object") return false;
  const p = v as Record<string, unknown>;
  return typeof p.id === "string" && Array.isArray(p.sections);
}

/**
 * Client shim mounted on a public route rendered with `?cmsPreview=1`
 * (only ever reached after the server-side auth gate in the page — see
 * `src/lib/auth/cms-preview-gate.ts`). Listens for the admin editor's
 * postMessage'd draft `CmsPage` and renders it via a render-prop in
 * place of the server-fetched one, so unsaved edits show up live.
 *
 * Trust boundary: this still validates independently of the server
 * gate, because `message` events can originate from anywhere in the
 * browser (extensions, other same-origin tabs/frames) even when the
 * page itself is legitimately in preview mode — reject any event whose
 * `origin` isn't our own origin, and whose payload doesn't look like a
 * CmsPage, before ever touching it.
 */
export function CmsPreviewBridge({
  serverPage,
  children,
}: {
  serverPage: CmsPage | null;
  children: (page: CmsPage | null) => React.ReactNode;
}) {
  const [draft, setDraft] = useState<CmsPage | null>(null);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: unknown; payload?: unknown };
      if (!data || data.type !== MESSAGE_TYPE) return;
      if (!isCmsPage(data.payload)) return;
      setDraft(data.payload);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return <>{children(draft ?? serverPage)}</>;
}
