import { Link } from "@/i18n/navigation";

/**
 * Section header (Figma `Program Page Header`, 1128×48): title + standfirst
 * on the start edge, "View more →" on the end edge. Follows the Voices
 * "View more" pattern (gold link + tott-archive-arrow svg) rather than
 * inventing a fourth variant.
 */
export function V3SectionHeader({
  id,
  title,
  standfirst,
  viewMoreLabel,
  viewMoreHref,
}: {
  id: string;
  title: string;
  standfirst: string;
  viewMoreLabel: string;
  viewMoreHref: string;
}) {
  return (
    <div className="mx-auto flex max-w-6xl items-end justify-between gap-4 px-6 sm:px-10">
      <div id={id}>
        <h2 className="font-['IBM_Plex_Sans'] text-2xl font-medium text-[var(--tott-home-text-warm)]">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-5 text-[var(--tott-salt)]">{standfirst}</p>
      </div>
      <Link
        href={viewMoreHref}
        className="tott-archive-viewall group inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-medium text-[var(--tott-gold-primary)] transition-colors hover:text-[var(--tott-gold-bright)] focus-visible:text-[var(--tott-gold-bright)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--tott-gold-bright)]"
      >
        {viewMoreLabel}
        <svg
          aria-hidden
          className="tott-archive-arrow"
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 6 15 12 9 18" />
        </svg>
      </Link>
    </div>
  );
}
