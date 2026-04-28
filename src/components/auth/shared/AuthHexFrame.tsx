import type { CSSProperties } from "react";
import { TOTT_AUTH_HEX_CLIP_PATH } from "./authHexClipPath";

type AuthHexFrameProps = {
  children: React.ReactNode;
  className?: string;
  maxWidthClass?: string;
  bodyClassName?: string;
};

const HEX_CLIP_STYLE: CSSProperties = {
  clipPath: TOTT_AUTH_HEX_CLIP_PATH,
  WebkitClipPath: TOTT_AUTH_HEX_CLIP_PATH,
};

const CARD_VIEWBOX_W = 362;
const CARD_VIEWBOX_H = 437;

/** Left/right offset matches the hex safe-zone edge (~10.36% of width). */
const DEFAULT_BODY_PADDING = "px-6 sm:px-8";

/**
 * Auth hex card. Height fills the flex parent; width is derived from the
 * Card.svg aspect ratio so the hex never overflows vertically.
 */
export function AuthHexFrame({
  children,
  className,
  maxWidthClass = "max-w-3xl",
  bodyClassName,
}: AuthHexFrameProps) {
  return (
    <div className={`tott-auth-card-shell relative h-full flex items-center justify-center mx-auto w-full ${maxWidthClass} ${className ?? ""}`}>
      <div
        className="tott-auth-shell-enter relative"
        style={{
          height: "min(calc(100dvh - 180px), 720px)",
          aspectRatio: `${CARD_VIEWBOX_W} / ${CARD_VIEWBOX_H}`,
          width: "auto",
          maxWidth: "100%",
        }}
      >
        {/* Gold outer ring */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ ...HEX_CLIP_STYLE, background: "var(--tott-auth-hex-outer)" }}
        />
        {/* Dark inner fill */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-[3px]"
          style={{
            ...HEX_CLIP_STYLE,
            background: "var(--tott-auth-hex-inner)",
            boxShadow: "inset 0 0 0 1px var(--tott-auth-hex-inset-ring)",
          }}
        />
        {/* Content — constrained to the hex safe zone (30 %–70 % vertically, 11 %–89 % horizontally) */}
        <div
          className={`absolute flex flex-col justify-center overflow-y-auto ${bodyClassName ?? DEFAULT_BODY_PADDING}`}
          style={{ top: "25%", bottom: "25%", left: "11%", right: "11%" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
