"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

const FALLBACK_IMAGE = "/images/image.png";

/**
 * Cover image with a client-side broken-URL fallback. `coverSrc()` already
 * substitutes the house placeholder when a ref is missing, but a
 * present-but-dead URL (expired signed GCS link, deleted object) still
 * reaches `next/image` and renders as an empty box — `onError` catches
 * that case and swaps to the same placeholder.
 */
export function MagImage({ src, alt, ...rest }: ImageProps) {
  const [failed, setFailed] = useState(false);
  return (
    <Image
      {...rest}
      alt={alt}
      src={failed ? FALLBACK_IMAGE : src}
      onError={() => setFailed(true)}
    />
  );
}
