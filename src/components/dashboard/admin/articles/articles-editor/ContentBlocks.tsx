"use client";

import { useCallback, useMemo, useState } from "react";
import type { BlockType } from "./AvailableBlocks";
import type { ContentFormConfig, MainMediaEditorCopy } from "./content-form-config";
import { mainMediaEditorCopy } from "./content-form-config";
import { BlockActions, blockActionsModeFor, BLOCK_DRAG_MIME } from "./blocks/BlockActions";
import { BlockRenderer } from "./blocks/BlockRenderer";

export type ContentBlock = {
  id: string;
  type: BlockType;
  content?: string;
  quoteAttribution?: string;
  /** Callout headline (bold); body is `content`. */
  calloutTitle?: string;
  file?: File | null;
  files?: File[];
  imageUrl?: string;
  /** Caption under image on the public article. */
  imageCaption?: string;
  galleryUrls?: string[];
  /** Per-block placeholder override — wins over the type-level `blockLabels` when set. */
  placeholder?: string;
  /** Heading level. 2 (default, omitted from payload) or 3. H1 is reserved for the article title. */
  headingLevel?: 2 | 3;
  /** Embed source URL (YouTube/Vimeo) — validated by `parseEmbedUrl` before save. */
  embedUrl?: string;
  /** Per-block direction override. Undefined = inherit from the content language. */
  dir?: "ltr" | "rtl";
};

type ContentBlocksProps = {
  blocks: ContentBlock[];
  onUpdateBlock: (id: string, patch: Partial<ContentBlock>) => void;
  /** Prepends an image/media block as the main file (first image block in order). */
  onAddCoverBlock: () => void;
  /** Move block `activeId` to the position of `overId` (HTML5 drag-and-drop). */
  onReorderBlock: (activeId: string, overId: string) => void;
  /** Removes the block entirely (action panel trash button). */
  onRemoveBlock: (id: string) => void;
  config: ContentFormConfig;
  /** When set, overrides `mainMediaEditorCopy(config.contentType)` for hero UI. */
  mainMediaCopy?: MainMediaEditorCopy;
};

export function ContentBlocks({
  blocks,
  onUpdateBlock,
  onAddCoverBlock,
  onReorderBlock,
  onRemoveBlock,
  config,
  mainMediaCopy,
}: ContentBlocksProps) {
  const heroCopy = useMemo(
    () => mainMediaCopy ?? mainMediaEditorCopy(config.contentType),
    [config.contentType, mainMediaCopy]
  );
  // Article-style editors disable the "first image is the cover" rule and
  // never prompt for a missing hero — every image block is a plain upload.
  const firstImageBlockId = config.disableHero
    ? undefined
    : blocks.find((b) => b.type === "image")?.id;
  const hasImageBlock = config.disableHero || firstImageBlockId != null;

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    e.dataTransfer.setData(BLOCK_DRAG_MIME, id);
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
    setDraggingId(id);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverId(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, overId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    setDragOverId(overId);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      const sourceId =
        e.dataTransfer.getData(BLOCK_DRAG_MIME) || e.dataTransfer.getData("text/plain");
      if (sourceId && sourceId !== targetId) onReorderBlock(sourceId, targetId);
      setDraggingId(null);
      setDragOverId(null);
    },
    [onReorderBlock]
  );

  return (
    <div className="space-y-1.5 border-b border-[var(--tott-card-border)] pb-4">
      {!hasImageBlock ? (
        <div className="rounded-lg border border-dashed border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)]/40 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[var(--tott-muted)]">{heroCopy.missingHeroBlurb}</p>
            <button
              type="button"
              onClick={onAddCoverBlock}
              className="shrink-0 rounded-lg border border-[var(--tott-accent-gold)]/50 bg-[var(--tott-dash-control-bg)] px-4 py-2.5 text-sm font-medium text-[var(--tott-dash-gold-text)] transition-colors hover:border-[var(--tott-accent-gold)] hover:bg-[var(--tott-dash-control-hover)]"
            >
              {heroCopy.addBlockButton}
            </button>
          </div>
        </div>
      ) : null}
      {blocks.map((block) => (
        <div
          key={block.id}
          onDragOverCapture={(e) => handleDragOver(e, block.id)}
          onDropCapture={(e) => handleDrop(e, block.id)}
          className={`flex items-start gap-3 rounded-md transition-shadow ${
            dragOverId === block.id && draggingId != null && draggingId !== block.id
              ? "ring-1 ring-[var(--tott-accent-gold)]/90 ring-offset-2 ring-offset-[var(--tott-elevated)]"
              : ""
          } ${draggingId === block.id ? "opacity-50" : ""}`}
        >
          <div className="min-w-0 flex-1">
            <BlockRenderer
              block={block}
              labels={config.blockLabels}
              isCoverImageBlock={block.type === "image" && block.id === firstImageBlockId}
              heroCopy={heroCopy}
              onChange={(patch) => onUpdateBlock(block.id, patch)}
            />
          </div>
          <div>
              <BlockActions
                blockId={block.id}
                isDragging={draggingId === block.id}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                mode={blockActionsModeFor(block.type, block.id, firstImageBlockId)}
                onDelete={() => onRemoveBlock(block.id)}
                dir={block.dir}
                onChangeDir={
                  block.type === "divider"
                    ? undefined
                    : () =>
                        onUpdateBlock(block.id, {
                          dir: block.dir === undefined ? "ltr" : block.dir === "ltr" ? "rtl" : undefined,
                        })
                }
                onCopy={() => {
                  if (typeof navigator === "undefined") return;
                  const html = block.content ?? "";
                  // Strip HTML for the plain-text fallback so apps that ignore
                  // text/html (Terminal, Notes) get clean text without tags.
                  const tmp = document.createElement("div");
                  tmp.innerHTML = html;
                  const text = tmp.textContent ?? tmp.innerText ?? "";
                  // Prefer rich clipboard so paste into Word / Google Docs / email
                  // preserves bold, italic, lists, color, etc. Fall back to
                  // plain text if the browser doesn't support ClipboardItem.
                  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
                    void navigator.clipboard.write([
                      new ClipboardItem({
                        "text/html": new Blob([html], { type: "text/html" }),
                        "text/plain": new Blob([text], { type: "text/plain" }),
                      }),
                    ]);
                  } else if (navigator.clipboard?.writeText) {
                    void navigator.clipboard.writeText(text);
                  }
                }}
              />
          </div>
        </div>
      ))}
    </div>
  );
}
