"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { MediaFolder } from "@/services/media-library.service";
import {
  ChevronRightIcon,
  FolderIcon,
  PlusIcon,
  PenLineIcon,
  TrashIcon,
} from "@/components/ui/icons";

export interface FolderTreeProps {
  folders: MediaFolder[];
  selectedFolderId: string | null;
  onSelect: (folderId: string | null) => void;
  /** Omit any of these three to render FolderTree as a pure picker (no
   * create/rename/delete affordances) — used by MoveToFolderModal. */
  onCreateFolder?: (parentId: string | null) => void;
  onRenameFolder?: (folder: MediaFolder) => void;
  onDeleteFolder?: (folder: MediaFolder) => void;
}

interface FolderNode extends MediaFolder {
  children: FolderNode[];
}

function buildTree(folders: MediaFolder[]): FolderNode[] {
  const nodes = new Map<string, FolderNode>();
  folders.forEach((f) => nodes.set(f.id, { ...f, children: [] }));

  const roots: FolderNode[] = [];
  nodes.forEach((node) => {
    if (node.parent_id && nodes.has(node.parent_id)) {
      nodes.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

const rowActionBtnClass =
  "opacity-0 group-hover:opacity-100 focus-within:opacity-100 rounded p-1 text-[var(--tott-muted)] hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground";

export function FolderTree({
  folders,
  selectedFolderId,
  onSelect,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
}: FolderTreeProps) {
  const t = useTranslations("Dashboard.mediaLibrary");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAndExpand = (node: FolderNode) => {
    onSelect(node.id);
    if (node.children.length > 0) {
      setExpanded((prev) => new Set(prev).add(node.id));
    }
  };

  const renderNode = (node: FolderNode, depth: number) => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expanded.has(node.id);
    const isSelected = selectedFolderId === node.id;

    return (
      <div key={node.id}>
        <div
          className={`group flex items-center gap-1 rounded py-1.5 pe-2 cursor-pointer ${
            isSelected
              ? "bg-[var(--tott-dash-control-bg)] text-foreground"
              : "text-[var(--tott-muted)] hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
          }`}
          style={{ paddingInlineStart: `${depth * 16 + 8}px` }}
          onClick={() => selectAndExpand(node)}
        >
          {hasChildren ? (
            <button
              type="button"
              aria-expanded={isExpanded}
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(node.id);
              }}
              className="shrink-0 rounded p-0.5 text-[var(--tott-muted)] hover:text-foreground"
            >
              <span
                className={`inline-block transition-transform ${isExpanded ? "rotate-90" : ""}`}
              >
                <ChevronRightIcon />
              </span>
            </button>
          ) : (
            <span className="inline-block h-4 w-4 shrink-0" />
          )}
          <FolderIcon />
          <span className="min-w-0 flex-1 truncate">{node.name}</span>
          {onCreateFolder && (
            <button
              type="button"
              aria-label={t("folders.addSubfolder")}
              onClick={(e) => {
                e.stopPropagation();
                onCreateFolder(node.id);
              }}
              className={rowActionBtnClass}
            >
              <PlusIcon />
            </button>
          )}
          {onRenameFolder && (
            <button
              type="button"
              aria-label={t("folders.renameAria", { name: node.name })}
              onClick={(e) => {
                e.stopPropagation();
                onRenameFolder(node);
              }}
              className={rowActionBtnClass}
            >
              <PenLineIcon />
            </button>
          )}
          {onDeleteFolder && (
            <button
              type="button"
              aria-label={t("folders.deleteAria", { name: node.name })}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteFolder(node);
              }}
              className={rowActionBtnClass}
            >
              <TrashIcon />
            </button>
          )}
        </div>
        {hasChildren && isExpanded && (
          <div>{node.children.map((child) => renderNode(child, depth + 1))}</div>
        )}
      </div>
    );
  };

  const tree = buildTree(folders);

  return (
    <nav aria-label="Folders" className="flex flex-col gap-0.5">
      <div
        className={`flex items-center gap-1 rounded py-1.5 ps-2 pe-2 cursor-pointer ${
          selectedFolderId === null
            ? "bg-[var(--tott-dash-control-bg)] text-foreground"
            : "text-[var(--tott-muted)] hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
        }`}
        onClick={() => onSelect(null)}
      >
        <span className="inline-block h-4 w-4 shrink-0" />
        <FolderIcon />
        <span className="min-w-0 flex-1 truncate">{t("folders.root")}</span>
        {onCreateFolder && (
          <button
            type="button"
            aria-label={t("folders.addSubfolder")}
            onClick={(e) => {
              e.stopPropagation();
              onCreateFolder(null);
            }}
            className="rounded p-1 text-[var(--tott-muted)] hover:bg-[var(--tott-dash-ghost-hover)] hover:text-foreground"
          >
            <PlusIcon />
          </button>
        )}
      </div>
      {tree.map((node) => renderNode(node, 0))}
    </nav>
  );
}
