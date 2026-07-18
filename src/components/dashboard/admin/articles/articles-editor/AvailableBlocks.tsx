"use client";

import { useTranslations } from "next-intl";
import { ChamferedPanel } from "@/components/ui/ChamferedPanel";

export type BlockType =
  | "paragraph"
  | "heading"
  | "quote"
  | "pull-quote"
  | "image"
  | "video"
  | "audio"
  | "gallery"
  | "callout"
  | "author-note"
  | "caption-text"
  | "meta-data"
  | "divider"
  | "list"
  | "embed";

/* ─────────────────────────── icons (Figma `Trailing Icon-{1..6}.svg`) ───
   Each icon is the exact path from the Figma export. Stroke `#7B7B7B`,
   1.5px width, rounded caps/joins. viewBox 0 0 28 24 (28×24). */

const iconProps = {
  width: 28,
  height: 24,
  viewBox: "0 0 28 24",
  fill: "none" as const,
  // `currentColor` lets the parent's text color drive the stroke, so hover
  // states on the row swap the icon color for free.
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
} as const;

function ParagraphTrailingIcon() {
  return (
    <svg {...iconProps} aria-hidden>
      <path d="M9 7.83268V6.16602H19.8333V7.83268M14.8333 6.16602V17.8327M16.5 17.8327H13.1667" />
    </svg>
  );
}

function QuoteTrailingIcon() {
  return (
    <svg {...iconProps} aria-hidden>
      <path d="M11.8571 10.75H7.57143C7.28727 10.75 7.01475 10.6183 6.81381 10.3839C6.61288 10.1495 6.5 9.83152 6.5 9.5V5.75C6.5 5.41848 6.61288 5.10054 6.81381 4.86612C7.01475 4.6317 7.28727 4.5 7.57143 4.5H10.7857C11.0699 4.5 11.3424 4.6317 11.5433 4.86612C11.7443 5.10054 11.8571 5.41848 11.8571 5.75V13.25C11.8571 16.5838 10.4289 18.6663 7.57143 19.5M21.5 10.75H17.2143C16.9301 10.75 16.6576 10.6183 16.4567 10.3839C16.2557 10.1495 16.1429 9.83152 16.1429 9.5V5.75C16.1429 5.41848 16.2557 5.10054 16.4567 4.86612C16.6576 4.6317 16.9301 4.5 17.2143 4.5H20.4286C20.7127 4.5 20.9853 4.6317 21.1862 4.86612C21.3871 5.10054 21.5 5.41848 21.5 5.75V13.25C21.5 16.5838 20.0718 18.6663 17.2143 19.5" />
    </svg>
  );
}

/** Pull quote — bold serif "T" with flanking accent bars, distinct from the plain quote glyph. */
function PullQuoteTrailingIcon() {
  return (
    <svg {...iconProps} aria-hidden>
      <path d="M9 6h10M14 6v12M7 20h4M15 20h4M6.5 10.5v3M21.5 10.5v3" />
    </svg>
  );
}

/** Embed — a play glyph inside a frame, for external video embeds. */
function EmbedTrailingIcon() {
  return (
    <svg {...iconProps} aria-hidden>
      <path d="M6.5 6.375C6.5 5.87772 6.69754 5.40081 7.04917 5.04917C7.40081 4.69754 7.87772 4.5 8.375 4.5H19.625C20.1223 4.5 20.5992 4.69754 20.9508 5.04917C21.3025 5.40081 21.5 5.87772 21.5 6.375V17.625C21.5 18.1223 21.3025 18.5992 20.9508 18.9508C20.5992 19.3025 20.1223 19.5 19.625 19.5H8.375C7.87772 19.5 7.40081 19.3025 7.04917 18.9508C6.69754 18.5992 6.5 18.1223 6.5 17.625V6.375Z" />
      <path d="M12.5 9.5L16.5 12L12.5 14.5V9.5Z" />
    </svg>
  );
}

function ImageTrailingIcon() {
  return (
    <svg {...iconProps} aria-hidden>
      <path d="M6.5 15.75H21.5M6.5 12L9.3125 9.1875C10.1825 8.35031 11.255 8.35031 12.125 9.1875L15.875 12.9375M14.9375 12L16.8125 10.125C17.6825 9.28781 18.755 9.28781 19.625 10.125L21.5 12M15.875 7.3125H15.8844M6.5 6.375C6.5 5.87772 6.69754 5.40081 7.04917 5.04917C7.40081 4.69754 7.87772 4.5 8.375 4.5H19.625C20.1223 4.5 20.5992 4.69754 20.9508 5.04917C21.3025 5.40081 21.5 5.87772 21.5 6.375V17.625C21.5 18.1223 21.3025 18.5992 20.9508 18.9508C20.5992 19.3025 20.1223 19.5 19.625 19.5H8.375C7.87772 19.5 7.40081 19.3025 7.04917 18.9508C6.69754 18.5992 6.5 18.1223 6.5 17.625V6.375Z" />
    </svg>
  );
}

function CalloutTrailingIcon() {
  return (
    <svg {...iconProps} aria-hidden>
      <path d="M14.0004 16.7913L8.85702 19.4955L9.83952 13.768L5.67285 9.71214L11.4229 8.8788L13.9945 3.66797L16.5662 8.8788L22.3162 9.71214L18.1495 13.768L19.132 19.4955L14.0004 16.7913Z" />
    </svg>
  );
}

