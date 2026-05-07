"use client";

import type { CSSProperties, ReactNode } from "react";

type ChamferedSurfaceProps = {
  children?: ReactNode;
  className?: string;
  /** Chamfer cut size in px (clipped equally on x/y at every corner). */
  chamfer?: number;
  /** Optional hairline border color drawn just inside the chamfered edge. */
  borderColor?: string;
  /** Color shown in the 1px gap between the border and inner content. */
  innerFill?: string;
  /** Inline style applied to the clipped surface (e.g. backgroundImage). */
  style?: CSSProperties;
  /** Optional id (forwarded to the wrapper, useful for aria/scroll targets). */
  id?: string;
};

const polygon = (c: number) =>
  `polygon(${c}px 0, calc(100% - ${c}px) 0, 100% ${c}px, 100% calc(100% - ${c}px), calc(100% - ${c}px) 100%, ${c}px 100%, 0 calc(100% - ${c}px), 0 ${c}px)`;

/**
 * Octagonal "chamfered" surface — same corner-cut silhouette as
 * `ChamferedFrame`, but it actually *clips* its children (image, gradient,
 * content) instead of just drawing an outline. Use this for hero cards,
 * featured publication panels — anywhere a real surface needs the chamfer.
 *
 * `borderColor` is rendered by stacking a slightly-larger clipped layer
 * underneath the content so the visible 1px ring traces the chamfered edge.
 * (A plain CSS `border` would be cut by `clip-path` and round the corners.)
 */
export function ChamferedSurface({
  children,
  className,
  chamfer = 20,
  borderColor,
  innerFill = "var(--tott-home-surface)",
  style,
  id,
}: ChamferedSurfaceProps) {
  const clip = polygon(chamfer);
  return (
    <div
      id={id}
      className={`relative ${className ?? ""}`}
      style={{ ...style, clipPath: clip, WebkitClipPath: clip }}
    >
      {borderColor ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 block"
          style={{
            background: borderColor,
            clipPath: clip,
            WebkitClipPath: clip,
          }}
        >
          <span
            className="absolute inset-px block"
            style={{
              background: innerFill,
              clipPath: polygon(Math.max(chamfer - 1, 0)),
              WebkitClipPath: polygon(Math.max(chamfer - 1, 0)),
            }}
          />
        </span>
      ) : null}
      {children}
    </div>
  );
}
