"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useCurrentEditor } from "./editor-registry";
import type { Editor } from "@tiptap/react";

/* ─────────────────────────── icons ─────────────────────────── */

function BoldIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden>
      <path d="M3 2.5A.5.5 0 0 1 3.5 2H8a3 3 0 0 1 2.1 5.14A3 3 0 0 1 8.5 13H3.5a.5.5 0 0 1-.5-.5v-10ZM5 7h3a1.5 1.5 0 0 0 0-3H5v3Zm0 2v3h3.5a1.5 1.5 0 0 0 0-3H5Z" />
    </svg>
  );
}

function ItalicIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden>
      <path d="M6 2.5A.5.5 0 0 1 6.5 2h4a.5.5 0 0 1 0 1H9.6l-2.4 9H9a.5.5 0 0 1 0 1H4.5a.5.5 0 0 1 0-1h1.9l2.4-9H6.5a.5.5 0 0 1-.5-.5Z" />
    </svg>
  );
}

function UnderlineIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden>
      <path d="M4 2a.5.5 0 0 1 .5.5V7a3.5 3.5 0 0 0 7 0V2.5a.5.5 0 0 1 1 0V7a4.5 4.5 0 0 1-9 0V2.5A.5.5 0 0 1 4 2ZM3.5 13a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.5-.5Z" />
    </svg>
  );
}

function StrikethroughIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden>
      <path d="M2.5 7.5A.5.5 0 0 1 3 7h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5ZM5.6 4.7C5.6 3.2 7 2 8.7 2c1.2 0 2.3.5 3 1.3a.5.5 0 1 1-.76.65A2.6 2.6 0 0 0 8.7 3c-1.2 0-2.1.8-2.1 1.7 0 .6.35 1 .95 1.3H5.9a2 2 0 0 1-.3-1.3ZM6.3 9c-.15.35-.2.7-.2 1 0 1 .95 1.9 2.3 1.9 1.2 0 2.2-.6 2.5-1.5a.5.5 0 1 1 .95.3c-.45 1.3-1.8 2.2-3.45 2.2-1.8 0-3.3-1.2-3.3-2.9 0-.35.06-.7.18-1h1.02Z" />
    </svg>
  );
}

function BulletListIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden>
      <circle cx="2.5" cy="4" r="1" />
      <circle cx="2.5" cy="8" r="1" />
      <circle cx="2.5" cy="12" r="1" />
      <path d="M5.5 3.5h8a.5.5 0 0 1 0 1h-8a.5.5 0 0 1 0-1Zm0 4h8a.5.5 0 0 1 0 1h-8a.5.5 0 0 1 0-1Zm0 4h8a.5.5 0 0 1 0 1h-8a.5.5 0 0 1 0-1Z" />
    </svg>
  );
}

function OrderedListIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden>
      <text x="0.5" y="5.2" fontSize="4" fontFamily="sans-serif">
        1
      </text>
      <text x="0.5" y="9.2" fontSize="4" fontFamily="sans-serif">
        2
      </text>
      <text x="0.5" y="13.2" fontSize="4" fontFamily="sans-serif">
        3
      </text>
      <path d="M5.5 3.5h8a.5.5 0 0 1 0 1h-8a.5.5 0 0 1 0-1Zm0 4h8a.5.5 0 0 1 0 1h-8a.5.5 0 0 1 0-1Zm0 4h8a.5.5 0 0 1 0 1h-8a.5.5 0 0 1 0-1Z" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 7h2.5v2.5c0 1.1-.6 1.7-1.7 1.7" />
      <path d="M9.5 7H12v2.5c0 1.1-.6 1.7-1.7 1.7" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6.5 8.5a3 3 0 0 0 4.5.3l1.8-1.8a3 3 0 0 0-4.2-4.2L7.6 3.8" />
      <path d="M9.5 7.5a3 3 0 0 0-4.5-.3L3.2 9a3 3 0 0 0 4.2 4.2l1-1" />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 4v3h3" />
      <path d="M4.3 10.5A4.5 4.5 0 1 0 5 5.3L4 6.3" />
    </svg>
  );
}

function RedoIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 4v3H9" />
      <path d="M11.7 10.5A4.5 4.5 0 1 1 11 5.3l1 1" />
    </svg>
  );
}

/* ─────────────────────────── popover (close-on-outside) ─────────────────────────── */

function Popover({
  trigger,
  children,
}: {
  trigger: (open: boolean, toggle: () => void) => ReactNode;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative shrink-0">
      {trigger(open, () => setOpen((o) => !o))}
      {open ? (
        <div
          className="absolute left-0 top-full z-30 mt-1 w-56 rounded-md border p-2 shadow-lg"
          style={{ borderColor: "var(--tott-card-border)", backgroundColor: "var(--tott-elevated)" }}
        >
          {children(() => setOpen(false))}
        </div>
      ) : null}
    </div>
  );
}

/* ─────────────────────────── shared button ─────────────────────────── */

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded transition-colors disabled:cursor-not-allowed disabled:opacity-40"
      style={{
        color: active ? "var(--tott-accent-gold)" : "var(--tott-home-text-muted)",
        backgroundColor: active ? "color-mix(in srgb, var(--tott-accent-gold) 14%, transparent)" : "transparent",
      }}
    >
      {children}
    </button>
  );
}

