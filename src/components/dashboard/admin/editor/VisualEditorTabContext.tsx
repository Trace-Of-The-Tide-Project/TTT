"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { CmsTabId } from "./cms-tabs-config";

/**
 * Registered by the active tab so the header's Publish button can flush
 * unsaved work before publishing — mirrors MagazinePageEditorContent's
 * `useRegisterDraftState` (`{ isDirty, save }`).
 *
 * `pageId` is set only by tabs backed by a single publishable `CmsPage`
 * row (home; static once a page is selected there). Nav/branding are
 * `/cms/settings` keys with no publish concept, so they register
 * `pageId: null` and the header disables Publish for them instead of
 * falling back to publishing an unrelated page.
 */
export type DraftState = { isDirty: boolean; save: () => Promise<void>; pageId: string | null } | null;

type VisualEditorTabContextValue = {
  activeTab: CmsTabId;
  setActiveTab: (tab: CmsTabId) => void;
  draftState: DraftState;
  registerDraftState: (state: DraftState) => void;
};

const VisualEditorTabContext = createContext<VisualEditorTabContextValue | null>(null);

/**
 * The header (`VisualEditorPageHeader`, mounted by `admin/layout.tsx`) and
 * the tab content (`VisualEditorContent`, mounted by the `/admin/editor`
 * page) live in different subtrees, so `activeTab` + the active tab's
 * dirty/save state are lifted here for both to share.
 */
export function VisualEditorTabProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<CmsTabId>("home");
  const [draftState, setDraftState] = useState<DraftState>(null);

  const value = useMemo(
    () => ({ activeTab, setActiveTab, draftState, registerDraftState: setDraftState }),
    [activeTab, draftState],
  );

  return <VisualEditorTabContext.Provider value={value}>{children}</VisualEditorTabContext.Provider>;
}

export function useVisualEditorTab(): VisualEditorTabContextValue {
  const ctx = useContext(VisualEditorTabContext);
  if (!ctx) {
    throw new Error("useVisualEditorTab must be used within VisualEditorTabProvider");
  }
  return ctx;
}
