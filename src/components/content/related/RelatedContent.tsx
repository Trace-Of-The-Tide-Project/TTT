import { Link } from "@/i18n/navigation";
import { theme } from "@/lib/theme";
import { RelatedContentCard, type RelatedContentCardData } from "./RelatedContentCard";

type RelatedContentProps = {
  items: RelatedContentCardData[];
  viewMoreHref?: string;
};

function RelatedContentHexBackground() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1200 200"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M60 20l16 9v18l-16 9-16-9V29l16-9z"
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="1"
      />
      <path
        d="M90 70l16 9v18l-16 9-16-9V79l16-9z"
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="1"
      />
      <path
        d="M1110 30l16 9v18l-16 9-16-9V39l16-9z"
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="1"
      />
      <path
        d="M1140 80l16 9v18l-16 9-16-9V89l16-9z"
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth="1"
      />
    </svg>
  );
}

export function RelatedContent({ items, viewMoreHref = "#" }: RelatedContentProps) {
  return (
    <section className="relative py-10 sm:py-14" style={{ backgroundColor: theme.pageBackground }}>
      <RelatedContentHexBackground />
      <div className="relative mx-auto max-w-6xl px-6 sm:px-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold" style={{ color: theme.accentGold }}>
              Related content
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Lorem ipsum dolor sit amet adipiscing elit.
            </p>
          </div>
          <Link
            href={viewMoreHref}
            className="flex shrink-0 items-center gap-1 text-sm font-medium hover:underline"
            style={{ color: theme.accentGold }}
          >
            View more <span>→</span>
          </Link>
        </div>

        <div
          className="related-scroll -mx-6 mt-6 overflow-x-auto pb-4 sm:-mx-10"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <style>{`
            .related-scroll::-webkit-scrollbar { display: none; }
          `}</style>
          <div className="flex" style={{ marginLeft: "-138px", paddingRight: "138px", gap: 0 }}>
            {items.map((item, i) => (
              <RelatedContentCard key={i} {...item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
