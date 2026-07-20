import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { StaggerContainer } from "@/components/motion/StaggerContainer";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { SectionShell } from "@/components/home/SectionShell";
import { ChamferedSurface } from "@/components/ui/ChamferedSurface";
import { dirFor } from "@/i18n/dir";
import { MagImage } from "./MagImage";
import type { WriterCard } from "./data";
import { coverSrc, initial } from "./ui";

/**
 * Voices of the magazine — the masthead, one voice given room.
 *
 * The PORTRAIT is load-bearing, the words are additive: the section is a real
 * design at name+avatar only, and gains a voice line (quote → headline →
 * themes) as profiles fill in. Nothing is reserved for content that isn't there.
 *
 * Chamfered square plates in a uniform grid, deliberately:
 *  - The old `flex-wrap` of 48px circles wrapped 5-then-2 and dumped leftover
 *    space at the end side of every short row. Grid tracks are equal, so an
 *    intra-row void is impossible.
 *  - The first writer takes a 2x2 lead cell at lg (8 items → exactly 2 rows).
 *    A masthead gives one voice room and lists the rest; a uniform 4-up of
 *    equals is a team page.
 *  - Round avatar + quote + name is MagFounderNote's silhouette, rendered
 *    directly above. Square chamfered plates share none of it, and chamfer/hex
 *    is the TTT signature and was unused on this page.
 *
 * Server component: the only motion is fadeUp (transform+opacity), which the
 * global `MotionConfig reducedMotion="user"` degrades on its own. No
 * `useReducedMotion` consumer → no client boundary; StaggerContainer/Item and
 * MagImage stay the client leaves.
 */

const DISPLAY_TYPE = {
  lineHeight: "var(--tott-display-leading)",
  letterSpacing: "var(--tott-display-tracking)",
} as const;

/** The only secondary-text token that clears 4.5:1 on --tott-home-surface in
 *  all three themes (dark 7.06, light 10.04, tide 7.63). --tott-salt fails
 *  light/tide (~3.5) and --tott-home-text-muted fails dark (~4.1). */
const SECONDARY = "text-[var(--tott-home-text-heading)]";

