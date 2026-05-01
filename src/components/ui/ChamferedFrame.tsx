"use client";

import type { CSSProperties, ReactNode } from "react";

type ChamferedFrameProps = {
  children?: ReactNode;
  className?: string;
  borderColor?: string;
  /** Corner size in px (chamfer cut depth). Default 25. Use ~10 for small buttons. */
  size?: number;
};

export function ChamferedFrame({
  className,
  borderColor = "var(--tott-card-border)",
  size = 25,
}: ChamferedFrameProps) {
  const stroke: CSSProperties = { stroke: borderColor };
  const fill: CSSProperties = { background: borderColor };
  const edgeInset = `${size - 0.5}px`;

  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className ?? ""}`}
    >
      <svg
        className="absolute left-0 top-0"
        width={size}
        height={size}
        viewBox="0 0 25 25"
        fill="none"
      >
        <path
          d="M24.5 0.5H19.8137C17.692 0.5 15.6571 1.34285 14.1569 2.84314L2.84315 14.1569C1.34285 15.6571 0.5 17.692 0.5 19.8137V24.5"
          style={stroke}
        />
      </svg>
      <svg
        className="absolute right-0 top-0"
        width={size}
        height={size}
        viewBox="0 0 25 25"
        fill="none"
      >
        <path
          d="M0.5 0.5H5.1863C7.30797 0.5 9.3429 1.34285 10.8431 2.84314L22.1569 14.1569C23.6571 15.6571 24.5 17.692 24.5 19.8137V24.5"
          style={stroke}
        />
      </svg>
      <svg
        className="absolute left-0 bottom-0"
        width={size}
        height={size}
        viewBox="0 0 25 25"
        fill="none"
      >
        <path
          d="M24.5 24.5H19.8137C17.692 24.5 15.6571 23.6571 14.1569 22.1569L2.84315 10.8431C1.34285 9.3429 0.5 7.30797 0.5 5.1863V0.5"
          style={stroke}
        />
      </svg>
      <svg
        className="absolute right-0 bottom-0"
        width={size}
        height={size}
        viewBox="0 0 25 25"
        fill="none"
      >
        <path
          d="M0.5 24.5H5.1863C7.30797 24.5 9.3429 23.6571 10.8431 22.1569L22.1569 10.8431C23.6571 9.3429 24.5 7.30797 24.5 5.1863V0.5"
          style={stroke}
        />
      </svg>
      <span className="absolute top-0 h-px" style={{ ...fill, left: edgeInset, right: edgeInset }} />
      <span className="absolute bottom-0 h-px" style={{ ...fill, left: edgeInset, right: edgeInset }} />
      <span className="absolute left-0 w-px" style={{ ...fill, top: edgeInset, bottom: edgeInset }} />
      <span className="absolute right-0 w-px" style={{ ...fill, top: edgeInset, bottom: edgeInset }} />
    </span>
  );
}
