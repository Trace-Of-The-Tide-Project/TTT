"use client";

import { useCallback, useMemo, useState } from "react";
import { FileTextIcon, ImageIcon, TrashIcon } from "./ArticleEditorIcons";
import { RichTextEditor } from "./RichTextEditor";
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
  /** Per-block placeholder override — wins over the type-level `blockLabels` when set. */
  placeholder?: string;
};

/** Shared field shell — rounded card surface used by paragraph/author-note/quote/callout. */
const fieldShell =
  "w-full rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)]";

/** Bare input chrome (padding + typography) used inside `fieldShell`. */
const fieldInput =
  "w-full bg-transparent border-0 outline-none px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/60";

const inputClass = `${fieldShell} px-4 py-3 text-sm text-foreground placeholder:text-foreground outline-none focus-within:border-gray-500`;

/** File types accepted by the (non-cover) image upload block — drives both the
 * `<input accept="…">` and the human-readable "Supported formats" caption so
 * they cannot drift apart. */
const SUPPORTED_FILE_ACCEPT =
  "image/jpeg,image/png,application/pdf,audio/mpeg,video/mp4,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const SUPPORTED_FILE_LABEL = "JPG, PNG, PDF, MP3, MP4, DOC (Max 20MB)";

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

/* Action panel icons — matched to `Button-3.svg` (40×120 panel, #333 bg).
   Each icon's viewBox crops the corresponding region of the original 40×120
   coordinate space so the glyphs are 1:1 with the Figma export. */

function PanelDragIcon() {
  return (
    <svg
      width="12"
      height="20"
      viewBox="14 18 12 19"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M16 21C16 21.2652 16.1054 21.5196 16.2929 21.7071C16.4804 21.8946 16.7348 22 17 22C17.2652 22 17.5196 21.8946 17.7071 21.7071C17.8946 21.5196 18 21.2652 18 21C18 20.7348 17.8946 20.4804 17.7071 20.2929C17.5196 20.1054 17.2652 20 17 20C16.7348 20 16.4804 20.1054 16.2929 20.2929C16.1054 20.4804 16 20.7348 16 21Z" />
      <path d="M16 28C16 28.2652 16.1054 28.5196 16.2929 28.7071C16.4804 28.8946 16.7348 29 17 29C17.2652 29 17.5196 28.8946 17.7071 28.7071C17.8946 28.5196 18 28.2652 18 28C18 27.7348 17.8946 27.4804 17.7071 27.2929C17.5196 27.1054 17.2652 27 17 27C16.7348 27 16.4804 27.1054 16.2929 27.2929C16.1054 27.4804 16 27.7348 16 28Z" />
      <path d="M16 35C16 35.2652 16.1054 35.5196 16.2929 35.7071C16.4804 35.8946 16.7348 36 17 36C17.2652 36 17.5196 35.8946 17.7071 35.7071C17.8946 35.5196 18 35.2652 18 35C18 34.7348 17.8946 34.4804 17.7071 34.2929C17.5196 34.1054 17.2652 34 17 34C16.7348 34 16.4804 34.1054 16.2929 34.2929C16.1054 34.4804 16 34.7348 16 35Z" />
      <path d="M22 21C22 21.2652 22.1054 21.5196 22.2929 21.7071C22.4804 21.8946 22.7348 22 23 22C23.2652 22 23.5196 21.8946 23.7071 21.7071C23.8946 21.5196 24 21.2652 24 21C24 20.7348 23.8946 20.4804 23.7071 20.2929C23.5196 20.1054 23.2652 20 23 20C22.7348 20 22.4804 20.1054 22.2929 20.2929C22.1054 20.4804 22 20.7348 22 21Z" />
      <path d="M22 28C22 28.2652 22.1054 28.5196 22.2929 28.7071C22.4804 28.8946 22.7348 29 23 29C23.2652 29 23.5196 28.8946 23.7071 28.7071C23.8946 28.5196 24 28.2652 24 28C24 27.7348 23.8946 27.4804 23.7071 27.2929C23.5196 27.1054 23.2652 27 23 27C22.7348 27 22.4804 27.1054 22.2929 27.2929C22.1054 27.4804 22 27.7348 22 28Z" />
      <path d="M22 35C22 35.2652 22.1054 35.5196 22.2929 35.7071C22.4804 35.8946 22.7348 36 23 36C23.2652 36 23.5196 35.8946 23.7071 35.7071C23.8946 35.5196 24 35.2652 24 35C24 34.7348 23.8946 34.4804 23.7071 34.2929C23.5196 34.1054 23.2652 34 23 34C22.7348 34 22.4804 34.1054 22.2929 34.2929C22.1054 34.4804 22 34.7348 22 35Z" />
    </svg>
  );
}

function PanelCopyIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="10 50 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12.012 64.737C11.7053 64.5622 11.4503 64.3095 11.2726 64.0045C11.0949 63.6995 11.0009 63.353 11 63V53C11 51.9 11.9 51 13 51H23C23.75 51 24.158 51.385 24.5 52M15 57.667C15 56.9597 15.281 56.2813 15.7811 55.7811C16.2813 55.281 16.9597 55 17.667 55H26.333C26.6832 55 27.03 55.069 27.3536 55.203C27.6772 55.337 27.9712 55.5335 28.2189 55.7811C28.4665 56.0288 28.663 56.3228 28.797 56.6464C28.931 56.97 29 57.3168 29 57.667V66.333C29 66.6832 28.931 67.03 28.797 67.3536C28.663 67.6772 28.4665 67.9712 28.2189 68.2189C27.9712 68.4665 27.6772 68.663 27.3536 68.797C27.03 68.931 26.6832 69 26.333 69H17.667C17.3168 69 16.97 68.931 16.6464 68.797C16.3228 68.663 16.0288 68.4665 15.7811 68.2189C15.5335 67.9712 15.337 67.6772 15.203 67.3536C15.069 67.03 15 66.6832 15 66.333V57.667Z" />
    </svg>
  );
}

function PanelTrashIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="11 82 18 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 87H28M18 91V97M22 91V97M13 87L14 99C14 99.5304 14.2107 100.039 14.5858 100.414C14.9609 100.789 15.4696 101 16 101H24C24.5304 101 25.0391 100.789 25.4142 100.414C25.7893 100.039 26 99.5304 26 99L27 87M17 87V84C17 83.7348 17.1054 83.4804 17.2929 83.2929C17.4804 83.1054 17.7348 83 18 83H22C22.2652 83 22.5196 83.1054 22.7071 83.2929C22.8946 83.4804 23 83.7348 23 84V87" />
    </svg>
  );
}

