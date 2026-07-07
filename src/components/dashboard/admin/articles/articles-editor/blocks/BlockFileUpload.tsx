"use client";

import { FileTextIcon, ImageIcon, TrashIcon } from "../ArticleEditorIcons";

export const SUPPORTED_FILE_ACCEPT =
  "image/jpeg,image/png,application/pdf,audio/mpeg,video/mp4,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const SUPPORTED_FILE_LABEL = "JPG, PNG, PDF, MP3, MP4, DOC (Max 20MB)";

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"] as const;
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  const n = bytes / k ** i;
  const shown =
    i === 0
      ? String(Math.round(n))
      : n >= 100
        ? String(Math.round(n))
        : n >= 10
          ? n.toFixed(1)
          : n.toFixed(1);
  return `${shown} ${sizes[i]}`;
}

const fileRowGlyphClass = "h-5 w-5 shrink-0 text-[var(--tott-muted)]";

export function FileKindGlyph({ file }: { file: File }) {
  const t = (file.type || "").toLowerCase();
  if (t.startsWith("video/")) {
    return (
      <svg
        className={fileRowGlyphClass}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <polygon points="10 9 16 12 10 15 10 9" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (t.startsWith("audio/")) {
    return (
      <svg
        className={fileRowGlyphClass}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
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

export function SelectedFileRow({ file, onRemove }: { file: File; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface-inset)] px-3 py-2.5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <FileKindGlyph file={file} />
        <span className="min-w-0 truncate text-sm text-foreground" title={file.name}>
          {file.name}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <span className="text-xs text-[var(--tott-muted)] tabular-nums">{formatFileSize(file.size)}</span>
        <button
          type="button"
          onClick={onRemove}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-transparent text-[var(--tott-muted)] transition-colors hover:border-[var(--tott-card-border)] hover:bg-[var(--tott-dash-control-hover)] hover:text-foreground"
          aria-label={`Remove ${file.name}`}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
