"use client";

import { useState } from "react";
import { RichTextEditor } from "../RichTextEditor";
import { CloudUploadIcon } from "@/components/ui/icons";
import type { ContentFormConfig, MainMediaEditorCopy } from "../content-form-config";
import { theme } from "@/lib/theme";
import type { ContentBlock } from "../ContentBlocks";
import type { BlockType } from "../AvailableBlocks";
import { SelectedFileRow, SUPPORTED_FILE_ACCEPT, SUPPORTED_FILE_LABEL } from "./BlockFileUpload";
import { HeroPickerModal } from "@/components/dashboard/admin/media-library/HeroPickerModal";
import { resolveArticleMediaSrc } from "@/lib/content/article-media-url";

const fieldShell =
  "w-full rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)]";

const fieldInput =
  "w-full bg-transparent border-0 outline-none px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/60";

const inputClass = `${fieldShell} px-4 py-3 text-sm text-foreground placeholder:text-foreground outline-none focus-within:border-[var(--tott-card-border)]`;

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
  isCoverImageBlock?: boolean;
  heroCopy: MainMediaEditorCopy;
  onChange: (patch: Partial<ContentBlock>) => void;
};

export function BlockRenderer({
  block,
  labels,
  isCoverImageBlock,
  heroCopy,
  onChange,
}: BlockRendererProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const [libraryOpen, setLibraryOpen] = useState(false);
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
          style={{ borderLeftColor: "var(--tott-accent-gold)" }}
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
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--tott-muted)]">
              {heroCopy.blockName}
            </p>
          ) : null}
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-6 py-10 transition-colors hover:border-[var(--tott-accent-gold)]">
            <span className="text-foreground">
              <CloudUploadIcon />
            </span>
            {isCoverImageBlock ? (
              <span className="flex flex-col items-center gap-1 text-center">
                <span className="text-lg font-semibold" style={{ color: theme.accentGold }}>
                  {heroCopy.uploadTitle}
                </span>
                <span className="text-xs text-[var(--tott-muted)]">{heroCopy.uploadDetail}</span>
              </span>
            ) : (
              <>
                <span className="text-sm font-medium">
                  <span style={{ color: "var(--tott-accent-gold)" }}>choose file</span>{" "}
                  <span className="text-foreground">to upload</span>
                </span>
                <span className="text-xs text-[var(--tott-muted)]">Recommended: 1200×630px</span>
                <span className="text-xs text-[var(--tott-muted)]">
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
          {block.type === "image" ? (
            <>
              <button
                type="button"
                onClick={() => setLibraryOpen(true)}
                className="text-sm font-medium underline"
                style={{ color: "var(--tott-accent-gold)" }}
              >
                Choose from library
              </button>
              <HeroPickerModal
                open={libraryOpen}
                onClose={() => setLibraryOpen(false)}
                title="Choose image"
                onPick={(storageKey) =>
                  onChange({ imageUrl: resolveArticleMediaSrc(storageKey), file: null })
                }
              />
            </>
          ) : null}
          {isCoverImageBlock ? (
            <div>
              <p className="mb-1 text-xs text-[var(--tott-muted)]">{heroCopy.pasteUrlHint}</p>
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
              <p className="mb-1 text-xs text-[var(--tott-muted)]">
                Caption (optional, shown under this media on the public page)
              </p>
              <div className={fieldShell}>
                <RichTextEditor
                  value={block.imageCaption ?? ""}
                  onChange={(html) => onChange({ imageCaption: html })}
                  placeholder="e.g. Modern renewable energy infrastructure…"
                />
              </div>
            </div>
          ) : null}
        </div>
      );

    case "gallery":
      return (
        <div className="space-y-3">
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)] px-6 py-10 transition-colors hover:border-[var(--tott-accent-gold)]">
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
          <button
            type="button"
            onClick={() => setLibraryOpen(true)}
            className="text-sm font-medium underline"
            style={{ color: "var(--tott-accent-gold)" }}
          >
            Choose from library
          </button>
          <HeroPickerModal
            open={libraryOpen}
            onClose={() => setLibraryOpen(false)}
            title="Choose gallery image"
            onPick={(storageKey) =>
              onChange({
                galleryUrls: [...(block.galleryUrls ?? []), resolveArticleMediaSrc(storageKey)],
              })
            }
          />
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
            <p className="mb-1 text-xs text-[var(--tott-muted)]">Or one URL per line</p>
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
          style={{ borderLeftColor: "var(--tott-accent-gold)" }}
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
          <RichTextEditor
            value={block.content ?? ""}
            onChange={(html) => onChange({ content: html })}
            placeholder={l["author-note"] ?? "Author note"}
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