function BlockActions({
  blockId,
  isDragging,
  onDragStart,
  onDragEnd,
  onDelete,
  onCopy,
  mode,
}: {
  blockId: string;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onDelete: () => void;
  /** Copies the block's text content to the system clipboard. */
  onCopy: () => void;
  mode: BlockActionsMode;
}) {
  return (
    <div
      className="flex h-[120px] w-10 shrink-0 flex-col items-center justify-around self-start rounded-lg bg-[var(--tott-dash-control-bg)] text-[var(--tott-muted)]"
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}
    >
      <div
        role="button"
        tabIndex={0}
        draggable
        aria-label="Drag to reorder"
        title="Drag to reorder"
        onDragStart={(e) => onDragStart(e, blockId)}
        onDragEnd={onDragEnd}
        className={`flex h-10 w-10 cursor-grab items-center justify-center select-none active:cursor-grabbing ${
          isDragging ? "opacity-50" : ""
        }`}
      >
        <PanelDragIcon />
      </div>
      {mode === "copy-delete" ? (
        <button
          type="button"
          onClick={onCopy}
          className="flex h-10 w-10 items-center justify-center"
          aria-label="Copy text"
        >
          <PanelCopyIcon />
        </button>
      ) : null}
      <button
        type="button"
        onClick={onDelete}
        className="flex h-10 w-10 items-center justify-center"
        aria-label="Delete"
      >
        <PanelTrashIcon />
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

const DEFAULT_LABELS: Partial<Record<BlockType, string>> = {
  paragraph: "Start writing your article...",
  heading: "Section title",
  quote: "Quote",
  callout: "Callout",
  "author-note": "Author note",
  "caption-text": "Caption Text…",
  "meta-data": "Camera | Medium | Date",
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
        <div className={fieldShell}>
          <RichTextEditor
            value={block.content ?? ""}
            onChange={(html) => onChange({ content: html })}
            placeholder={block.placeholder ?? l.paragraph ?? "Paragraph"}
          />
        </div>
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
          className="w-full rounded-r-xl border border-[var(--tott-card-border)] border-l-4 bg-[var(--tott-dash-control-bg)]"
          style={{ borderLeftColor: "#C9A96E" }}
        >
          <input
            type="text"
            value={block.content ?? ""}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder={l.quote ?? "Quote"}
            className={fieldInput}
          />
        </div>
      );

    case "image":
    case "video":
    case "audio":
      return (
        <div className="space-y-3">
          {isCoverImageBlock ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {heroCopy.blockName}
            </p>
          ) : null}
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-6 py-10 transition-colors hover:border-[#C9A96E]">
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
                  <span style={{ color: "#C9A96E" }}>choose file</span>{" "}
                  <span className="text-foreground">to upload</span>
                </span>
                <span className="text-xs text-gray-400">Recommended: 1200×630px</span>
                <span className="text-xs text-gray-400">
                  Supported formats: {SUPPORTED_FILE_LABEL}
                </span>
              </>
            )}
            <input
              type="file"
              accept={
                block.type === "video"
                  ? "video/*"
                  : block.type === "audio"
                    ? "audio/*"
                    : isCoverImageBlock
                      ? "image/*,video/mp4,video/webm,video/quicktime,audio/*,.pdf"
                      : SUPPORTED_FILE_ACCEPT
              }
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onChange({ file: f, imageUrl: "" });
                e.target.value = "";
              }}
            />
          </label>
          {isCoverImageBlock ? (
            <div>
              <p className="mb-1 text-xs text-gray-500">{heroCopy.pasteUrlHint}</p>
              <input
                type="url"
                value={block.imageUrl ?? ""}
                onChange={(e) => onChange({ imageUrl: e.target.value, file: null })}
                placeholder="https://..."
                className={inputClass}
              />
            </div>
          ) : null}
          {block.file ? (
            <SelectedFileRow file={block.file} onRemove={() => onChange({ file: null })} />
          ) : null}
          {isCoverImageBlock ? (
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
          ) : null}
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
        <div
          className="w-full rounded-r-xl border border-[var(--tott-card-border)] border-l-4 bg-[var(--tott-dash-control-bg)]"
          style={{ borderLeftColor: "#C9A96E" }}
        >
          <input
            type="text"
            value={block.content ?? ""}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder={l.callout ?? "Callout"}
            className={fieldInput}
          />
        </div>
      );

    case "author-note":
      return (
        <div className={fieldShell}>
          <textarea
            value={block.content ?? ""}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder={l["author-note"] ?? "Author note"}
            rows={1}
            className={`${fieldInput} resize-y`}
          />
        </div>
      );

    case "caption-text":
      return (
        <div className={fieldShell}>
          <input
            type="text"
            value={block.content ?? ""}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder={l["caption-text"] ?? "Caption Text…"}
            className={fieldInput}
          />
        </div>
      );

    case "meta-data":
      return (
        <div className={fieldShell}>
          <input
            type="text"
            value={block.content ?? ""}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder={l["meta-data"] ?? "Camera | Medium | Date"}
            className={fieldInput}
          />
        </div>
      );

    case "divider":
      return <hr className="w-full border-[var(--tott-card-border)]" />;

    default:
      return null;
  }
}

type ContentBlocksProps = {
  blocks: ContentBlock[];
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
    [onReorderBlock],
  );

  return (
    <div className="space-y-1.5 border-b border-[var(--tott-card-border)] pb-4">
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
          className={`flex items-start gap-3 rounded-md transition-shadow ${
            dragOverId === block.id && draggingId != null && draggingId !== block.id
              ? "ring-1 ring-[#C9A96E]/90 ring-offset-2 ring-offset-[#141414]"
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
          {block.type === "divider" ? (
            <div className="w-10 shrink-0" aria-hidden />
          ) : block.type !== "paragraph" ? (
            // Non-paragraph blocks reserve only the column width so right edges
            // align — no 120px tall action panel inflating the row height.
            <div className="w-10 shrink-0" aria-hidden />
          ) : (
            <div>
              <BlockActions
                blockId={block.id}
                isDragging={draggingId === block.id}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                mode={blockActionsModeFor(block, firstImageBlockId)}
                onDelete={() => onUpdateBlock(block.id, { content: "" })}
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
                  if (
                    typeof ClipboardItem !== "undefined" &&
                    navigator.clipboard?.write
                  ) {
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
          )}
        </div>
      ))}
    </div>
  );
}
