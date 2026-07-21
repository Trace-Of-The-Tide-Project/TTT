"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useCmsPreviewChannel } from "./useCmsPreviewChannel";

const PREVIEW_DESIGN_WIDTH = 1392;

/**
 * Shared browser-chrome preview mockup — ports the geometry from
 * `MagazinePageEditorContent.tsx`'s `PreviewFrame` (measured-height
 * ResizeObserver + `scale(clientWidth/1392)`), but the body is a real
 * `<iframe>` pointed at the actual public route instead of an
 * in-process React tree. `MagazinePageEditorContent` is left untouched
 * — it keeps its own children-based `PreviewFrame`.
 */
export function CmsPreviewFrame({
  src,
  locale,
  urlLabel,
  draft,
  messageType = "tott:cms-preview",
}: {
  /** Iframe target, e.g. `/en/home?cmsPreview=1`. */
  src: string;
  /** Locale of the previewed content (drives its `dir`, not the admin UI's). */
  locale: string;
  /** Text shown in the mock browser's URL pill. */
  urlLabel: string;
  /** Draft payload posted into the iframe on change (debounced) and on load. */
  draft: unknown;
  /** postMessage `type` literal the receiving bridge listens for. */
  messageType?: string;
}) {
  const t = useTranslations("Dashboard.magazinePageEditor.hero");
  const frameRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0.5);
  const [contentHeight, setContentHeight] = useState(900);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => setScale(frame.clientWidth / PREVIEW_DESIGN_WIDTH);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(frame);
    return () => ro.disconnect();
  }, []);

  useCmsPreviewChannel({ iframeRef, draft, messageType });

  return (
    <div className="flex w-full flex-col gap-2 py-2">
      <div className="flex w-full items-center justify-between px-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--tott-muted)]">
          {t("previewHeading")}
        </span>
        <span className="rounded-full border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--tott-muted)]">
          {locale}
        </span>
      </div>

      {/* dir="ltr" on the whole mockup, even under an Arabic admin UI — see
          MagazinePageEditorContent.tsx:791-800 for why: the scaled box is a
          fixed 1392px width inside a frame narrower than that, and an RTL
          parent would align the box's right edge to the frame, letting it
          overflow leftward so `scale(W/1392)` (origin top-left) leaves a
          dead gutter on the right. Content direction is applied inside the
          iframe by the previewed page itself, driven by `locale`. */}
      <div
        ref={frameRef}
        dir="ltr"
        className="w-full overflow-hidden rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] shadow-lg"
      >
        <div className="flex items-center gap-1.5 border-b border-[var(--tott-card-border)] bg-[var(--tott-elevated)] px-3 py-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]/70" />
          <span className="ms-3 truncate rounded bg-[var(--tott-dash-input-bg)] px-2 py-0.5 text-[10px] font-mono text-[var(--tott-muted)]">
            {urlLabel}
          </span>
        </div>

        <div
          className="relative overflow-hidden"
          style={{ backgroundColor: "var(--tott-home-surface)", height: contentHeight * scale }}
        >
          <iframe
            ref={iframeRef}
            src={src}
            title={urlLabel}
            // An iframe already isolates clicks from the admin document (no
            // click-shield needed like the in-process PreviewFrame). Scripts
            // + same-origin are required for the page to render normally and
            // receive postMessage; the preview route itself is expected to
            // suppress real navigation (?cmsPreview=1 pages are read-only).
            sandbox="allow-scripts allow-same-origin"
            style={{
              width: PREVIEW_DESIGN_WIDTH,
              height: contentHeight,
              border: 0,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
            onLoad={() => {
              try {
                const doc = iframeRef.current?.contentDocument;
                const h = doc?.documentElement?.scrollHeight;
                if (h) setContentHeight(h);
              } catch {
                // Cross-origin or not-yet-ready — keep the fallback height.
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
