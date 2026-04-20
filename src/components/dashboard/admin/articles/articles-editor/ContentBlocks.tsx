"use client";

import { useCallback, useMemo, useState } from "react";
import { FileTextIcon, GripIcon, CopyIcon, ImageIcon, TrashIcon } from "./ArticleEditorIcons";
import type { BlockType } from "./AvailableBlocks";
import { CloudUploadIcon } from "@/components/ui/icons";
import type { ContentFormConfig, MainMediaEditorCopy } from "./content-form-config";
import { mainMediaEditorCopy } from "./content-form-config";
import { theme } from "@/lib/theme";

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
};

const inputClass =
  "w-full rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-3 text-sm text-foreground placeholder:text-foreground outline-none focus:border-gray-500";

const blockActionsClass =
  "flex h-8 w-8 items-center justify-center rounded border border-[var(--tott-card-border)] bg-[var(--tott-dash-icon-bg)] text-foreground transition-colors hover:bg-[var(--tott-dash-control-hover)]";

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"] as const;
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  const n = bytes / k ** i;
  const shown = i === 0 ? String(Math.round(n)) : n >= 100 ? String(Math.round(n)) : n >= 10 ? n.toFixed(1) : n.toFixed(1);
  return `${shown} ${sizes[i]}`;
}

const fileRowGlyphClass = "h-5 w-5 shrink-0 text-gray-400";

