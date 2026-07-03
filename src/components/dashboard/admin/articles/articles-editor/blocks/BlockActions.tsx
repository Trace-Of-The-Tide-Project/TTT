"use client";

export type BlockActionsMode = "copy-delete" | "delete-only";

export const BLOCK_DRAG_MIME = "application/x-tott-block-id";

/* Action panel icons — matched to `Button-3.svg` (40×120 panel, #333 bg).
   Each icon's viewBox crops the corresponding region of the original 40×120
   coordinate space so the glyphs are 1:1 with the Figma export. */

function PanelDragIcon() {
  return (
    <svg
      width="12"
      height="20"
      viewBox="14 18 12 19"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M16 21C16 21.2652 16.1054 21.5196 16.2929 21.7071C16.4804 21.8946 16.7348 22 17 22C17.2652 22 17.5196 21.8946 17.7071 21.7071C17.8946 21.5196 18 21.2652 18 21C18 20.7348 17.8946 20.4804 17.7071 20.2929C17.5196 20.1054 17.2652 20 17 20C16.7348 20 16.4804 20.1054 16.2929 20.2929C16.1054 20.4804 16 20.7348 16 21Z" />
      <path d="M16 28C16 28.2652 16.1054 28.5196 16.2929 28.7071C16.4804 28.8946 16.7348 29 17 29C17.2652 29 17.5196 28.8946 17.7071 28.7071C17.8946 28.5196 18 28.2652 18 28C18 27.7348 17.8946 27.4804 17.7071 27.2929C17.5196 27.1054 17.2652 27 17 27C16.7348 27 16.4804 27.1054 16.2929 27.2929C16.1054 27.4804 16 27.7348 16 28Z" />
      <path d="M16 35C16 35.2652 16.1054 35.5196 16.2929 35.7071C16.4804 35.8946 16.7348 36 17 36C17.2652 36 17.5196 35.8946 17.7071 35.7071C17.8946 35.5196 18 35.2652 18 35C18 34.7348 17.8946 34.4804 17.7071 34.2929C17.5196 34.1054 17.2652 34 17 34C16.7348 34 16.4804 34.1054 16.2929 34.2929C16.1054 34.4804 16 34.7348 16 35Z" />
      <path d="M22 21C22 21.2652 22.1054 21.5196 22.2929 21.7071C22.4804 21.8946 22.7348 22 23 22C23.2652 22 23.5196 21.8946 23.7071 21.7071C23.8946 21.5196 24 21.2652 24 21C24 20.7348 23.8946 20.4804 23.7071 20.2929C23.5196 20.1054 23.2652 20 23 20C22.7348 20 22.4804 20.1054 22.2929 20.2929C22.1054 20.4804 22 20.7348 22 21Z" />
      <path d="M22 28C22 28.2652 22.1054 28.5196 22.2929 28.7071C22.4804 28.8946 22.7348 29 23 29C23.2652 29 23.5196 28.8946 23.7071 28.7071C23.8946 28.5196 24 28.2652 24 28C24 27.7348 23.8946 27.4804 23.7071 27.2929C23.5196 27.1054 23.2652 27 23 27C22.7348 27 22.4804 27.1054 22.2929 27.2929C22.1054 27.4804 22 27.7348 22 28Z" />
      <path d="M22 35C22 35.2652 22.1054 35.5196 22.2929 35.7071C22.4804 35.8946 22.7348 36 23 36C23.2652 36 23.5196 35.8946 23.7071 35.7071C23.8946 35.5196 24 35.2652 24 35C24 34.7348 23.8946 34.4804 23.7071 34.2929C23.5196 34.1054 23.2652 34 23 34C22.7348 34 22.4804 34.1054 22.2929 34.2929C22.1054 34.4804 22 34.7348 22 35Z" />
    </svg>
  );
}

function PanelCopyIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="10 50 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12.012 64.737C11.7053 64.5622 11.4503 64.3095 11.2726 64.0045C11.0949 63.6995 11.0009 63.353 11 63V53C11 51.9 11.9 51 13 51H23C23.75 51 24.158 51.385 24.5 52M15 57.667C15 56.9597 15.281 56.2813 15.7811 55.7811C16.2813 55.281 16.9597 55 17.667 55H26.333C26.6832 55 27.03 55.069 27.3536 55.203C27.6772 55.337 27.9712 55.5335 28.2189 55.7811C28.4665 56.0288 28.663 56.3228 28.797 56.6464C28.931 56.97 29 57.3168 29 57.667V66.333C29 66.6832 28.931 67.03 28.797 67.3536C28.663 67.6772 28.4665 67.9712 28.2189 68.2189C27.9712 68.4665 27.6772 68.663 27.3536 68.797C27.03 68.931 26.6832 69 26.333 69H17.667C17.3168 69 16.97 68.931 16.6464 68.797C16.3228 68.663 16.0288 68.4665 15.7811 68.2189C15.5335 67.9712 15.337 67.6772 15.203 67.3536C15.069 67.03 15 66.6832 15 66.333V57.667Z" />
    </svg>
  );
}

function PanelTrashIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="11 82 18 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 87H28M18 91V97M22 91V97M13 87L14 99C14 99.5304 14.2107 100.039 14.5858 100.414C14.9609 100.789 15.4696 101 16 101H24C24.5304 101 25.0391 100.789 25.4142 100.414C25.7893 100.039 26 99.5304 26 99L27 87M17 87V84C17 83.7348 17.1054 83.4804 17.2929 83.2929C17.4804 83.1054 17.7348 83 18 83H22C22.2652 83 22.5196 83.1054 22.7071 83.2929C22.8946 83.4804 23 83.7348 23 84V87" />
    </svg>
  );
}

export function BlockActions({
  blockId,
  isDragging,
  onDragStart,
  onDragEnd,
  onDelete,
  onCopy,
  mode,
}: {
  blockId: string;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  onDelete: () => void;
  onCopy: () => void;
  mode: BlockActionsMode;
}) {
  return (
    <div
      className="flex w-10 shrink-0 flex-col items-center self-start rounded-lg bg-[var(--tott-dash-control-bg)] py-1 text-[var(--tott-muted)]"
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}
    >
      <div
        role="button"
        tabIndex={0}
        draggable
        aria-label="Drag to reorder"
        title="Drag to reorder"
        onDragStart={(e) => onDragStart(e, blockId)}
        onDragEnd={onDragEnd}
        className={`flex h-10 w-10 cursor-grab items-center justify-center select-none active:cursor-grabbing ${
          isDragging ? "opacity-50" : ""
        }`}
      >
        <PanelDragIcon />
      </div>
      {mode === "copy-delete" ? (
        <button
          type="button"
          onClick={onCopy}
          className="flex h-10 w-10 items-center justify-center"
          aria-label="Copy text"
        >
          <PanelCopyIcon />
        </button>
      ) : null}
      <button
        type="button"
        onClick={onDelete}
        className="flex h-10 w-10 items-center justify-center"
        aria-label="Delete"
      >
        <PanelTrashIcon />
      </button>
    </div>
  );
}

export function blockActionsModeFor(
  blockType: string,
  blockId: string,
  firstImageBlockId: string | undefined
): BlockActionsMode {
  if (blockType === "author-note") {
    return "delete-only";
  }
  // No text content to copy — media/divider blocks only drag and delete.
  if (["image", "video", "audio", "gallery", "divider"].includes(blockType)) {
    return "delete-only";
  }
  if (blockType === "image" && firstImageBlockId != null && blockId === firstImageBlockId) {
    return "delete-only";
  }
  return "copy-delete";
}
