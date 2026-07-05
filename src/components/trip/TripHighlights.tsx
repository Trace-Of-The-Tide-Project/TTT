import { theme } from "@/lib/theme";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";

type TripHighlightsProps = {
  highlights: string[];
};

function CheckIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function TripHighlights({ highlights }: TripHighlightsProps) {
  const midpoint = Math.ceil(highlights.length / 2);
  const left = highlights.slice(0, midpoint);
  const right = highlights.slice(midpoint);

  return (
    <RevealOnScroll>
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        Trip highlights
      </h2>
      <div className="grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
        {[left, right].map((col, ci) => (
          <ul key={ci} className="space-y-2.5">
            {col.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/75">
                <span className="mt-0.5 shrink-0" style={{ color: theme.accentGold }}>
                  <CheckIcon />
                </span>
                {item}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </RevealOnScroll>
  );
}
