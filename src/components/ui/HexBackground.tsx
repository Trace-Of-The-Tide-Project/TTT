"use client";

import { useId, useState, useEffect } from "react";
import { motion } from "motion/react";
import { useIdle } from "@/hooks/useIdle";
import { springs } from "@/lib/motion";

function roundedHexPath(cx: number, cy: number, r: number) {
  const angles = [
    -Math.PI / 6,
    Math.PI / 6,
    Math.PI / 2,
    (5 * Math.PI) / 6,
    (7 * Math.PI) / 6,
    (3 * Math.PI) / 2,
  ];
  const corners = angles.map((a) => ({
    x: cx + r * Math.cos(a),
    y: cy + r * Math.sin(a),
  }));
  const rounding = r * 0.18;
  let d = "";
  for (let i = 0; i < 6; i++) {
    const prev = corners[(i + 5) % 6];
    const curr = corners[i];
    const next = corners[(i + 1) % 6];
    const dx1 = curr.x - prev.x,
      dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x,
      dy2 = next.y - curr.y;
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    const sx = curr.x - (dx1 / len1) * rounding;
    const sy = curr.y - (dy1 / len1) * rounding;
    const ex = curr.x + (dx2 / len2) * rounding;
    const ey = curr.y + (dy2 / len2) * rounding;
    if (i === 0) d += `M${sx},${sy}`;
    else d += `L${sx},${sy}`;
    d += `Q${curr.x},${curr.y} ${ex},${ey}`;
  }
  return d + "Z";
}

const R = 24;

const ROW1_CENTERS = [
  { cx: 21, cy: 24 },
  { cx: 63, cy: 24 },
  { cx: 105, cy: 24 },
  { cx: 147, cy: 24 },
];
const ROW2_CENTERS = [
  { cx: 42, cy: 60 },
  { cx: 84, cy: 60 },
  { cx: 126, cy: 60 },
];

const row1Path = ROW1_CENTERS.map((c) => roundedHexPath(c.cx, c.cy, R)).join("");
const row2Path = ROW2_CENTERS.map((c) => roundedHexPath(c.cx, c.cy, R)).join("");

export default function HexBackground() {
  const id = useId();
  const isIdle = useIdle({ timeout: 2500 });
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const patternId = `hexagons-${id.replace(/:/g, "")}`;
  const gradientId = `hex-fade-${id.replace(/:/g, "")}`;
  const maskId = `hex-mask-${id.replace(/:/g, "")}`;

  if (!mounted) return null;

  return (
    <motion.svg
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMin slice"
      animate={{ opacity: isIdle ? 0.85 : 1 }}
      transition={
        isIdle
          ? { ...springs.breath, repeat: Infinity, repeatType: "reverse" }
          : { duration: 0.4 }
      }
    >
      <defs>
        <pattern id={patternId} x="0" y="0" width="168" height="72" patternUnits="userSpaceOnUse">
          <path
            d={row1Path}
            fill="none"
            stroke="var(--tott-auth-hex-stroke)"
            strokeWidth="0.5"
            strokeOpacity="var(--tott-auth-hex-stroke-opacity)"
          />
          <path
            d={row2Path}
            fill="none"
            stroke="var(--tott-auth-hex-stroke)"
            strokeWidth="0.5"
            strokeOpacity="var(--tott-auth-hex-stroke-opacity)"
          />
        </pattern>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--tott-auth-hex-mask-from)" stopOpacity="1" />
          <stop offset="70%" stopColor="var(--tott-auth-hex-mask-from)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--tott-auth-hex-mask-to)" stopOpacity="0" />
        </linearGradient>
        <mask id={maskId}>
          <rect width="100%" height="100%" fill={`url(#${gradientId})`} />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} mask={`url(#${maskId})`} />
    </motion.svg>
  );
}
