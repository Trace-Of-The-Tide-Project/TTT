"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { coverSrc, FALLBACK_IMAGE } from "@/lib/content/article-media-url";
import { framingStyle, type ImageFraming } from "@/lib/image-framing";

export type FramedImageProps = ImageProps & {
  /** Per-placement framing. Omitted or undefined renders exactly as before. */
  framing?: ImageFraming;
};

/**
 * Image with admin-set framing, a broken-URL fallback, and src normalization.
 *
 * String sources go through `coverSrc` here rather than at each call site:
 * next/image throws during render (dev only) on a src that is neither a
 * leading-slash path nor an absolute URL, and `onError` cannot catch a
 * render-time throw. Admin editors bind image fields straight to a text input,
 * so a preview renders half-typed values like "h" on every keystroke.
 * Normalizing centrally means no caller can reintroduce that crash; coverSrc
 * passes absolute URLs through untouched, so double-normalizing is a no-op.
 *
 * `onError` still covers the different case of a present-but-dead URL (expired
 * signed link, deleted object), which would otherwise render as an empty box.
 *
 * Server components that only need framing should use `framingStyle()` on
 * their existing <Image> instead of adopting this — it keeps them server-side.
 */
export function FramedImage({ src, alt, framing, style, ...rest }: FramedImageProps) {
  const [failed, setFailed] = useState(false);
  const resolved = typeof src === "string" ? coverSrc(src) : src;
  return (
    <Image
      {...rest}
      alt={alt}
      src={failed ? FALLBACK_IMAGE : resolved}
      style={{ ...style, ...framingStyle(framing) }}
      onError={() => setFailed(true)}
    />
  );
}
