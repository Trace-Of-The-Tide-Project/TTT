/**
 * Small visual differentiator so video / audio / artwork / thread cards
 * don't all read identically (homepage goal: mixed content types should
 * be visually distinct). Returns a label + glyph per content_type.
 */
export type ContentBadge = { label: string; glyph: string };

const BADGES: Record<string, ContentBadge> = {
  video: { label: "Watch", glyph: "▶" },
  audio: { label: "Listen", glyph: "♪" },
  artwork: { label: "Artwork", glyph: "◆" },
  figma: { label: "Visual", glyph: "◳" },
  thread: { label: "Thread", glyph: "❝" },
  trip: { label: "Trip", glyph: "⌖" },
  open_call: { label: "Open Call", glyph: "✶" },
  interview: { label: "Interview", glyph: "❢" },
  comic: { label: "Comic", glyph: "▤" },
  literary: { label: "Literary", glyph: "✎" },
  article: { label: "Read", glyph: "—" },
};

export function contentBadge(contentType: string): ContentBadge {
  return BADGES[contentType] ?? BADGES.article!;
}
