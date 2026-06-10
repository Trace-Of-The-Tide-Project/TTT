/** First+last word initials, e.g. "Mahmoud Darwish" → "MD"; falls back to
 * the first two characters or "?" for empty input. */
export function nameInitials(source: string): string {
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase() || "?";
}
