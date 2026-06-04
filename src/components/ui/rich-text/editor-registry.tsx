"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";

/**
 * Tracks which TipTap editor instance the toolbar should target. A single
 * "current editor" is shared across the editor body — when a paragraph block
 * gains focus, it registers itself; the toolbar reads the current editor
 * here and dispatches commands against it.
 */
type EditorRegistry = {
  currentEditor: Editor | null;
  /** Set this editor as the focused/active one. */
  setCurrentEditor: (editor: Editor | null) => void;
  /** Editors call this on unmount; only clears if it's still the current one. */
  unregisterEditor: (editor: Editor) => void;
};

const Ctx = createContext<EditorRegistry | null>(null);

export function EditorRegistryProvider({ children }: { children: React.ReactNode }) {
  const [currentEditor, setCurrentEditorState] = useState<Editor | null>(null);

  const setCurrentEditor = useCallback((editor: Editor | null) => {
    setCurrentEditorState(editor);
  }, []);

  const unregisterEditor = useCallback((editor: Editor) => {
    setCurrentEditorState((prev) => (prev === editor ? null : prev));
  }, []);

  return (
    <Ctx.Provider value={{ currentEditor, setCurrentEditor, unregisterEditor }}>
      {children}
    </Ctx.Provider>
  );
}

export function useEditorRegistry(): EditorRegistry {
  const v = useContext(Ctx);
  if (!v) {
    return {
      currentEditor: null,
      setCurrentEditor: () => {},
      unregisterEditor: () => {},
    };
  }
  return v;
}

/**
 * Read just the current editor (re-renders only when it changes). Toolbar
 * components use this to determine which editor to dispatch commands against
 * and to read active-formatting state for visual highlighting.
 */
export function useCurrentEditor(): Editor | null {
  const { currentEditor } = useEditorRegistry();
  // Force re-render on any TipTap state change so `editor.isActive(...)` reads
  // current values (selection moved, mark toggled, etc.).
  const [, force] = useState(0);
  useEffect(() => {
    if (!currentEditor) return;
    const tick = () => force((n) => n + 1);
    currentEditor.on("selectionUpdate", tick);
    currentEditor.on("transaction", tick);
    return () => {
      currentEditor.off("selectionUpdate", tick);
      currentEditor.off("transaction", tick);
    };
  }, [currentEditor]);
  return currentEditor;
}
