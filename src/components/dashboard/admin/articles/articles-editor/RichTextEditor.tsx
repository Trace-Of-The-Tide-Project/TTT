"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import { TaskList, TaskItem } from "@tiptap/extension-list";
import Placeholder from "@tiptap/extension-placeholder";
import { useEditorRegistry } from "./lib/editor-registry";
import { Indent, ListStyle } from "./lib/tiptap-extensions";

type RichTextEditorProps = {
  /** HTML string. Plain text from older articles renders as a single paragraph. */
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

/**
 * TipTap-powered rich-text input used inside paragraph blocks. Registers
 * itself with the editor registry on focus so the page-level toolbar
 * dispatches commands against this instance.
 */
export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const { setCurrentEditor, unregisterEditor } = useEditorRegistry();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      // TextStyleKit bundles the TextStyle mark + Color + FontFamily +
      // FontSize + LineHeight + BackgroundColor sub-extensions, so the
      // chain commands (`setFontFamily`, `setColor`, `setLineHeight`, …)
      // are actually registered. The base `TextStyle` alone only adds the
      // mark — without sub-extensions those commands are undefined at runtime.
      TextStyleKit,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Indent.configure({ types: ["paragraph", "heading"] }),
      ListStyle,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder: placeholder ?? "",
        showOnlyCurrent: false,
      }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
    onFocus: ({ editor }) => {
      setCurrentEditor(editor);
    },
    editorProps: {
      attributes: {
        class:
          "tiptap-paragraph w-full bg-transparent border-0 outline-none px-4 py-4 text-sm text-foreground",
        ...(placeholder ? { "data-placeholder": placeholder } : {}),
      },
    },
  });

  // Sync the editor when `value` changes externally — e.g. the trash button
  // resets `content` to `""` or an article is loaded in edit mode. TipTap
  // serializes "empty" as `<p></p>` while we store `""`, so treat both as
  // the same to avoid a no-op write triggering a re-render loop.
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const target = value || "";
    const currentEmpty = current === "" || current === "<p></p>";
    const targetEmpty = target === "";
    if (currentEmpty && targetEmpty) return;
    if (current === target) return;
    editor.commands.setContent(target, { emitUpdate: false });
  }, [editor, value]);

  useEffect(() => {
    return () => {
      if (editor) unregisterEditor(editor);
    };
  }, [editor, unregisterEditor]);

  // Outer wrapper carries the resize handle (CSS `resize: vertical`). Min
  // height matches the old textarea so the box doesn't collapse when empty.
  return (
    <div
      className={`block w-full min-h-[160px] resize-y overflow-auto ${className ?? ""}`}
    >
      <EditorContent editor={editor} />
    </div>
  );
}