function DividerTrailingIcon() {
  return (
    <svg {...iconProps} aria-hidden>
      <path d="M13.167 12.0007C13.167 12.2217 13.2548 12.4336 13.4111 12.5899C13.5674 12.7462 13.7793 12.834 14.0003 12.834C14.2213 12.834 14.4333 12.7462 14.5896 12.5899C14.7459 12.4336 14.8337 12.2217 14.8337 12.0007C14.8337 11.7796 14.7459 11.5677 14.5896 11.4114C14.4333 11.2551 14.2213 11.1673 14.0003 11.1673C13.7793 11.1673 13.5674 11.2551 13.4111 11.4114C13.2548 11.5677 13.167 11.7796 13.167 12.0007Z" />
      <path d="M13.167 17.834C13.167 18.055 13.2548 18.267 13.4111 18.4232C13.5674 18.5795 13.7793 18.6673 14.0003 18.6673C14.2213 18.6673 14.4333 18.5795 14.5896 18.4232C14.7459 18.267 14.8337 18.055 14.8337 17.834C14.8337 17.613 14.7459 17.401 14.5896 17.2447C14.4333 17.0884 14.2213 17.0007 14.0003 17.0007C13.7793 17.0007 13.5674 17.0884 13.4111 17.2447C13.2548 17.401 13.167 17.613 13.167 17.834Z" />
      <path d="M13.167 6.16732C13.167 6.38833 13.2548 6.60029 13.4111 6.75657C13.5674 6.91285 13.7793 7.00065 14.0003 7.00065C14.2213 7.00065 14.4333 6.91285 14.5896 6.75657C14.7459 6.60029 14.8337 6.38833 14.8337 6.16732C14.8337 5.9463 14.7459 5.73434 14.5896 5.57806C14.4333 5.42178 14.2213 5.33398 14.0003 5.33398C13.7793 5.33398 13.5674 5.42178 13.4111 5.57806C13.2548 5.73434 13.167 5.9463 13.167 6.16732Z" />
    </svg>
  );
}

/** Video block — film/camera glyph (aligns with Figma Available Blocks list). */
function VideoTrailingIcon() {
  return (
    <svg {...iconProps} aria-hidden>
      <path d="M6.5 6.5h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM21.5 8.5l-3 2.5v2l3 2.5v-7z" />
    </svg>
  );
}

/** Audio block — waveform / speaker glyph. */
function AudioTrailingIcon() {
  return (
    <svg {...iconProps} aria-hidden>
      <path d="M9 7v10M12 5v14M15 8v8M6 10v4M18 10v4" />
    </svg>
  );
}

/** Caption text — short captioned line glyph. */
function CaptionTextTrailingIcon() {
  return (
    <svg {...iconProps} aria-hidden>
      <path d="M6.5 8.5H21.5M6.5 13H17M6.5 17.5H14" />
    </svg>
  );
}

/** Meta-data — structured rows / pipe glyph. */
function MetaDataTrailingIcon() {
  return (
    <svg {...iconProps} aria-hidden>
      <path d="M9 7H21M9 12H21M9 17H21M5.5 7H6M5.5 12H6M5.5 17H6" />
    </svg>
  );
}

function PlusTrailingIcon() {
  return (
    <svg {...iconProps} aria-hidden>
      <path d="M14.0003 6.16602V17.8327M8.16699 11.9993H19.8337" />
    </svg>
  );
}

/* ─────────────────────────── block roster ─────────────────────────── */

const BLOCKS: { id: BlockType; icon: React.ReactNode }[] = [
  { id: "paragraph", icon: <ParagraphTrailingIcon /> },
  { id: "heading", icon: <ParagraphTrailingIcon /> },
  { id: "quote", icon: <QuoteTrailingIcon /> },
  { id: "pull-quote", icon: <PullQuoteTrailingIcon /> },
  { id: "image", icon: <ImageTrailingIcon /> },
  { id: "video", icon: <VideoTrailingIcon /> },
  { id: "audio", icon: <AudioTrailingIcon /> },
  // Gallery reuses the image (cover) glyph so it reads as "more pictures".
  { id: "gallery", icon: <ImageTrailingIcon /> },
  { id: "callout", icon: <CalloutTrailingIcon /> },
  // Author note shares the paragraph "T" glyph; both are text affordances.
  { id: "author-note", icon: <ParagraphTrailingIcon /> },
  { id: "caption-text", icon: <CaptionTextTrailingIcon /> },
  { id: "meta-data", icon: <MetaDataTrailingIcon /> },
  { id: "divider", icon: <DividerTrailingIcon /> },
  { id: "embed", icon: <EmbedTrailingIcon /> },
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
    <ChamferedPanel className="shrink-0 p-4">
      <h3 className="mb-4 text-base font-bold text-foreground">{t("title")}</h3>
      <div className="flex flex-col gap-2">
        {blocksToShow.map((block) => (
          <button
            key={block.id}
            type="button"
            onClick={() => onAddBlock(block.id)}
            className="group flex items-center justify-between gap-3 rounded-lg border border-[var(--tott-card-border)] bg-[var(--tott-elevated)] px-3 py-2 text-left transition-colors hover:border-[var(--tott-muted)] hover:bg-[var(--tott-elevated-hover)]"
          >
            <div className="flex items-center gap-2 text-[var(--tott-muted)] group-hover:text-foreground">
              <span className="shrink-0">{block.icon}</span>
              <span className="text-sm font-medium">
                {block.id === "image" && imageBlockLabel?.trim()
                  ? imageBlockLabel.trim()
                  : t(`palette.${block.id}`)}
              </span>
            </div>
            <span className="shrink-0 text-[var(--tott-muted)] group-hover:text-foreground">
              <PlusTrailingIcon />
            </span>
          </button>
        ))}
      </div>
    </ChamferedPanel>
  );
}