export async function MagVoices({
  writers,
  locale,
}: {
  writers: WriterCard[];
  locale: string;
}) {
  // Matches every sibling section on this page: absent content removes the
  // section rather than announcing itself.
  if (writers.length === 0) return null;

  const t = await getTranslations("MagazineNext.voices");

  return (
    <SectionShell
      id="magazine-voices"
      eyebrow={t("eyebrow")}
      title={t("title")}
      standfirst={t("standfirst")}
    >
      <StaggerContainer
        role="list"
        className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12"
      >
        {writers.map((w, i) => {
          const lead = i === 0;
          return (
            <StaggerItem
              key={w.id}
              role="listitem"
              className={lead ? "lg:col-span-2 lg:row-span-2" : undefined}
            >
              {/* The link wraps the plate + name only. The voice line is a
                  sibling: line-clamp is visual, so an in-link quote would put
                  the whole untruncated paragraph into the link's accessible
                  name and make the links list unscannable. */}
              <Link
                href={`/writers/${encodeURIComponent(w.id)}`}
                className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--tott-gold-bright)]"
              >
                {/* Portraits are photographs of people: never mirrored in RTL.
                    Only the grid's flow direction flips, which `dir` does free. */}
                <ChamferedSurface
                  chamfer={lead ? 20 : 12}
                  // The border layer sits UNDER the children, so a `fill` image
                  // at inset-0 would bury it. Only the initials plate can show
                  // a hairline — and it needs one: --tott-elevated is ~1.05:1
                  // against --tott-home-surface in light and tide, i.e. no tile
                  // at all without the ring.
                  borderColor={w.avatar ? undefined : "var(--tott-gold-muted)"}
                  innerFill="color-mix(in srgb, var(--tott-gold-bright) 18%, var(--tott-elevated))"
                  className="aspect-square w-full bg-[var(--tott-elevated)]"
                >
                  {w.avatar ? (
                    // ponytail: no grayscale filter. `.tott-voices-portrait` is
                    // hover-gated, and hover never fires on touch — an 8-cell
                    // grid permanently grey on phones reads as a failed load.
                    // Known ceiling: an expired GCS signed URL falls to
                    // MagImage's house placeholder, not to this card's initials
                    // plate. Fix when a client error boundary is worth it.
                    <MagImage
                      src={coverSrc(w.avatar)}
                      // Decorative: the name below is the link's accessible
                      // name; alt here would announce every writer twice.
                      alt=""
                      framing={w.avatarFraming}
                      fill
                      sizes={
                        lead
                          ? "(min-width: 1024px) 500px, (min-width: 640px) 30vw, 45vw"
                          : "(min-width: 1024px) 250px, (min-width: 640px) 30vw, 45vw"
                      }
                      className="object-cover"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className={`absolute inset-0 grid place-items-center font-display text-[var(--tott-gold-bright)] ${
                        lead ? "text-6xl" : "text-4xl sm:text-5xl"
                      }`}
                      style={DISPLAY_TYPE}
                    >
                      {initial(w.name)}
                    </span>
                  )}
                </ChamferedSurface>

                <h3
                  lang={w.lang ?? undefined}
                  dir={dirFor(w.lang ?? locale)}
                  className={`mt-4 line-clamp-2 font-display text-[var(--tott-home-text-warm)] transition-colors group-hover:text-[var(--tott-gold-bright)] ${
                    lead ? "text-lg sm:text-2xl" : "text-base sm:text-lg"
                  }`}
                  style={{
                    ...DISPLAY_TYPE,
                    transitionDuration: "var(--tott-motion-duration-hover)",
                  }}
                >
                  {w.name}
                </h3>
              </Link>

              <VoiceLine writer={w} locale={locale} lead={lead} />
            </StaggerItem>
          );
        })}
      </StaggerContainer>
    </SectionShell>
  );
}

/**
 * The degradation ladder, in priority order. Rungs are independent: a writer
 * with a quote but no headline and one with a headline but no quote both render
 * a full card. Returns null when the profile carries nothing but a name — and
 * nothing is reserved for that case, so a sparse roster leaves no dead air.
 */
function VoiceLine({
  writer,
  locale,
  lead,
}: {
  writer: WriterCard;
  locale: string;
  lead: boolean;
}) {
  // The writer's language, not the reader's: an Arabic quote under an English
  // UI must set RTL and lang on its own paragraph (an English TTS voice reading
  // Arabic is unintelligible).
  const lang = writer.lang ?? undefined;
  const dir = dirFor(writer.lang ?? locale);

  if (writer.quote) {
    return (
      <blockquote
        lang={lang}
        dir={dir}
        className={`mt-2 line-clamp-3 font-display text-[var(--tott-home-text-warm)] ${
          lead ? "text-base sm:text-xl" : "text-sm"
        }`}
        style={DISPLAY_TYPE}
      >
        {/* Opening mark only: the closing one is eaten by the clamp on any
            quote long enough to truncate. As a bidi-neutral character it lands
            at the visual right of an RTL run automatically. */}
        <span aria-hidden className="text-[var(--tott-gold-primary)]">
          &ldquo;
        </span>
        {writer.quote}
      </blockquote>
    );
  }

  if (writer.headline) {
    return (
      <p
        lang={lang}
        dir={dir}
        className={`mt-2 line-clamp-2 text-sm ${SECONDARY}`}
      >
        {writer.headline}
      </p>
    );
  }

  if (writer.themes.length > 0) {
    return (
      <ul
        lang={lang}
        dir={dir}
        className={`mt-2 flex flex-wrap gap-2 text-xs ${SECONDARY}`}
      >
        {writer.themes.map((theme) => (
          <li
            key={theme}
            className="border border-[color-mix(in_srgb,var(--tott-home-text-heading)_60%,transparent)] px-2 py-1"
          >
            {theme}
          </li>
        ))}
      </ul>
    );
  }

  return null;
}
