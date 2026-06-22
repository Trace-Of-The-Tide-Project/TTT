import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { theme } from "@/lib/theme";
import type { HomePerson } from "@/lib/home/fetch-home-data";
import { HomeSectionShell } from "./HomeSectionShell";

function year(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : String(d.getFullYear());
}

/** Birth–death year range, bidi-safe (uses an en dash, not a hyphen run). */
function lifespan(birth: string | null, death: string | null): string | null {
  const b = year(birth);
  const d = year(death);
  if (!b && !d) return null;
  if (b && d) return `${b}–${d}`;
  if (b) return `${b}–`;
  return `–${d}`;
}

/**
 * People of the archive — biographical entries with portraits and life
 * dates (e.g. Mahmoud Darwish). Hidden when empty.
 */
export function HomePeople({
  people,
  heading,
  subheading,
  viewAllHref,
  viewAllLabel,
  dir,
}: {
  people: HomePerson[];
  heading: string;
  subheading?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  dir?: "rtl" | "ltr";
}) {
  if (people.length === 0) return null;

  return (
    <HomeSectionShell
      anchorId="home-people"
      heading={heading}
      subheading={subheading}
      viewAllHref={viewAllHref}
      viewAllLabel={viewAllLabel}
      dir={dir}
    >
      <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        {people.slice(0, 10).map((person) => {
          const dates = lifespan(person.birthDate, person.deathDate);
          const initial = person.name.slice(0, 1).toUpperCase();
          return (
            <li key={person.id}>
              <Link href={person.href} className="group flex flex-col items-center text-center">
                <div
                  className="relative aspect-square w-full overflow-hidden rounded-full border"
                  style={{ borderColor: theme.cardBorder }}
                >
                  {person.image ? (
                    <Image
                      src={person.image}
                      alt={person.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                      sizes="(min-width: 1024px) 16vw, 40vw"
                      loading="lazy"
                      unoptimized
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-2xl font-medium"
                      style={{ backgroundColor: "var(--tott-well-bg)", color: theme.accentGold }}
                    >
                      {initial}
                    </div>
                  )}
                </div>
                <p className="mt-3 line-clamp-1 text-sm font-medium text-foreground">
                  {person.name}
                </p>
                {dates ? (
                  <p className="text-xs text-[var(--tott-muted)]" dir="ltr">
                    {dates}
                  </p>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </HomeSectionShell>
  );
}
