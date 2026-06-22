/**
 * next/image guard, mirroring MagazineHero's safeArtwork: any src that isn't
 * a local path or http(s) URL would make Next throw `Failed to construct URL`,
 * so we treat it as missing. External URLs render unoptimized so the Next
 * loader doesn't gate the hostname.
 */
export function safeImage(src: string | null | undefined): {
  src: string;
  unoptimized: boolean;
} | null {
  const value = src?.trim();
  if (!value) return null;
  const ok =
    value.startsWith("/") ||
    value.startsWith("http://") ||
    value.startsWith("https://");
  if (!ok) return null;
  return { src: value, unoptimized: !value.startsWith("/") };
}