function FileKindGlyph({ file }: { file: File }) {
  const t = (file.type || "").toLowerCase();
  if (t.startsWith("video/")) {
    return (
      <svg className={fileRowGlyphClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <polygon points="10 9 16 12 10 15 10 9" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (t.startsWith("audio/")) {
    return (
      <svg className={fileRowGlyphClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    );
  }
  if (t.startsWith("image/")) {
    return (
      <span className={`${fileRowGlyphClass} flex items-center justify-center`} aria-hidden>
        <ImageIcon />
      </span>
    );
  }
  return (
    <span className={`${fileRowGlyphClass} flex items-center justify-center`} aria-hidden>
      <FileTextIcon />
    </span>
  );
}

function SelectedFileRow({
  file,
  onRemove,
}: {
  file: File;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-3 py-2.5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <FileKindGlyph file={file} />
        <span className="min-w-0 truncate text-sm text-foreground" title={file.name}>
          {file.name}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <span className="text-xs text-gray-500 tabular-nums">{formatFileSize(file.size)}</span>
        <button
          type="button"
          onClick={onRemove}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-transparent text-gray-400 transition-colors hover:border-[var(--tott-card-border)] hover:bg-[var(--tott-dash-control-hover)] hover:text-foreground"
          aria-label={`Remove ${file.name}`}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}

type BlockActionsMode = "copy-delete" | "delete-only";

const BLOCK_DRAG_MIME = "application/x-tott-block-id";

function BlockActions({
  onDelete,
  onDuplicate,
  mode,
}: {
  onDelete: () => void;
  onDuplicate: () => void;
  mode: BlockActionsMode;
}) {
  if (mode === "delete-only") {
    return (
      <div className="flex shrink-0 items-center self-stretch">
        <button type="button" onClick={onDelete} className={blockActionsClass} aria-label="Delete">
          <TrashIcon />
        </button>
      </div>
    );
  }
  return (
    <div className="flex shrink-0 flex-col gap-1">
      <button type="button" onClick={onDuplicate} className={blockActionsClass} aria-label="Duplicate">
        <CopyIcon />
      </button>
      <button type="button" onClick={onDelete} className={blockActionsClass} aria-label="Delete">
        <TrashIcon />
      </button>
    </div>
  );
}

function blockActionsModeFor(
  block: ContentBlock,
  firstImageBlockId: string | undefined,
): BlockActionsMode {
  if (block.type === "author-note") {
    return "delete-only";
  }
  if (block.type === "image" && firstImageBlockId != null && block.id === firstImageBlockId) {
    return "delete-only";
  }
  return "copy-delete";
}

function BlockDragHandle({
  blockId,
  isDragging,
  alignCenter,
  onDragStart,
  onDragEnd,
}: {
  blockId: string;
  isDragging: boolean;
  alignCenter?: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
}) {
  return (
    <div
      className={`flex shrink-0 ${alignCenter ? "items-center self-stretch" : "flex-col justify-start pt-1"}`}
    >
      <div
        role="button"
        tabIndex={0}
        draggable
        aria-label="Drag to reorder"
        title="Drag to reorder"
        aria-grabbed={isDragging}
        onDragStart={(e) => onDragStart(e, blockId)}
        onDragEnd={onDragEnd}
        className={`flex h-8 w-8 cursor-grab items-center justify-center rounded border border-[var(--tott-card-border)] bg-[var(--tott-dash-icon-bg)] text-foreground transition-colors select-none hover:bg-[var(--tott-dash-control-hover)] active:cursor-grabbing ${
          isDragging ? "opacity-50" : ""
        }`}
      >
        <GripIcon />
      </div>
    </div>
  );
}

const DEFAULT_LABELS: Partial<Record<BlockType, string>> = {
  paragraph: "Start writing your article...",
  heading: "Section title",
  quote: "Quote",
    callout: "Callout",
  "author-note": "Author note",
};

type BlockRendererProps = {
  block: ContentBlock;
  labels?: Partial<Record<BlockType, string>>;
  /** First image/media block — used as the public page hero (main file). */
  isCoverImageBlock?: boolean;
  /** Hero labels for this content type (video / audio / cover / …). */
  heroCopy: MainMediaEditorCopy;
  onChange: (patch: Partial<ContentBlock>) => void;
};

function BlockRenderer({ block, labels, isCoverImageBlock, heroCopy, onChange }: BlockRendererProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  switch (block.type) {
    case "paragraph":
      return (
        <textarea
          value={block.content ?? ""}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder={l.paragraph ?? "Paragraph"}
          rows={6}
          className={`${inputClass} resize-y`}
        />
      );

    case "heading":
      return (
        <input
          type="text"
          value={block.content ?? ""}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder={l.heading ?? "Section title"}
          className={`${inputClass} text-lg font-semibold`}
        />
      );

    case "quote":
      return (
        <div
          className="flex flex-col gap-2 rounded-lg border-l-4 bg-[var(--tott-dash-control-bg)] pl-4"
          style={{ borderLeftColor: "#C9A96E" }}
        >
          <textarea
            value={block.content ?? ""}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder={l.quote ?? "Quote"}
            rows={3}
            className={`${inputClass} resize-y border-0 bg-transparent`}
          />
          <input
            type="text"
            value={block.quoteAttribution ?? ""}
            onChange={(e) => onChange({ quoteAttribution: e.target.value })}
            placeholder="Attribution (optional)"
            className={`${inputClass} border-0 bg-transparent py-2`}
          />
        </div>
      );

    case "image":
      return (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {isCoverImageBlock ? heroCopy.blockName : "Image"}
          </p>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-6 py-10 transition-colors hover:border-[#C9A96E]">
            <span className="text-foreground">
              <CloudUploadIcon />
            </span>
            {isCoverImageBlock ? (
              <span className="flex flex-col items-center gap-1 text-center">
                <span className="text-lg font-semibold" style={{ color: theme.accentGold }}>
                  {heroCopy.uploadTitle}
                </span>
                <span className="text-xs text-gray-400">{heroCopy.uploadDetail}</span>
              </span>
            ) : (
              <>
                <span className="text-sm font-medium">
                  <span className="text-gray-400">choose file</span>{" "}
                  <span style={{ color: "#C9A96E" }}>to upload</span>
                </span>
                <span className="text-xs text-foreground">Recommended: 1200x630px</span>
              </>
            )}
            <input
              type="file"
              accept="image/*,video/mp4,video/webm,video/quicktime,audio/*,.pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onChange({ file: f, imageUrl: "" });
                e.target.value = "";
              }}
            />
          </label>
          <div>
            <p className="mb-1 text-xs text-gray-500">
              {isCoverImageBlock ? heroCopy.pasteUrlHint : "Or paste image, video, or audio URL"}
            </p>
            <input
              type="url"
              value={block.imageUrl ?? ""}
              onChange={(e) => onChange({ imageUrl: e.target.value, file: null })}
              placeholder="https://..."
              className={inputClass}
            />
          </div>
          {block.file ? (
            <SelectedFileRow file={block.file} onRemove={() => onChange({ file: null })} />
          ) : null}
          <div>
            <p className="mb-1 text-xs text-gray-500">
              Caption (optional, shown under this media on the public page)
            </p>
            <textarea
              value={block.imageCaption ?? ""}
              onChange={(e) => onChange({ imageCaption: e.target.value })}
              placeholder="e.g. Modern renewable energy infrastructure…"
              rows={2}
              className={`${inputClass} resize-y text-sm`}
            />
          </div>
        </div>
      );

    case "gallery":
      return (
        <div className="space-y-3">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-6 py-10 transition-colors hover:border-[#C9A96E]">
            <span className="text-foreground">
              <CloudUploadIcon />
            </span>
            <span className="text-sm font-medium text-foreground">Add images to gallery</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const list = e.target.files;
                if (!list?.length) return;
                onChange({ files: [...(block.files ?? []), ...Array.from(list)] });
                e.target.value = "";
              }}
            />
          </label>
          {(block.files?.length ?? 0) > 0 ? (
            <ul className="space-y-2" aria-label="Selected gallery files">
              {(block.files ?? []).map((f, index) => (
                <li key={`${f.name}-${f.size}-${index}`}>
                  <SelectedFileRow
                    file={f}
                    onRemove={() =>
                      onChange({
                        files: (block.files ?? []).filter((_, j) => j !== index),
                      })
                    }
                  />
                </li>
              ))}
            </ul>
          ) : null}
          <div>
            <p className="mb-1 text-xs text-gray-500">Or one URL per line</p>
            <textarea
              value={(block.galleryUrls ?? []).join("\n")}
              onChange={(e) =>
                onChange({
                  galleryUrls: e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                  files: [],
                })
              }
              placeholder={"https://example.com/1.jpg\nhttps://example.com/2.jpg"}
              rows={4}
              className={`${inputClass} resize-y font-mono text-xs`}
            />
          </div>
        </div>
      );

    case "callout":
      return (
        <div className="space-y-3 rounded-2xl border border-[var(--tott-card-border)] bg-[var(--tott-panel-bg)] p-6">
          <div>
            <p className="mb-1 text-xs font-medium text-gray-500">Title</p>
            <input
              type="text"
              value={block.calloutTitle ?? ""}
              onChange={(e) => onChange({ calloutTitle: e.target.value })}
              placeholder="e.g. 35%"
              className={`${inputClass} text-xl font-bold text-foreground`}
            />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-gray-500">Callout</p>
            <textarea
              value={block.content ?? ""}
              onChange={(e) => onChange({ content: e.target.value })}
              placeholder={l.callout ?? "Callout"}
              rows={4}
              className={`${inputClass} resize-y text-base text-foreground/85`}
            />
          </div>
        </div>
      );

    case "author-note":
      return (
        <textarea
          value={block.content ?? ""}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder={l["author-note"] ?? "Author note"}
          rows={4}
          className="w-full resize-y rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-4 py-3 text-sm text-foreground placeholder:text-foreground outline-none focus:border-gray-500"
        />
      );

    case "divider":
      return <hr className="w-full border-[var(--tott-card-border)]" />;

    default:
      return null;
  }
}

type ContentBlocksProps = {
  blocks: ContentBlock[];
  onRemoveBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onUpdateBlock: (id: string, patch: Partial<ContentBlock>) => void;
  /** Prepends an image/media block as the main file (first image block in order). */
  onAddCoverBlock: () => void;
  /** Move block `activeId` to the position of `overId` (HTML5 drag-and-drop). */
  onReorderBlock: (activeId: string, overId: string) => void;
  config: ContentFormConfig;
  /** When set, overrides `mainMediaEditorCopy(config.contentType)` for hero UI. */
  mainMediaCopy?: MainMediaEditorCopy;
};

export function ContentBlocks({
  blocks,
  onRemoveBlock,
  onDuplicateBlock,
  onUpdateBlock,
  onAddCoverBlock,
  onReorderBlock,
  config,
  mainMediaCopy,
}: ContentBlocksProps) {
  const heroCopy = useMemo(
    () => mainMediaCopy ?? mainMediaEditorCopy(config.contentType),
    [config.contentType, mainMediaCopy],
  );
  const firstImageBlockId = blocks.find((b) => b.type === "image")?.id;
  const hasImageBlock = firstImageBlockId != null;

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
    [onReorderBlock],
  );

  return (
    <div className="space-y-6 border-b border-[var(--tott-card-border)] pb-4">
      {!hasImageBlock ? (
        <div className="rounded-lg border border-dashed border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)]/40 px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-400">{heroCopy.missingHeroBlurb}</p>
            <button
              type="button"
              onClick={onAddCoverBlock}
              className="shrink-0 rounded-lg border border-[#C9A96E]/50 bg-[var(--tott-dash-control-bg)] px-4 py-2.5 text-sm font-medium text-[#C9A96E] transition-colors hover:border-[#C9A96E] hover:bg-[var(--tott-dash-control-hover)]"
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
          className={`flex gap-3 rounded-md transition-shadow ${
            block.type === "divider" ? "items-center" : "items-start"
          } ${
            dragOverId === block.id && draggingId != null && draggingId !== block.id
              ? "ring-1 ring-[#C9A96E]/90 ring-offset-2 ring-offset-[#141414]"
              : ""
          } ${draggingId === block.id ? "opacity-50" : ""}`}
        >
          <BlockDragHandle
            blockId={block.id}
            isDragging={draggingId === block.id}
            alignCenter={block.type === "divider"}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />
          <div className="min-w-0 flex-1">
            <BlockRenderer
              block={block}
              labels={config.blockLabels}
              isCoverImageBlock={block.type === "image" && block.id === firstImageBlockId}
              heroCopy={heroCopy}
              onChange={(patch) => onUpdateBlock(block.id, patch)}
            />
          </div>
          <BlockActions
            mode={blockActionsModeFor(block, firstImageBlockId)}
            onDelete={() => onRemoveBlock(block.id)}
            onDuplicate={() => onDuplicateBlock(block.id)}
          />
        </div>
      ))}
    </div>
  );
}
