"use client";

import { useEffect, useRef, type RefObject } from "react";

const POST_DEBOUNCE_MS = 150;

/**
 * Posts `draft` into the given iframe over `postMessage`, debounced
 * ~150ms so fast typing doesn't spam re-renders, and re-posts once on
 * the iframe's `load` event so a late-mounting/reloading frame isn't
 * left showing stale (or server-only) content.
 *
 * Always passes an explicit `targetOrigin` (`window.location.origin`)
 * — never `"*"` — so the draft (which may include unsaved copy) can't
 * leak to a different origin if the iframe ever navigates away.
 */
export function useCmsPreviewChannel({
  iframeRef,
  draft,
  messageType,
}: {
  iframeRef: RefObject<HTMLIFrameElement | null>;
  draft: unknown;
  messageType: string;
}) {
  const draftRef = useRef(draft);
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    function post() {
      const win = iframeRef.current?.contentWindow;
      if (!win) return;
      win.postMessage({ type: messageType, payload: draftRef.current }, window.location.origin);
    }

    const timer = setTimeout(post, POST_DEBOUNCE_MS);
    const iframe = iframeRef.current;
    iframe?.addEventListener("load", post);
    return () => {
      clearTimeout(timer);
      iframe?.removeEventListener("load", post);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- post() reads draftRef.current (kept fresh above) and iframeRef.current; re-run on draft change + once on mount for the load listener
  }, [draft, messageType]);
}
