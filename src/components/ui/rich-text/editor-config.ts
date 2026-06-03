import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { TaskList, TaskItem } from "@tiptap/extension-list";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import { Indent, ListStyle } from "./tiptap-extensions";
import type { Extensions } from "@tiptap/react";

/**
 * Single source of truth for the editor's extensions. StarterKit v3 already
 * bundles Link and HorizontalRule, so we configure Link here (no separate
 * package) and just add the Image extension on top.
 */
export function buildEditorExtensions(placeholder?: string): Extensions {
  return [
    StarterKit.configure({
      // Open links in a new tab; keep them safe at render via sanitizeHtml.
      link: {
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      },
    }),
    Underline,
    TextStyleKit,
    Highlight.configure({ multicolor: true }),
    TextAlign.configure({ types: ["heading", "paragraph"] }),
    Indent.configure({ types: ["paragraph", "heading"] }),
    ListStyle,
    TaskList,
    TaskItem.configure({ nested: true }),
    Image.configure({ inline: false, allowBase64: false }),
    Placeholder.configure({ placeholder: placeholder ?? "", showOnlyCurrent: false }),
  ];
}

/**
 * Arabic-aware font list for the family picker. Brand fonts first so Arabic
 * content always has a real Arabic face; a few safe Latin families follow.
 */
export const EDITOR_FONT_FAMILIES = [
  "IBM Plex Sans Arabic",
  "IBM Plex Sans",
  "IBM Plex Mono",
  "Georgia",
  "Times New Roman",
  "Arial",
  "Courier New",
] as const;
