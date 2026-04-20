"use client";

import { useTranslations } from "next-intl";
import {
  FileTextIcon,
  QuoteIcon,
  ImageIcon,
  GalleryIcon,
  StarIcon,
  MoreDotsIcon,
  HeadingIcon,
} from "./ArticleEditorIcons";
export type BlockType =
  | "paragraph"
  | "heading"
  | "quote"
  | "image"
  | "gallery"
  | "callout"
  | "author-note"
  | "divider";

const BLOCKS: { id: BlockType; icon: React.ReactNode }[] = [
  { id: "paragraph", icon: <FileTextIcon /> },
  { id: "heading", icon: <HeadingIcon /> },
  { id: "quote", icon: <QuoteIcon /> },
  { id: "image", icon: <ImageIcon /> },
  { id: "gallery", icon: <GalleryIcon /> },
  { id: "callout", icon: <StarIcon /> },
  { id: "author-note", icon: <FileTextIcon /> },
  { id: "divider", icon: <MoreDotsIcon /> },
];

type AvailableBlocksProps = {
  onAddBlock: (type: BlockType) => void;
  /** If set, only these block types are offered (e.g. Open Call omits heading). */
  allowedBlockTypes?: BlockType[];
  /** Overrides the palette label for the `image` block (hero/main media naming by content type). */
  imageBlockLabel?: string;
};

export function AvailableBlocks({
  onAddBlock,
  allowedBlockTypes,
  imageBlockLabel,
}: AvailableBlocksProps) {
  const t = useTranslations("Dashboard.articles.editor.availableBlocks");
  const blocksToShow =
    allowedBlockTypes && allowedBlockTypes.length
      ? BLOCKS.filter((b) => allowedBlockTypes.includes(b.id))
      : BLOCKS;

  return (
    <div className="shrink-0 rounded-lg border border-[var(--tott-card-border)] p-4">
      <h3 className="mb-4 text-base font-bold text-foreground">{t("title")}</h3>
      <div className="flex flex-col gap-2">
        {blocksToShow.map((block) => (
          <button
            key={block.id}
            type="button"
            onClick={() => onAddBlock(block.id)}
            className="flex items-center justify-between gap-3 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-dash-surface)] px-3 py-2.5 text-left text-gray-400 transition-colors hover:border-gray-500 hover:text-gray-300"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--tott-card-border)] bg-[var(--tott-dash-icon-bg)] text-gray-500">
                {block.icon}
              </span>
              <span className="text-sm font-medium text-gray-400">
                {block.id === "image" && imageBlockLabel?.trim()
                  ? imageBlockLabel.trim()
                  : t(`palette.${block.id}`)}
              </span>
            </div>
            <span className="shrink-0 text-gray-400">+</span>
          </button>
        ))}
      </div>
    </div>
  );
}
