import type { ContentBlock } from "./ContentBlocks";
import type { BlockType } from "./AvailableBlocks";

/** Block types allowed for Open Call (API has no `heading`). */
export const openCallAllowedBlockTypes: BlockType[] = [
  "paragraph",
  "quote",
  "image",
  "gallery",
  "callout",
  "author-note",
  "divider",
];

export type ContentFormConfig = {
  contentType: string;
  titlePlaceholder: string;
  defaultBlocks: ContentBlock[];
  blockLabels?: Partial<Record<BlockType, string>>;
  iconBlockType: "paragraph" | "image";
  settingsTitle: string;
  primaryButtonLabel: string;
  /** When true, renders the rich-text toolbar above the editor body. */
  showToolbar?: boolean;
  /** When set, restricts the AvailableBlocks palette to these types. */
  allowedBlockTypes?: BlockType[];
  /** Skip the "first image is the cover/hero" detection — treat every image
   *  block as a regular file upload. Articles use this; media types don't. */
  disableHero?: boolean;
};

/** Article block set — the seven blocks the design calls for (no heading). */
export const articleAllowedBlockTypes: BlockType[] = [
  "paragraph",
  "quote",
  "image",
  "gallery",
  "callout",
  "author-note",
  "divider",
];

/** Artwork block set — paragraph, quote, image, gallery, caption text, author note, meta data, divider. */
export const artworkAllowedBlockTypes: BlockType[] = [
  "paragraph",
  "quote",
  "image",
  "gallery",
  "caption-text",
  "author-note",
  "meta-data",
  "divider",
];

/** Video block set — Video, Image, Paragraph, Quote, Callout, Author note, Divider. */
export const videoAllowedBlockTypes: BlockType[] = [
  "video",
  "image",
  "paragraph",
  "quote",
  "callout",
  "author-note",
  "divider",
];

/** Audio block set — Audio, Image, Paragraph, Quote, Callout, Author note, Divider. */
export const audioAllowedBlockTypes: BlockType[] = [
  "audio",
  "image",
  "paragraph",
  "quote",
  "callout",
  "author-note",
  "divider",
];

/** Thread block set — Paragraph, Quote, Image, Gallery, Callout, Author note, Divider. */
export const threadAllowedBlockTypes: BlockType[] = [
  "paragraph",
  "quote",
  "image",
  "gallery",
  "callout",
  "author-note",
  "divider",
];

/** Open Call: same block set as article but no heading (API enum). */
export const openCallConfig: ContentFormConfig = {
  contentType: "open-call",
  titlePlaceholder: "Enter your content title here...",
  defaultBlocks: [
    { id: "1", type: "paragraph", content: "" },
    { id: "2", type: "quote", content: "", quoteAttribution: "" },
    { id: "3", type: "image" },
    { id: "4", type: "callout", content: "", calloutTitle: "" },
    { id: "5", type: "author-note", content: "" },
  ],
  blockLabels: {
    paragraph: "Describe your content...",
    quote: "Quote",
    callout: "Callout",
    "author-note": "Author note",
  },
  iconBlockType: "paragraph",
  settingsTitle: "Content Settings",
  primaryButtonLabel: "Publish Now",
  showToolbar: true,
  allowedBlockTypes: openCallAllowedBlockTypes,
  disableHero: true,
};

export const articleConfig: ContentFormConfig = {
  contentType: "article",
  titlePlaceholder: "Enter your article title...",
  defaultBlocks: [
    { id: "1", type: "paragraph", content: "" },
    { id: "2", type: "quote", content: "" },
    { id: "3", type: "image" },
    { id: "4", type: "callout", content: "" },
    { id: "5", type: "author-note", content: "" },
  ],
  blockLabels: {
    paragraph: "Start writing your article...",
    quote: "Quote",
    callout: "Callout",
    "author-note": "Author note",
  },
  iconBlockType: "paragraph",
  settingsTitle: "Article Settings",
  primaryButtonLabel: "Publish Now",
  showToolbar: true,
  allowedBlockTypes: articleAllowedBlockTypes,
  disableHero: true,
};

export const videoConfig: ContentFormConfig = {
  contentType: "video",
  titlePlaceholder: "Enter your Video title...",
  defaultBlocks: [
    { id: "1", type: "video" },
    { id: "2", type: "paragraph", content: "" },
    { id: "3", type: "quote", content: "", quoteAttribution: "" },
    { id: "4", type: "callout", content: "", calloutTitle: "" },
    { id: "5", type: "author-note", content: "" },
  ],
  blockLabels: {
    paragraph: "Describe your video",
    heading: "Section title",
    quote: "Quote",
    callout: "Callout",
    "author-note": "Author note",
  },
  iconBlockType: "image",
  settingsTitle: "Video Settings",
  primaryButtonLabel: "Publish Video",
  allowedBlockTypes: videoAllowedBlockTypes,
  disableHero: true,
};

export const threadConfig: ContentFormConfig = {
  contentType: "thread",
  titlePlaceholder: "Enter your Thread title...",
  defaultBlocks: [
    { id: "1", type: "paragraph", content: "" },
    { id: "2", type: "paragraph", content: "", placeholder: "Continue your narrative..." },
    { id: "3", type: "image" },
    { id: "4", type: "quote", content: "", quoteAttribution: "" },
    { id: "5", type: "paragraph", content: "", placeholder: "Write your content here..." },
    { id: "6", type: "callout", content: "", calloutTitle: "" },
    { id: "7", type: "author-note", content: "" },
  ],
  blockLabels: {
    paragraph: "First part of your story...",
    heading: "Section title",
    quote: "Quote",
    callout: "Callout",
    "author-note": "Author note",
  },
  iconBlockType: "paragraph",
  settingsTitle: "Thread Settings",
  primaryButtonLabel: "Publish Thread",
  allowedBlockTypes: threadAllowedBlockTypes,
  disableHero: true,
};

