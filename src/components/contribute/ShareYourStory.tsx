import { Link } from "@/i18n/navigation";
import { theme } from "@/lib/theme";

type HexProps = { cx: number; cy: number; r: number };

function hexPath(cx: number, cy: number, r: number) {
  const corners = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
  const rounding = r * 0.18;
  let d = "";
  for (let i = 0; i < 6; i++) {
    const prev = corners[(i + 5) % 6];
    const curr = corners[i];
    const next = corners[(i + 1) % 6];
    const dx1 = curr.x - prev.x, dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x, dy2 = next.y - curr.y;
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

const R = 32;

const HEXAGONS: HexProps[] = [
  // Row 1 — left groups
  { cx: 110, cy: 78, r: R },
  { cx: 185, cy: 78, r: R },
  { cx: 400, cy: 78, r: R },
  { cx: 475, cy: 78, r: R },
  // Row 1 — center 4 (icon sits at cx 750 between them)
  { cx: 600, cy: 78, r: R },
  { cx: 675, cy: 78, r: R },
  { cx: 825, cy: 78, r: R },
  { cx: 900, cy: 78, r: R },
  // Row 1 — right groups
  { cx: 1025, cy: 78, r: R },
  { cx: 1100, cy: 78, r: R },
  { cx: 1315, cy: 78, r: R },
  { cx: 1390, cy: 78, r: R },
  // Row 2 — bottom
  { cx: 50, cy: 235, r: R },
  { cx: 125, cy: 235, r: R },
  { cx: 200, cy: 235, r: R },
  { cx: 420, cy: 235, r: R },
  { cx: 495, cy: 235, r: R },
  { cx: 720, cy: 235, r: R },
  { cx: 795, cy: 235, r: R },
  { cx: 870, cy: 235, r: R },
  { cx: 1100, cy: 235, r: R },
  { cx: 1175, cy: 235, r: R },
  { cx: 1250, cy: 235, r: R },
];

function ScatteredHexBackground() {
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 1500 300"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      {HEXAGONS.map((h, i) => (
        <path
          key={i}
          d={hexPath(h.cx, h.cy, h.r)}
          fill="none"
          stroke="#bbbbbb"
          strokeWidth="1.2"
          strokeOpacity="0.14"
        />
      ))}
      {/* Icon badge at center of row 1 */}
      <path
        d={hexPath(750, 78, R)}
        fill="#1a1a1a"
        stroke="#3a3a3a"
        strokeWidth="1.2"
      />
      <g
        transform="translate(742.5, 71) scale(0.5)"
        stroke="#CBA158"
        fill="none"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M25.75 27.4167L22.4167 24.0833V4.08333C22.4167 2.215 23.8817 0.75 25.75 0.75C27.6183 0.75 29.0833 2.215 29.0833 4.08333V24.0833L25.75 27.4167ZM25.75 27.4167H4.08333C3.19928 27.4167 2.35143 27.0655 1.72631 26.4404C1.10119 25.8152 0.75 24.9674 0.75 24.0833C0.75 23.1993 1.10119 22.3514 1.72631 21.7263C2.35143 21.1012 3.19928 20.75 4.08333 20.75H10.75C11.6341 20.75 12.4819 20.3988 13.107 19.7737C13.7321 19.1486 14.0833 18.3007 14.0833 17.4167C14.0833 16.5326 13.7321 15.6848 13.107 15.0596C12.4819 14.4345 11.6341 14.0833 10.75 14.0833H5.75M22.4167 7.41667H29.0833" />
      </g>
    </svg>
  );
}

export function ShareYourStory() {
  return (
    <section className="relative w-full overflow-hidden py-16 sm:py-20">
      <div className="absolute inset-0" style={{ backgroundColor: theme.pageBackground }} />
      <div className="absolute inset-0">
        <ScatteredHexBackground />
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 pt-24">
        <h2 className="text-center text-xl font-semibold text-foreground sm:text-2xl">
          Share your story
        </h2>

        <p className="mt-3 max-w-xl text-center text-sm leading-relaxed text-[#999999] sm:text-base">
          Every story matters. Help us preserve the collective memory by contributing your personal
          experiences, testimonies, or knowledge of historical events.
        </p>

        <Link
          href="/contribute"
          className="mt-8 inline-block select-none rounded-lg px-8 py-3.5 text-base font-medium text-[#1a1a1a] transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{ backgroundColor: theme.accentGold }}
        >
          Contribute Now!
        </Link>
      </div>
    </section>
  );
}
