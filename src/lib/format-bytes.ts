const UNITS = ["B", "KB", "MB", "GB"] as const;

/** "1536" -> "1.5 KB". Returns "—" for null/negative (not yet known). */
export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null || bytes < 0) return "—";
  if (bytes === 0) return "0 B";
  const exp = Math.min(Math.floor(Math.log2(bytes) / 10), UNITS.length - 1);
  const value = bytes / Math.pow(1024, exp);
  return `${exp === 0 ? value : value.toFixed(1)} ${UNITS[exp]}`;
}