/* ─────────────────────────── slim toolbar ─────────────────────────── */

/**
 * Minimal formatting toolbar for guest-facing rich-text fields (e.g. the
 * contribution Description). Deliberately excludes font family/size, text
 * color, indent, line-spacing, and image insert — the full admin
 * `EditorToolbar` image button posts to the JWT-gated `/upload` endpoint,
 * which would 401 for logged-out visitors. Contribution attachments already
 * have a dedicated drag-and-drop uploader, so no inline image button here.
 */
export function SlimEditorToolbar() {
  const editor = useCurrentEditor();
  const disabled = !editor;

  const run = (fn: (e: Editor) => void) => () => {
    if (!editor) return;
    fn(editor);
  };

  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      className="flex w-full flex-wrap items-center gap-1 rounded-t-md border-b px-2 py-1.5"
      style={{ borderColor: "var(--tott-card-border)" }}
    >
      <ToolbarButton label="Undo" disabled={disabled || !editor?.can().undo()} onClick={run((e) => e.chain().focus().undo().run())}>
        <UndoIcon />
      </ToolbarButton>
      <ToolbarButton label="Redo" disabled={disabled || !editor?.can().redo()} onClick={run((e) => e.chain().focus().redo().run())}>
        <RedoIcon />
      </ToolbarButton>

      <span aria-hidden className="mx-1 h-4 w-px" style={{ backgroundColor: "var(--tott-card-border)" }} />

      <ToolbarButton label="Bold" disabled={disabled} active={editor?.isActive("bold")} onClick={run((e) => e.chain().focus().toggleBold().run())}>
        <BoldIcon />
      </ToolbarButton>
      <ToolbarButton label="Italic" disabled={disabled} active={editor?.isActive("italic")} onClick={run((e) => e.chain().focus().toggleItalic().run())}>
        <ItalicIcon />
      </ToolbarButton>
      <ToolbarButton label="Underline" disabled={disabled} active={editor?.isActive("underline")} onClick={run((e) => e.chain().focus().toggleUnderline().run())}>
        <UnderlineIcon />
      </ToolbarButton>
      <ToolbarButton label="Strikethrough" disabled={disabled} active={editor?.isActive("strike")} onClick={run((e) => e.chain().focus().toggleStrike().run())}>
        <StrikethroughIcon />
      </ToolbarButton>

      <span aria-hidden className="mx-1 h-4 w-px" style={{ backgroundColor: "var(--tott-card-border)" }} />

      <ToolbarButton label="Bulleted list" disabled={disabled} active={editor?.isActive("bulletList")} onClick={run((e) => e.chain().focus().toggleBulletList().run())}>
        <BulletListIcon />
      </ToolbarButton>
      <ToolbarButton label="Numbered list" disabled={disabled} active={editor?.isActive("orderedList")} onClick={run((e) => e.chain().focus().toggleOrderedList().run())}>
        <OrderedListIcon />
      </ToolbarButton>
      <ToolbarButton label="Blockquote" disabled={disabled} active={editor?.isActive("blockquote")} onClick={run((e) => e.chain().focus().toggleBlockquote().run())}>
        <QuoteIcon />
      </ToolbarButton>

      <span aria-hidden className="mx-1 h-4 w-px" style={{ backgroundColor: "var(--tott-card-border)" }} />

      <Popover
        trigger={(open, toggle) => (
          <button
            type="button"
            disabled={disabled}
            aria-label="Link"
            aria-expanded={open}
            onMouseDown={(e) => e.preventDefault()}
            onClick={toggle}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded transition-colors disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              color: editor?.isActive("link") ? "var(--tott-accent-gold)" : "var(--tott-home-text-muted)",
              backgroundColor: editor?.isActive("link")
                ? "color-mix(in srgb, var(--tott-accent-gold) 14%, transparent)"
                : "transparent",
            }}
          >
            <LinkIcon />
          </button>
        )}
      >
        {(close) => (
          <div className="flex flex-col gap-2">
            <input
              type="url"
              defaultValue={(editor?.getAttributes("link").href as string | undefined) ?? ""}
              placeholder="https://example.com"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const url = (e.target as HTMLInputElement).value.trim();
                  if (url) {
                    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
                  } else {
                    editor?.chain().focus().extendMarkRange("link").unsetLink().run();
                  }
                  close();
                }
              }}
              className="w-full rounded-md border px-2 py-1.5 text-xs outline-none"
              style={{
                borderColor: "var(--tott-card-border)",
                backgroundColor: "var(--tott-home-surface)",
                color: "var(--tott-home-text-strong)",
              }}
            />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                editor?.chain().focus().extendMarkRange("link").unsetLink().run();
                close();
              }}
              className="w-full rounded-md px-2 py-1 text-left text-xs transition-colors"
              style={{ color: "var(--tott-home-text-muted)" }}
            >
              Remove link
            </button>
          </div>
        )}
      </Popover>
    </div>
  );
}
