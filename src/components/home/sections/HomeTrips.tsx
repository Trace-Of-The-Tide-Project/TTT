import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { theme } from "@/lib/theme";
import type { HomeTrip } from "@/lib/home/fetch-home-data";
import { HomeSectionShell } from "./HomeSectionShell";

/**
 * Heritage trips — visually rich (client launch priority). A large
 * lead card + smaller siblings. Hidden when empty.
 */
export function HomeTrips({
  trips,
  heading,
  subheading,
  viewAllHref,
  viewAllLabel,
  dir,
}: {
  trips: HomeTrip[];
  heading: string;
  subheading?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  dir?: "rtl" | "ltr";
}) {
  if (trips.length === 0) return null;
  const [lead, ...rest] = trips;

  return (
    <HomeSectionShell
      anchorId="home-trips"
      heading={heading}
      subheading={subheading}
      viewAllHref={viewAllHref}
      viewAllLabel={viewAllLabel}
      dir={dir}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {lead ? <TripCard trip={lead} large /> : null}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2">
          {rest.slice(0, 2).map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </div>
    </HomeSectionShell>
  );
}

function TripCard({ trip, large }: { trip: HomeTrip; large?: boolean }) {
  return (
    <Link
      href={trip.href}
      className={`group relative block overflow-hidden rounded-2xl border ${
        large ? "aspect-[4/3] lg:aspect-auto lg:h-full" : "aspect-[16/9]"
      }`}
      style={{ borderColor: theme.cardBorder }}
    >
      {trip.image ? (
        <Image
          src={trip.image}
          alt={trip.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          sizes={large ? "(min-width: 1024px) 48vw, 90vw" : "(min-width: 1024px) 24vw, 90vw"}
          loading="lazy"
          unoptimized
        />
      ) : (
        <div className="absolute inset-0" style={{ backgroundColor: "var(--tott-well-bg)" }} />
      )}
      <div
        className="absolute inset-x-0 bottom-0 p-5"
        style={{ background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.8) 100%)" }}
      >
        {trip.routeSummary ? (
          <p className="text-xs font-medium uppercase tracking-wide text-white/80">
            {trip.routeSummary}
          </p>
        ) : null}
        <h3 className={`mt-1 line-clamp-2 font-medium text-white ${large ? "text-2xl" : "text-lg"}`}>
          {trip.title}
        </h3>
      </div>
    </Link>
  );
}
