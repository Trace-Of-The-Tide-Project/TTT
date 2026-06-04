"use client";

import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { useEditorRegistry } from "./editor-registry";
import { buildEditorExtensions } from "./editor-config";

type RichTextEditorProps = {
  /** HTML string. Plain text from older content renders as one paragraph. */
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  /** Text direction for the editing surface. Defaults to "ltr". */
  dir?: "ltr" | "rtl";
};

/**
 * Shared TipTap rich-text input. Registers itself with the editor registry
 * on focus so the page-level <EditorToolbar> dispatches against this
 * instance. Must be rendered inside an <EditorRegistryProvider>.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  dir = "ltr",
}: RichTextEditorProps) {
  const { setCurrentEditor, unregisterEditor } = useEditorRegistry();

  const editor = useEditor({
    immediatelyRender: false,
    extensions: buildEditorExtensions(placeholder),
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
    onFocus: ({ editor }) => setCurrentEditor(editor),
    editorProps: {
      attributes: {
        dir,
        class:
          "tiptap-paragraph w-full bg-transparent border-0 outline-none px-4 py-1.5 text-sm text-foreground",
        ...(placeholder ? { "data-placeholder": placeholder } : {}),
      },
    },
  });

  // Keep the editing surface direction in sync if the active locale flips.
  useEffect(() => {
    if (!editor) return;
    editor.view.dom.setAttribute("dir", dir);
  }, [editor, dir]);

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

  return (
    <div
      className={`block w-full min-h-[160px] resize-y overflow-auto ${className ?? ""}`}
    >
      <EditorContent editor={editor} />
    </div>
  );
}
