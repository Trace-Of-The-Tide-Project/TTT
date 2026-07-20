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
import { parseEmbedUrl } from "@/lib/content/embed-providers";

const fieldShell =
  "w-full rounded-xl border border-[var(--tott-card-border)] bg-[var(--tott-dash-control-bg)]";

const fieldInput =
  "w-full bg-transparent border-0 outline-none px-4 py-2.5 text-sm text-foreground placeholder:text-foreground/60";

const inputClass = `${fieldShell} px-4 py-3 text-sm text-foreground placeholder:text-foreground outline-none focus-within:border-[var(--tott-card-border)]`;

const DEFAULT_LABELS: Partial<Record<BlockType, string>> = {
  paragraph: "Start writing your article...",
  heading: "Section title",
  quote: "Quote",
  "pull-quote": "Pull quote",
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
            dir={block.dir}
          />
        </div>
      );

    case "heading":
      return (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={block.content ?? ""}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder={l.heading ?? "Section title"}
            dir={block.dir}
            className={`${inputClass} text-lg font-semibold`}
          />
          <div className="flex shrink-0 overflow-hidden rounded-lg border border-[var(--tott-card-border)]">
            {([2, 3] as const).map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => onChange({ headingLevel: level })}
                aria-pressed={(block.headingLevel ?? 2) === level}
                className={`px-3 py-2 text-xs font-semibold ${
                  (block.headingLevel ?? 2) === level
                    ? "bg-[var(--tott-accent-gold)] text-black"
                    : "bg-[var(--tott-dash-control-bg)] text-foreground/70 hover:text-foreground"
                }`}
              >
                H{level}
              </button>
            ))}
          </div>
        </div>
      );

    case "quote":
      return (
        <div
          className="w-full rounded-e-xl border border-[var(--tott-card-border)] border-s-4 bg-[var(--tott-dash-control-bg)]"
          style={{ borderInlineStartColor: "var(--tott-accent-gold)" }}
        >
          <input
            type="text"
            value={block.content ?? ""}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder={l.quote ?? "Quote"}
            dir={block.dir}
            className={fieldInput}
          />
        </div>
      );

    case "pull-quote": {
      // Presence of the key — not a non-empty value — reveals the input, so
      // the field stays open while the author clears it. (A trimmed check meant
      // the "+ Add attribution" seed of " " collapsed straight back to the
      // button, making the field permanently unreachable.)
      const hasAttribution = block.quoteAttribution != null;
      return (
        <div
          className="w-full space-y-2 rounded-e-xl border border-[var(--tott-card-border)] border-s-4 bg-[var(--tott-dash-control-bg)] p-1"
          style={{ borderInlineStartColor: "var(--tott-accent-gold)" }}
        >
          <input
            type="text"
            value={block.content ?? ""}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder={l["pull-quote"] ?? "Pull quote"}
            dir={block.dir}
            className={`${fieldInput} text-lg font-medium`}
          />
          {hasAttribution ? (
            <input
              type="text"
              value={block.quoteAttribution ?? ""}
              onChange={(e) => onChange({ quoteAttribution: e.target.value })}
              placeholder="Attribution"
              dir={block.dir}
              className={fieldInput}
            />
          ) : (
            <button
              type="button"
              onClick={() => onChange({ quoteAttribution: "" })}
              className="px-4 pb-2 text-xs font-medium underline"
              style={{ color: "var(--tott-accent-gold)" }}
            >
              + Add attribution
            </button>
          )}
        </div>
      );
    }

    case "embed": {
      const url = block.embedUrl ?? "";
      const trimmed = url.trim();
      const invalid = trimmed.length > 0 && !parseEmbedUrl(trimmed);
      return (
        <div className={fieldShell}>
          <input
            type="url"
            value={url}
            onChange={(e) => onChange({ embedUrl: e.target.value })}
            placeholder="https://youtube.com/watch?v=… or https://vimeo.com/…"
            className={fieldInput}
          />
          {invalid ? (
            <p className="px-4 pb-2 text-xs text-[var(--tott-status-coral)]">
              Only YouTube and Vimeo URLs are supported.
            </p>
          ) : null}
        </div>
      );
    }

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
          className="w-full rounded-e-xl border border-[var(--tott-card-border)] border-s-4 bg-[var(--tott-dash-control-bg)]"
          style={{ borderInlineStartColor: "var(--tott-accent-gold)" }}
        >
          <input
            type="text"
            value={block.content ?? ""}
            onChange={(e) => onChange({ content: e.target.value })}
            placeholder={l.callout ?? "Callout"}
            dir={block.dir}
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
            dir={block.dir}
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
            dir={block.dir}
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
            dir={block.dir}
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
