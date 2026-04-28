"use client";

// Sparse hex positions extracted from the Figma 404 design (1440×1024 canvas)
const HEX_POSITIONS: [number, number][] = [
  [48, 44], [48, 668], [96, 148], [96, 980],
  [144, 460], [144, 668], [144, 876], [192, 356],
  [192, 564], [192, 980], [240, 252], [288, 148],
  [288, 356], [288, 980], [336, 460], [336, 668],
  [384, 148], [384, 356], [384, 564], [384, 772],
  [384, 980], [432, 44], [432, 876], [528, 44],
  [528, 252], [528, 460], [528, 876], [576, 148],
  [576, 356], [576, 564], [576, 772], [624, 252],
  [624, 668], [624, 876], [672, 148], [672, 980],
  [720, 460], [768, 356], [768, 772], [816, 460],
  [816, 876], [864, 148], [864, 356], [864, 564],
  [864, 772], [912, 44], [912, 876], [960, 564],
  [960, 772], [1008, 44], [1008, 252], [1008, 668],
  [1056, 564], [1056, 772], [1056, 980], [1104, 44],
  [1104, 252], [1104, 876], [1152, 356], [1152, 564],
  [1152, 980], [1248, 148], [1296, 44], [1296, 460],
  [1296, 876], [1344, 980], [1392, 44], [1392, 252],
  [1392, 668], [1440, 772], [1440, 980],
];

const R = 42;
const ROUNDING = R * 0.12;

function hexPath(cx: number, cy: number): string {
  // Pointy-top hexagon with rounded corners
  const angles = [
    -Math.PI / 6, Math.PI / 6, Math.PI / 2,
    (5 * Math.PI) / 6, (7 * Math.PI) / 6, (3 * Math.PI) / 2,
  ];
  const corners = angles.map((a) => ({
    x: cx + R * Math.cos(a),
    y: cy + R * Math.sin(a),
  }));
  let d = "";
  for (let i = 0; i < 6; i++) {
    const prev = corners[(i + 5) % 6];
    const curr = corners[i];
    const next = corners[(i + 1) % 6];
    const dx1 = curr.x - prev.x, dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x, dy2 = next.y - curr.y;
    const len1 = Math.hypot(dx1, dy1);
    const len2 = Math.hypot(dx2, dy2);
    const sx = curr.x - (dx1 / len1) * ROUNDING;
    const sy = curr.y - (dy1 / len1) * ROUNDING;
    const ex = curr.x + (dx2 / len2) * ROUNDING;
    const ey = curr.y + (dy2 / len2) * ROUNDING;
    d += i === 0 ? `M${sx},${sy}` : `L${sx},${sy}`;
    d += `Q${curr.x},${curr.y} ${ex},${ey}`;
  }
  return d + "Z";
}

const allPaths = HEX_POSITIONS.map(([cx, cy]) => hexPath(cx, cy)).join(" ");

export default function HexBackground404() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1440 1024"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d={allPaths}
        fill="none"
        stroke="var(--tott-auth-hex-stroke)"
        strokeWidth="1"
        strokeOpacity="var(--tott-auth-hex-stroke-opacity)"
      />
    </svg>
  );
}
