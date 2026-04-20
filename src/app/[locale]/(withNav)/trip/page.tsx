import { ShareYourStory } from "@/components/contribute/ShareYourStory";
import { TripHero } from "@/components/trip/TripHero";
import { TripDetailsBar, DEFAULT_TRIP_ICONS } from "@/components/trip/TripDetailsBar";
import { TripBookingForm } from "@/components/trip/TripBookingForm";
import { TripHighlights } from "@/components/trip/TripHighlights";
import { TripTimeline } from "@/components/trip/TripTimeline";
import { theme } from "@/lib/theme";
import {
  TRIP_HERO,
  TRIP_DETAILS,
  TRIP_HIGHLIGHTS,
  TRIP_ABOUT,
  TRIP_TIMELINE,
} from "@/lib/constants";
import { tripDisplayPriceLabel } from "@/services/trips.service";

const DEMO_TRIP_PRICE = { min: "600", currency: "USD" as const };

const DETAILS = TRIP_DETAILS.map((d) => ({
  ...d,
  icon: DEFAULT_TRIP_ICONS[
    d.label.toLowerCase().replace(" ", "") as keyof typeof DEFAULT_TRIP_ICONS
  ] ?? DEFAULT_TRIP_ICONS.calendar,
}));

export default function TripPage() {
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: theme.pageBackground }}>
      {/* Hero */}
      <TripHero
        image={TRIP_HERO.image}
        title={TRIP_HERO.title}
        price={tripDisplayPriceLabel({
          price: DEMO_TRIP_PRICE.min,
          currency: DEMO_TRIP_PRICE.currency,
        })}
        difficulty={TRIP_HERO.difficulty}
        from={TRIP_HERO.from}
        to={TRIP_HERO.to}
      />

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10 sm:py-14">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-8">
          {/* Left column */}
          <div className="flex min-w-0 flex-1 flex-col gap-10">
            <TripDetailsBar items={DETAILS} />

            {/* About */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                About this trip
              </h2>
              <p className="text-sm leading-relaxed text-gray-400">
                {TRIP_ABOUT}
              </p>
            </div>

            <TripHighlights highlights={[...TRIP_HIGHLIGHTS]} />
            <TripTimeline entries={[...TRIP_TIMELINE]} />
          </div>

          {/* Right sidebar */}
          <div className="w-full shrink-0 lg:sticky lg:top-6 lg:w-80">
            <TripBookingForm minPrice={DEMO_TRIP_PRICE.min} currency={DEMO_TRIP_PRICE.currency} />
          </div>
        </div>
      </div>

      <ShareYourStory />
    </div>
  );
}