export const audioConfig: ContentFormConfig = {
  contentType: "audio",
  titlePlaceholder: "Enter your Audio title...",
  defaultBlocks: [
    { id: "1", type: "audio" },
    { id: "2", type: "image" },
    { id: "3", type: "paragraph", content: "" },
    { id: "4", type: "paragraph", content: "", placeholder: "Write your content here..." },
    { id: "5", type: "quote", content: "", quoteAttribution: "" },
    { id: "6", type: "callout", content: "", calloutTitle: "" },
    { id: "7", type: "author-note", content: "" },
  ],
  blockLabels: {
    paragraph: "Episode notes...",
    heading: "Section title",
    quote: "Quote",
    callout: "Callout",
    "author-note": "Author note",
  },
  iconBlockType: "image",
  settingsTitle: "Audio Settings",
  primaryButtonLabel: "Publish Audio",
  allowedBlockTypes: audioAllowedBlockTypes,
  disableHero: true,
};

export const artworkConfig: ContentFormConfig = {
  contentType: "artwork",
  titlePlaceholder: "Enter your Artwork title...",
  defaultBlocks: [
    { id: "1", type: "image" },
    { id: "2", type: "paragraph", content: "" },
    { id: "3", type: "quote", content: "", quoteAttribution: "" },
    { id: "4", type: "paragraph", content: "", placeholder: "Write your content here..." },
    { id: "5", type: "author-note", content: "" },
    { id: "6", type: "meta-data", content: "" },
    { id: "7", type: "caption-text", content: "" },
  ],
  blockLabels: {
    paragraph: "Artist statement…",
    quote: "Quote",
    "author-note": "Author note",
    "caption-text": "Caption Text…",
    "meta-data": "Metadata: Camera | Medium | Date",
  },
  iconBlockType: "image",
  settingsTitle: "Artwork Settings",
  primaryButtonLabel: "Publish Artwork",
  allowedBlockTypes: artworkAllowedBlockTypes,
  disableHero: true,
};

/** Pick create/edit defaults from API `content_type`. */
export function contentFormConfigForType(contentType: string | undefined): ContentFormConfig {
  const t = (contentType || "article").toLowerCase().replace(/-/g, "_");
  if (t === "video") return videoConfig;
  if (t === "thread") return threadConfig;
  if (t === "audio") return audioConfig;
  if (t === "artwork") return artworkConfig;
  if (t === "open_call" || t === "opencall") return openCallConfig;
  return articleConfig;
}

/** Labels for the first hero block (still an `image` block in the editor; API uses `image` / `video` / `audio`). */
export type MainMediaEditorCopy = {
  blockName: string;
  uploadTitle: string;
  uploadDetail: string;
  pasteUrlHint: string;
  addBlockButton: string;
  missingHeroBlurb: string;
};

export function mainMediaEditorCopy(contentType: string | undefined): MainMediaEditorCopy {
  const t = (contentType || "article").toLowerCase().replace(/-/g, "_");
  if (t === "video") {
    return {
      blockName: "Video",
      uploadTitle: "Upload video",
      uploadDetail:
        "MP4, WebM, or QuickTime — this is what plays full-width at the top of the public video page.",
      pasteUrlHint: "Or paste your video URL",
      addBlockButton: "Add video block",
      missingHeroBlurb:
        "No video yet. Add the video block — it is the hero at the top of the public page.",
    };
  }
  if (t === "audio") {
    return {
      blockName: "Audio",
      uploadTitle: "Upload audio",
      uploadDetail: "MP3, WAV, AAC, and other audio — shown as the playable hero on the public audio page.",
      pasteUrlHint: "Or paste your audio file URL",
      addBlockButton: "Add audio block",
      missingHeroBlurb:
        "No audio yet. Add the audio block — it is the hero at the top of the public page.",
    };
  }
  if (t === "thread") {
    return {
      blockName: "Cover",
      uploadTitle: "Upload cover",
      uploadDetail: "Image ~1200×630px (or video/audio) — shown first on the public thread page.",
      pasteUrlHint: "Or paste cover image, video, or audio URL",
      addBlockButton: "Add cover block",
      missingHeroBlurb:
        "No cover yet. Add the cover block — it is the hero at the top of the public page.",
    };
  }
  if (t === "open_call" || t === "opencall") {
    return {
      blockName: "Main media",
      uploadTitle: "Upload main file",
      uploadDetail: "Image, video, or audio — the hero visitors see first for this open call.",
      pasteUrlHint: "Or paste main file URL (image, video, or audio)",
      addBlockButton: "Add main media block",
      missingHeroBlurb:
        "No main media yet. Add the main media block — it is the hero at the top of the public page.",
    };
  }
  if (t === "artwork") {
    return {
      blockName: "Artwork",
      uploadTitle: "Upload artwork",
      uploadDetail: "Image of the artwork — shown as the hero on the public artwork page.",
      pasteUrlHint: "Or paste an image URL",
      addBlockButton: "Add artwork block",
      missingHeroBlurb:
        "No artwork yet. Add the artwork block — it is the hero at the top of the public page.",
    };
  }
  return {
    blockName: "Cover",
    uploadTitle: "Upload cover",
    uploadDetail: "Image ~1200×630px (or video/audio) — shown first on the public article page.",
    pasteUrlHint: "Or paste cover image, video, or audio URL",
    addBlockButton: "Add cover block",
    missingHeroBlurb:
      "No cover yet. Add the cover block — it is the hero at the top of the public page.",
  };
}
